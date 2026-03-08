from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("/", response_model=GoalResponse, status_code=201)
def create_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = Goal(**goal_in.model_dump(), user_id=current_user.id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/", response_model=List[GoalResponse])
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()


@router.patch("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id,
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.current_amount = goal_in.current_amount
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id,
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
