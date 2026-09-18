from fastapi import APIRouter
from pydantic import BaseModel

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
def health_ready() -> HealthResponse:
    """
    Readiness probe. Indicates if the application is ready to handle requests.
    Future milestones will add subsystem dependency checks here.
    """
    return HealthResponse(status="ok")
