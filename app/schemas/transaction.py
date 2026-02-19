from datetime import date, datetime

from pydantic import BaseModel


class TransactionCreate(BaseModel):
    category_id: int
    amount: float
    direction: str  # expense | income
    date: date
    merchant: str | None = None
    note: str | None = None


class TransactionOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    amount: float
    direction: str
    date: date
    merchant: str | None
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
