from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user
from app.services.advisor import ask_advisor

router = APIRouter(prefix="/advisor", tags=["advisor"])


class Message(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str
    history: list[Message] = []


class ChatResponse(BaseModel):
    answer: str


@router.post("/chat", response_model=ChatResponse)
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    answer = ask_advisor(
        db,
        current_user.id,
        current_user.monthly_savings,
        req.question,
        [m.model_dump() for m in req.history],
    )
    return {"answer": answer}
