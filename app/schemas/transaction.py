from datetime import date as Date, datetime
from pydantic import BaseModel


class TransactionCreate(BaseModel):
    category_id: int
    amount: float
    direction: str     # expense | income
    date: Date
    merchant: str | None = None
    note: str | None = None


class TransactionUpdate(BaseModel):
    category_id: int | None = None
    amount: float | None = None
    direction: str | None = None
    date: Date | None = None
    merchant: str | None = None
    note: str | None = None


class TransactionResponse(TransactionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
