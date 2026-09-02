import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CachedRepo(Base):
    """
    A snapshot of a GitHub repo, refreshed periodically by the
    background indexer job (see app/workers/tasks.py). We keep our
    own copy so we're not re-asking GitHub every time a user searches.
    """
    __tablename__ = "cached_repos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String, unique=True, index=True)  # e.g. "facebook/react"
    stars: Mapped[int] = mapped_column(Integer, default=0)
    primary_language: Mapped[str | None] = mapped_column(String, nullable=True)
    topics: Mapped[list[str]] = mapped_column(JSONB, default=list)
    has_contributing_md: Mapped[bool] = mapped_column(Boolean, default=False)
    last_synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CachedIssue(Base):
    """One open issue pulled from GitHub's Search API by the indexer job."""
    __tablename__ = "cached_issues"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cached_repos.id"))
    github_issue_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str] = mapped_column(String)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    labels: Mapped[list[str]] = mapped_column(JSONB, default=list)
    url: Mapped[str] = mapped_column(String)
    github_created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SavedIssue(Base):
    """A user's personal bookmark / contribution tracker entry."""
    __tablename__ = "saved_issues"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    issue_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cached_issues.id"))
    status: Mapped[str] = mapped_column(String, default="saved")  # saved | contributed | dismissed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
