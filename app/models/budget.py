from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    period = Column(String, nullable=False)        # weekly | monthly
    limit_amount = Column(Float, nullable=False)
