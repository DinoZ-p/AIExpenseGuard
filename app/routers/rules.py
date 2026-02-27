from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user
from app.services.rules_engine import run_rules

router = APIRouter(prefix="/rules", tags=["rules"])


@router.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return run_rules(db, current_user.id)
