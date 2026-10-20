import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from podflow.core.config import Settings, get_settings
from podflow.persistence.db.models.user import UserProfile
from podflow.persistence.db.session import get_db

security = HTTPBearer()


def verify_jwt(token: str, secret: str) -> dict:
    """
    Verify the Supabase JWT.
    This boundary handles the cryptographic verification.
    """
    try:
        import jwt
    except ImportError as exc:
        raise NotImplementedError(
            "JWT verification requires PyJWT. "
            "Decision unresolved: Ensure HS256 vs RS256/JWKS is specified in production."
        ) from exc

    try:
        # Assuming HS256 and Audience "authenticated" for Supabase
        return jwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> UserProfile:
    """
    Validates the Supabase JWT and returns the corresponding UserProfile.
    """
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication is not configured.",
        )

    token = credentials.credentials
    payload = verify_jwt(token, settings.supabase_jwt_secret)

    try:
        auth_user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    stmt = select(UserProfile).where(UserProfile.auth_user_id == auth_user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User profile not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
