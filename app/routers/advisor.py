from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from celery.result import AsyncResult

from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user
from app.tasks.advisor_task import advisor_chat_task

router = APIRouter(prefix="/advisor", tags=["advisor"])


class Message(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str
    history: list[Message] = []


class TaskSubmitted(BaseModel):
    task_id: str


class TaskResult(BaseModel):
    status: str   # "pending" | "started" | "done" | "error"
    answer: str | None = None
    error: str | None = None


@router.post("/chat", response_model=TaskSubmitted)
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    task = advisor_chat_task.delay(
        current_user.id,
        current_user.monthly_savings,
        req.question,
        [m.model_dump() for m in req.history],
    )
    return {"task_id": task.id}


@router.get("/result/{task_id}", response_model=TaskResult)
def get_result(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    result = AsyncResult(task_id)

    if result.state in ("PENDING", "STARTED"):
        return {"status": "pending"}

    if result.state == "FAILURE":
        return {"status": "error", "error": "Task failed"}

    # SUCCESS
    data = result.result
    if "error" in data:
        return {"status": "error", "error": data["error"]}
    return {"status": "done", "answer": data["answer"]}
