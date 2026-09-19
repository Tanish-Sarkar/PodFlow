from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from podflow.config import get_settings

settings = get_settings()

# We need an async driver (asyncpg or psycopg with async support).
# Since pyproject uses psycopg[binary], we can use postgresql+psycopg.
engine = create_async_engine(
    settings.database_url.replace("postgresql://", "postgresql+psycopg://")
    if settings.database_url.startswith("postgresql://")
    else settings.database_url,
    echo=settings.app_env == "development",
    future=True,
)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """
    Dependency to provide a database session for FastAPI endpoints.
    """
    async with async_session_maker() as session:
        yield session
