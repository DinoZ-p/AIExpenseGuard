from app.celery_app import celery
from app.database import SessionLocal
from app.services.advisor import ask_advisor


@celery.task(name="advisor.chat")
def advisor_chat_task(user_id: int, monthly_savings: float, question: str, history: list[dict]) -> dict:
    """Run AI advisor in a Celery worker — off the request thread."""
    db = SessionLocal()
    try:
        answer = ask_advisor(db, user_id, monthly_savings, question, history)
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()
