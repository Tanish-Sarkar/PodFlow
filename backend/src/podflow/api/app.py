from fastapi import FastAPI

from podflow.api.v1.health import router as health_router


def create_app() -> FastAPI:
    """
    Factory pattern to create and configure the FastAPI application.
    """
    app = FastAPI(
        title="PodFlow API",
        description="PodFlow backend API and knowledge engine",
        version="0.1.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    # Register API v1 routers
    app.include_router(health_router, prefix="/api/v1")

    return app
