import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserPreference(Base):
    """
    What a user says they're interested in - filled in either from the
    GitHub-derived profile, or typed in manually via the no-login form.
    """
    __tablename__ = "user_preferences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    languages: Mapped[list[str]] = mapped_column(JSONB, default=list)          # e.g. ["Python", "TypeScript"]
    topics: Mapped[list[str]] = mapped_column(JSONB, default=list)             # e.g. ["web", "cli", "ml"]
    difficulty: Mapped[str] = mapped_column(String, default="good-first-issue")  # good-first-issue | intermediate | any
    contribution_types: Mapped[list[str]] = mapped_column(JSONB, default=list)  # ["bug", "docs", "feature"]

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
