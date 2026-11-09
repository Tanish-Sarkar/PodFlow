import uuid
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from podflow.core.config import get_settings

settings = get_settings()

# We need an async driver (asyncpg or psycopg with async support).
# Since pyproject uses psycopg[binary], we can use postgresql+psycopg.
engine = create_async_engine(
    settings.database_dsn.replace("postgresql://", "postgresql+psycopg://")
    if settings.database_dsn.startswith("postgresql://")
    else settings.database_dsn,
    echo=False,
    future=True,
)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """
    Dependency to provide a restricted, request-scoped database transaction.
    """
    async with async_session_maker() as session:
        async with session.begin():
            await session.execute(text("SELECT set_config('role', 'podflow_runtime', true)"))
            yield session


async def set_rls_user(session: AsyncSession, auth_user_id: uuid.UUID) -> None:
    """Set the verified Supabase subject for RLS checks in the current transaction."""
    await session.execute(
        text(
            "SELECT set_config('app.user_id', :user_id, true), "
            "set_config('search_path', 'public, extensions', true)"
        ),
        {"user_id": str(auth_user_id)},
    )
