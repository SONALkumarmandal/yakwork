from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Simple endpoint to confirm the API is alive - used by Docker/uptime checks."""
    return {"status": "ok"}
