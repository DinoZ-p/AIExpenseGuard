from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)        # always positive
    direction = Column(String, nullable=False)     # expense | income
    date = Column(Date, nullable=False)
    merchant = Column(String, nullable=True)
    note = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
