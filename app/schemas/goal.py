from datetime import date

from pydantic import BaseModel


class GoalCreate(BaseModel):
    title: str
    target_amount: float
    target_date: date
    priority: int = 3
    type: str = "mid"
    comfort_floor: float | None = None


class GoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    current_amount: float
    target_date: date
    priority: int
    type: str
    comfort_floor: float | None

    model_config = {"from_attributes": True}
