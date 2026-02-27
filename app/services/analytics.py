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


def project_goal_completion(
    db: Session, user_id: int, goal_id: int, monthly_savings: float
) -> dict:
    """
    Project when a goal will be reached based on user's manual monthly savings input.
    Splits savings across all goals proportionally by priority.
    """
    goal = db.query(Goal).filter(
        Goal.id == goal_id, Goal.user_id == user_id
    ).first()
    if not goal:
        return None

    # get all goals to calculate priority-based split
    all_goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    total_priority = sum(g.priority for g in all_goals)

    # this goal's share of monthly savings
    goal_share = monthly_savings * (goal.priority / total_priority) if total_priority > 0 else 0
    daily_share = goal_share / 30

    remaining = goal.target_amount - goal.current_amount

    if goal_share <= 0 or remaining <= 0:
        return {
            "goal_title": goal.title,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "remaining": round(remaining, 2),
            "monthly_share": 0,
            "priority": goal.priority,
            "total_priority": total_priority,
            "projected_completion_date": None,
            "target_date": goal.target_date.isoformat(),
            "on_track": remaining <= 0,
            "days_behind": None,
            "required_monthly_to_hit_target": None,
            "message": "No savings allocated" if goal_share <= 0 else "Goal reached!",
        }

    days_to_goal = remaining / daily_share
    today = date.today()
    projected_date = today + timedelta(days=int(days_to_goal))

    days_until_target = (goal.target_date - today).days
    months_until_target = max(days_until_target / 30, 0.1)
    required_monthly = remaining / months_until_target

    on_track = projected_date <= goal.target_date
    days_behind = (projected_date - goal.target_date).days if not on_track else 0

    return {
        "goal_title": goal.title,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "remaining": round(remaining, 2),
        "monthly_share": round(goal_share, 2),
        "priority": goal.priority,
        "total_priority": total_priority,
        "projected_completion_date": projected_date.isoformat(),
        "target_date": goal.target_date.isoformat(),
        "on_track": on_track,
        "days_behind": days_behind,
        "required_monthly_to_hit_target": round(required_monthly, 2),
    }


def get_overspend_categories(
    db: Session, user_id: int, start_date: date, end_date: date
) -> list[dict]:
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

        if budget.period == "monthly":
            adjusted_limit = budget.limit_amount * (period_days / 30)
        else:
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
    monthly_savings: float = 0.0, goal_id: Optional[int] = None,
) -> dict:
    spending = get_spending_by_category(db, user_id, start_date, end_date)
    overspends = get_overspend_categories(db, user_id, start_date, end_date)

    report = {
        "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
        "spending_by_category": spending,
        "overspend_alerts": overspends[:5],
        "top_3_drivers": overspends[:3],
    }

    if goal_id:
        report["goal_projection"] = project_goal_completion(
            db, user_id, goal_id, monthly_savings
        )

    return report
