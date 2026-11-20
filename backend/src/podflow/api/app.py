from fastapi import FastAPI

from podflow.api.access_logs import install_access_log_filters
from podflow.api.v1.health import router as health_router
from podflow.api.v1.workflows import router as workflows_router

_SHARE_PATH_PREFIX = "/api/v1/shares/"
_SHARE_NO_CACHE_HEADERS = {
    "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
}


def create_app() -> FastAPI:
    """
    Factory pattern to create and configure the FastAPI application.
    """
    install_access_log_filters()
    app = FastAPI(
        title="PodFlow API",
        description="PodFlow backend API and knowledge engine",
        version="0.1.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    # Register API v1 routers
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(workflows_router)

    @app.middleware("http")
    async def prevent_share_caching(request, call_next):
        response = await call_next(request)
        if request.url.path.startswith(_SHARE_PATH_PREFIX):
            response.headers.update(_SHARE_NO_CACHE_HEADERS)
        return response

    return app
