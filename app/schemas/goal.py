from datetime import date
from pydantic import BaseModel


class GoalCreate(BaseModel):
    title: str
    target_amount: float
    target_date: date
    priority: int = 3
    type: str = "mid"
    comfort_floor: float | None = None


class GoalUpdate(BaseModel):
    current_amount: float


class GoalResponse(GoalCreate):
    id: int
    current_amount: float

    class Config:
        from_attributes = True
