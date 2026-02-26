from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.models.transaction import Transaction
from app.models.category import Category
from app.models.goal import Goal
from app.models.budget import Budget


def get_spending_by_category(
    db: Session,
    user_id: int,
    start_date: date,
    end_date: date,
) -> list[dict]:
    """
    Returns: [{"category_id": 1, "category_name": "Dining", "total": 450.0, "is_essential": False}, ...]
    """
    results = (
        db.query(
            Category.id,
            Category.name,
            Category.is_essential,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .outerjoin(Transaction, (
            (Transaction.category_id == Category.id)
            & (Transaction.date >= start_date)
            & (Transaction.date <= end_date)
            & (Transaction.direction == "expense")
        ))
        .filter(Category.user_id == user_id, Category.type == "expense")
        .group_by(Category.id)
        .all()
    )

    return [
        {
            "category_id": r.id,
            "category_name": r.name,
            "is_essential": r.is_essential,
            "total": float(r.total),
        }
        for r in results
    ]


def get_total_income(
    db: Session, user_id: int, start_date: date, end_date: date
) -> float:
    result = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.direction == "income",
            Transaction.date >= start_date,
            Transaction.date <= end_date,
        )
        .scalar()
    )
    return float(result)


def get_total_expenses(
    db: Session, user_id: int, start_date: date, end_date: date
) -> float:
    result = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.direction == "expense",
            Transaction.date >= start_date,
            Transaction.date <= end_date,
        )
        .scalar()
    )
    return float(result)


def compute_savings_rate(
    db: Session, user_id: int, start_date: date, end_date: date
) -> dict:
    """
    Returns: {
        "income": 5000.0,
        "expenses": 3800.0,
        "savings": 1200.0,
        "savings_rate": 0.24,   # 24%
        "period_days": 30
    }
    """
    income = get_total_income(db, user_id, start_date, end_date)
    expenses = get_total_expenses(db, user_id, start_date, end_date)
    savings = income - expenses
    rate = savings / income if income > 0 else 0.0

    return {
        "income": income,
        "expenses": expenses,
        "savings": savings,
        "savings_rate": round(rate, 4),
        "period_days": (end_date - start_date).days,
    }


def project_goal_completion(
    db: Session, user_id: int, goal_id: int, lookback_days: int = 90
) -> dict:
    """
    Based on recent savings rate, when will this goal be hit?
    """
    goal = db.query(Goal).filter(
        Goal.id == goal_id, Goal.user_id == user_id
    ).first()
    if not goal:
        return None

    end = date.today()
    start = end - timedelta(days=lookback_days)

    savings_data = compute_savings_rate(db, user_id, start, end)

    # normalize to monthly
    daily_savings = savings_data["savings"] / max(savings_data["period_days"], 1)
    monthly_savings = daily_savings * 30

    remaining = goal.target_amount - goal.current_amount

    if monthly_savings <= 0:
        return {
            "goal_title": goal.title,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "remaining": remaining,
            "avg_monthly_savings": monthly_savings,
            "projected_completion_date": None,
            "days_until_projected": None,
            "target_date": goal.target_date.isoformat(),
            "on_track": False,
            "days_behind": None,
            "required_monthly_to_hit_target": None,
            "message": "Not saving — goal cannot be reached at current pace",
        }

    days_to_goal = (remaining / daily_savings) if daily_savings > 0 else float("inf")
    projected_date = end + timedelta(days=int(days_to_goal))

    days_until_target = (goal.target_date - end).days
    months_until_target = max(days_until_target / 30, 0.1)
    required_monthly = remaining / months_until_target

    on_track = projected_date <= goal.target_date
    days_behind = (projected_date - goal.target_date).days if not on_track else 0

    return {
        "goal_title": goal.title,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "remaining": round(remaining, 2),
        "avg_monthly_savings": round(monthly_savings, 2),
        "projected_completion_date": projected_date.isoformat(),
        "days_until_projected": int(days_to_goal),
        "target_date": goal.target_date.isoformat(),
        "on_track": on_track,
        "days_behind": days_behind,
        "required_monthly_to_hit_target": round(required_monthly, 2),
    }


def get_overspend_categories(
    db: Session, user_id: int, start_date: date, end_date: date
) -> list[dict]:
    """
    Compares actual spend vs budget limits.
    Returns sorted list, worst overspend first.
    """
    spending = get_spending_by_category(db, user_id, start_date, end_date)

    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .all()
    )
    budget_map = {b.category_id: b for b in budgets}

    period_days = (end_date - start_date).days

    overspends = []
    for cat in spending:
        budget = budget_map.get(cat["category_id"])
        if not budget:
            continue

        # normalize budget to match the period
        if budget.period == "monthly":
            adjusted_limit = budget.limit_amount * (period_days / 30)
        else:  # weekly
            adjusted_limit = budget.limit_amount * (period_days / 7)

        if cat["total"] > adjusted_limit:
            overspends.append({
                "category_name": cat["category_name"],
                "category_id": cat["category_id"],
                "is_essential": cat["is_essential"],
                "spent": round(cat["total"], 2),
                "budget_limit": round(adjusted_limit, 2),
                "over_by": round(cat["total"] - adjusted_limit, 2),
                "over_by_pct": round(
                    ((cat["total"] - adjusted_limit) / adjusted_limit) * 100, 1
                ),
            })

    return sorted(overspends, key=lambda x: x["over_by"], reverse=True)


def generate_full_report(
    db: Session, user_id: int, start_date: date, end_date: date,
    goal_id: Optional[int] = None,
) -> dict:
    """
    Master function: pulls together everything into one dict.
    This is what gets sent to the LLM later.
    """
    savings = compute_savings_rate(db, user_id, start_date, end_date)
    spending = get_spending_by_category(db, user_id, start_date, end_date)
    overspends = get_overspend_categories(db, user_id, start_date, end_date)

    report = {
        "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
        "savings": savings,
        "spending_by_category": spending,
        "overspend_alerts": overspends[:5],  # top 5
        "top_3_drivers": overspends[:3],
    }

    if goal_id:
        report["goal_projection"] = project_goal_completion(db, user_id, goal_id)

    return report
