from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.services.analytics import (
    compute_savings_rate,
    get_spending_by_category,
    get_overspend_categories,
    project_goal_completion,
)


# ── Rule functions ────────────────────────────────────────────
# Each rule takes (db, user_id, config) and returns an alert dict or None.


def rule_budget_overspend(db: Session, user_id: int, config: dict) -> list[dict]:
    """Alert when any category exceeds its budget limit."""
    days = config.get("lookback_days", 30)
    end = date.today()
    start = end - timedelta(days=days)

    overspends = get_overspend_categories(db, user_id, start, end)
    alerts = []
    for o in overspends:
        alerts.append({
            "rule": "budget_overspend",
            "severity": "high" if o["over_by_pct"] > 25 else "medium",
            "message": f"{o['category_name']} is over budget by ${o['over_by']:.2f} ({o['over_by_pct']}%)",
            "data": o,
        })
    return alerts


def rule_low_savings_rate(db: Session, user_id: int, config: dict) -> list[dict]:
    """Alert when savings rate drops below threshold."""
    days = config.get("lookback_days", 30)
    threshold = config.get("min_savings_rate", 0.10)  # 10%
    end = date.today()
    start = end - timedelta(days=days)

    savings = compute_savings_rate(db, user_id, start, end)
    if savings["income"] == 0:
        return []

    if savings["savings_rate"] < threshold:
        severity = "high" if savings["savings_rate"] < 0 else "medium"
        return [{
            "rule": "low_savings_rate",
            "severity": severity,
            "message": f"Savings rate is {savings['savings_rate'] * 100:.1f}% (target: {threshold * 100:.0f}%)",
            "data": savings,
        }]
    return []


def rule_essential_spending_ratio(db: Session, user_id: int, config: dict) -> list[dict]:
    """Alert when non-essential spending is too high compared to essential."""
    days = config.get("lookback_days", 30)
    max_nonessential_pct = config.get("max_nonessential_pct", 0.40)  # 40%
    end = date.today()
    start = end - timedelta(days=days)

    spending = get_spending_by_category(db, user_id, start, end)
    essential = sum(c["total"] for c in spending if c["is_essential"])
    nonessential = sum(c["total"] for c in spending if not c["is_essential"])
    total = essential + nonessential

    if total == 0:
        return []

    nonessential_ratio = nonessential / total
    if nonessential_ratio > max_nonessential_pct:
        return [{
            "rule": "essential_spending_ratio",
            "severity": "medium",
            "message": f"Non-essential spending is {nonessential_ratio * 100:.0f}% of total (target: under {max_nonessential_pct * 100:.0f}%)",
            "data": {
                "essential": round(essential, 2),
                "nonessential": round(nonessential, 2),
                "nonessential_pct": round(nonessential_ratio, 4),
            },
        }]
    return []


def rule_goal_off_track(db: Session, user_id: int, config: dict) -> list[dict]:
    """Alert when any goal is projected to miss its target date."""
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    alerts = []

    for goal in goals:
        projection = project_goal_completion(db, user_id, goal.id)
        if not projection:
            continue
        if not projection.get("on_track", True):
            days_behind = projection.get("days_behind")
            severity = "high" if days_behind and days_behind > 60 else "medium"
            alerts.append({
                "rule": "goal_off_track",
                "severity": severity,
                "message": f"'{projection['goal_title']}' is ~{days_behind} days behind schedule",
                "data": projection,
            })
    return alerts


def rule_no_income(db: Session, user_id: int, config: dict) -> list[dict]:
    """Alert when no income recorded in the lookback period."""
    days = config.get("lookback_days", 30)
    end = date.today()
    start = end - timedelta(days=days)

    savings = compute_savings_rate(db, user_id, start, end)
    if savings["income"] == 0:
        return [{
            "rule": "no_income",
            "severity": "high",
            "message": f"No income recorded in the last {days} days",
            "data": savings,
        }]
    return []


# ── Rules registry ────────────────────────────────────────────
# Each entry: (function, default config, enabled)

RULES = [
    {"fn": rule_budget_overspend,        "config": {"lookback_days": 30}, "enabled": True},
    {"fn": rule_low_savings_rate,        "config": {"lookback_days": 30, "min_savings_rate": 0.10}, "enabled": True},
    {"fn": rule_essential_spending_ratio, "config": {"lookback_days": 30, "max_nonessential_pct": 0.40}, "enabled": True},
    {"fn": rule_goal_off_track,          "config": {}, "enabled": True},
    {"fn": rule_no_income,               "config": {"lookback_days": 30}, "enabled": True},
]


# ── Engine ────────────────────────────────────────────────────

def run_rules(db: Session, user_id: int) -> list[dict]:
    """Loop through all active rules, collect alerts, return sorted by severity."""
    all_alerts = []

    for rule in RULES:
        if not rule["enabled"]:
            continue
        try:
            alerts = rule["fn"](db, user_id, rule["config"])
            all_alerts.extend(alerts)
        except Exception as e:
            all_alerts.append({
                "rule": rule["fn"].__name__,
                "severity": "low",
                "message": f"Rule failed to evaluate: {str(e)}",
                "data": None,
            })

    severity_order = {"high": 0, "medium": 1, "low": 2}
    all_alerts.sort(key=lambda a: severity_order.get(a["severity"], 99))

    return all_alerts
