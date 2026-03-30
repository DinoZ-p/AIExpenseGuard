from celery import Celery
from app.config import settings

celery = Celery(
    "expenseguard",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    result_expires=300,  # results expire after 5 minutes
    task_track_started=True,
)
