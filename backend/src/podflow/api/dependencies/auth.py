import uuid
from functools import lru_cache
from typing import Annotated
from urllib.parse import urlsplit

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from podflow.core.config import Settings, get_settings
from podflow.persistence.db.models.user import UserProfile
from podflow.persistence.db.session import get_db, set_rls_user

security = HTTPBearer(auto_error=False)
_ALLOWED_ASYMMETRIC_ALGORITHMS = ("RS256", "ES256", "ES384", "ES512", "EdDSA")


def _auth_endpoints(settings: Settings) -> tuple[str, str]:
    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    parsed = urlsplit(settings.supabase_url.rstrip("/"))
    if (
        not parsed.hostname
        or parsed.scheme not in {"https", "http"}
        or parsed.path not in {"", "/"}
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    if parsed.scheme == "http" and parsed.hostname not in {"localhost", "127.0.0.1", "::1"}:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    issuer = f"{parsed.scheme}://{parsed.netloc}/auth/v1"
    jwks_url = settings.supabase_jwks_url or f"{issuer}/.well-known/jwks.json"
    jwks = urlsplit(jwks_url)
    if (
        not jwks.hostname
        or (
            jwks.scheme != "https"
            and not (jwks.scheme == "http" and jwks.hostname in {"localhost", "127.0.0.1", "::1"})
        )
        or jwks.username
        or jwks.password
        or jwks.query
        or jwks.fragment
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    return issuer, jwks_url


@lru_cache(maxsize=4)
def _jwks_client(jwks_url: str):
    try:
        import jwt
    except ImportError as exc:  # pragma: no cover - package is a runtime dependency
        raise RuntimeError("PyJWT is required for Supabase authentication") from exc

    return jwt.PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=300, timeout=5)


def verify_jwt(token: str, settings: Settings) -> dict:
    """Verify a Supabase access token using the project's asymmetric signing keys."""
    import jwt

    issuer, jwks_url = _auth_endpoints(settings)

    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")
        if algorithm not in _ALLOWED_ASYMMETRIC_ALGORITHMS:
            raise jwt.InvalidAlgorithmError("Unsupported signing algorithm")
        signing_key = _jwks_client(jwks_url).get_signing_key_from_jwt(token)
        if signing_key.algorithm_name != algorithm:
            raise jwt.InvalidAlgorithmError("JWT and JWK algorithms do not match")
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=[algorithm],
            audience="authenticated",
            issuer=issuer,
            options={"require": ["exp", "iss", "aud", "sub"]},
        )
        try:
            uuid.UUID(claims["sub"])
        except (TypeError, ValueError) as exc:
            raise jwt.InvalidTokenError("Invalid token subject") from exc
        return claims
    except jwt.PyJWKClientConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication signing keys are temporarily unavailable.",
        ) from exc
    except jwt.PyJWKClientError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def require_credentials(
    credentials: HTTPAuthorizationCredentials | None,
) -> HTTPAuthorizationCredentials:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> UserProfile:
    """
    Validates the Supabase JWT and returns the corresponding UserProfile.
    """
    credentials = require_credentials(credentials)
    payload = await run_in_threadpool(verify_jwt, credentials.credentials, settings)

    try:
        auth_user_id = uuid.UUID(payload["sub"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    await set_rls_user(db, auth_user_id)
    user_metadata = payload.get("user_metadata") or {}
    display_name = user_metadata.get("full_name") or user_metadata.get("name")
    avatar_url = user_metadata.get("avatar_url") or user_metadata.get("picture")
    await db.execute(
        insert(UserProfile)
        .values(
            auth_user_id=auth_user_id,
            display_name=display_name if isinstance(display_name, str) else None,
            avatar_url=avatar_url if isinstance(avatar_url, str) else None,
        )
        .on_conflict_do_nothing(index_elements=[UserProfile.auth_user_id])
    )
    result = await db.execute(select(UserProfile).where(UserProfile.auth_user_id == auth_user_id))
    user = result.scalar_one()

    return user
