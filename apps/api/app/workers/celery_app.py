from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery("yakwork", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery_app.conf.beat_schedule = {
    "refresh-trending-issues-hourly": {
        "task": "app.workers.tasks.refresh_trending_issues",
        "schedule": crontab(minute=0),  # runs at the top of every hour
    },
}
