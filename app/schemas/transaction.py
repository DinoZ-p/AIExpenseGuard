from datetime import date, datetime

from pydantic import BaseModel


class TransactionCreate(BaseModel):
    amount: float
    description: str
    date: date
    category_id: int


class TransactionOut(BaseModel):
    id: int
    amount: float
    description: str
    date: date
    category_id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
