"""
Entrypoint re-exporting the FastAPI app instance from app.main.
Allows running either `uvicorn app.main:app --reload` or `uvicorn main:app --reload`.
"""
from app.main import app

__all__ = ["app"]
