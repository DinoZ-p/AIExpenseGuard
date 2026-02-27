from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user
from app.services.analytics import (
    get_spending_by_category,
    get_overspend_categories,
    project_goal_completion,
    generate_full_report,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/spending")
def spending_breakdown(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    return get_spending_by_category(db, current_user.id, start_date, end_date)


@router.get("/overspend")
def overspend_alerts(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    return get_overspend_categories(db, current_user.id, start_date, end_date)


@router.get("/goal-projection/{goal_id}")
def goal_projection(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = project_goal_completion(
        db, current_user.id, goal_id, current_user.monthly_savings
    )
    if not result:
        raise HTTPException(status_code=404, detail="Goal not found")
    return result


@router.get("/report")
def full_report(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    goal_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    return generate_full_report(
        db, current_user.id, start_date, end_date,
        current_user.monthly_savings, goal_id,
    )
