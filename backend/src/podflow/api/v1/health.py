from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from podflow.db.session import get_db

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: str


@router.get("/live", response_model=HealthResponse)
def health_live() -> HealthResponse:
    """
    Liveness probe. Indicates if the application process is running.
    """
    return HealthResponse(status="ok")


@router.get("/ready", response_model=HealthResponse)
async def health_ready(response: Response, db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """
    Readiness probe. Indicates if the application is ready to handle requests.
    Checks database connectivity.
    """
    try:
        await db.execute(text("SELECT 1"))
        return HealthResponse(status="ok")
    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return HealthResponse(status="error")
