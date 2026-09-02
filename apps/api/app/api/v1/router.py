from fastapi import APIRouter

from app.api.v1.endpoints import health, issues, github

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(issues.router, tags=["issues"])
api_router.include_router(github.router, tags=["github"])
