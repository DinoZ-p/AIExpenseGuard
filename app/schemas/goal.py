from datetime import date, datetime

from pydantic import BaseModel


class GoalCreate(BaseModel):
    name: str
    target_amount: float
    deadline: date


class GoalOut(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    deadline: date
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
