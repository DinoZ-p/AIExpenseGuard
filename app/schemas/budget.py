from pydantic import BaseModel


class BudgetCreate(BaseModel):
    category_id: int
    period: str        # weekly | monthly
    limit_amount: float


class BudgetUpdate(BaseModel):
    period: str | None = None
    limit_amount: float | None = None


class BudgetResponse(BudgetCreate):
    id: int

    class Config:
        from_attributes = True
