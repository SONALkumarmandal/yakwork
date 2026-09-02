import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    """
    A person using the app. If they never connect GitHub, they can
    still exist as a "guest" identified by a browser session — github_id
    stays null in that case.
    """
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_id: Mapped[str | None] = mapped_column(String, unique=True, nullable=True, index=True)
    username: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)

    # Encrypted at rest in a real deployment (e.g. via a KMS-backed field
    # or an app-level Fernet key) - stored as plain text here for clarity.
    github_access_token: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
