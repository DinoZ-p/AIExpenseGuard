from pydantic import BaseModel


class BudgetCreate(BaseModel):
    category_id: int
    period: str  # weekly | monthly
    limit_amount: float


class BudgetOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    period: str
    limit_amount: float

    model_config = {"from_attributes": True}
