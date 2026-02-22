from datetime import date, datetime
from pydantic import BaseModel


class TransactionCreate(BaseModel):
    category_id: int
    amount: float
    direction: str     # expense | income
    date: date
    merchant: str | None = None
    note: str | None = None


class TransactionResponse(TransactionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
