from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(Date, nullable=False)
    priority = Column(Integer, default=3)          # 1-5
    type = Column(String, default="mid")           # short | mid | long
    comfort_floor = Column(Float, nullable=True)   # min monthly entertainment etc.
