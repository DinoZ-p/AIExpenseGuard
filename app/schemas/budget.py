from datetime import datetime

from pydantic import BaseModel


class BudgetCreate(BaseModel):
    amount: float
    month: int
    year: int
    category_id: int


class BudgetOut(BaseModel):
    id: int
    amount: float
    month: int
    year: int
    category_id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
