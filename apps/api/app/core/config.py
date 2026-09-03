"""
All app configuration lives here. We read values from environment
variables (or a local .env file) instead of hardcoding them, so the
same code works in local dev, CI, and production just by changing
env vars.
"""
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # General
    APP_NAME: str = "Yakwork API"
    ENV: str = "development"  # development | staging | production
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://yakwork:yakwork@localhost:5432/yakwork"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def use_async_postgres_driver(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    # Redis (caching + job queue)
    REDIS_URL: str = "redis://localhost:6379/0"

    # GitHub OAuth App (create one at https://github.com/settings/developers)
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_OAUTH_REDIRECT_URI: str = "http://localhost:3000/api/auth/callback/github"

    # A separate GitHub Personal Access Token used ONLY for the background
    # job that indexes public "good first issue" listings (not tied to any
    # individual user). Higher rate limit than unauthenticated requests.
    GITHUB_INDEXER_TOKEN: str = ""

    # Auth (for our own session/JWT, separate from the GitHub token)
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    # CORS - which frontend origins are allowed to call this API
    CORS_ORIGINS: list[str] = [
        "https://yakwork-kryqx3uhz-sonalkumarmandals-projects.vercel.app",
        "http://localhost:3000",
    ]


settings = Settings()
