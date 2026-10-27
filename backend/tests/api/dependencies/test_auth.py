import uuid
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import Mock

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from podflow.api.dependencies import auth
from podflow.core.config import Settings
from podflow.persistence.db.models.user import UserProfile

USER_ID = str(uuid.uuid4())
SETTINGS = Settings(supabase_url="https://podflow-test.supabase.co")


def _signed_token(monkeypatch, claims):
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    signing_key = SimpleNamespace(algorithm_name="RS256", key=private_key.public_key())
    client = Mock()
    client.get_signing_key_from_jwt.return_value = signing_key
    monkeypatch.setattr(auth, "_jwks_client", lambda url: client)
    token = jwt.encode(claims, private_key, algorithm="RS256", headers={"kid": "test-key"})
    return token


def _claims(**overrides):
    claims = {
        "sub": USER_ID,
        "iss": "https://podflow-test.supabase.co/auth/v1",
        "aud": "authenticated",
        "exp": datetime.now(UTC) + timedelta(minutes=5),
    }
    claims.update(overrides)
    return claims


def test_valid_supabase_jwt_is_verified_with_asymmetric_signature(monkeypatch):
    token = _signed_token(monkeypatch, _claims())
    assert auth.verify_jwt(token, SETTINGS)["sub"] == USER_ID


@pytest.mark.parametrize(
    "claims",
    [
        _claims(exp=datetime.now(UTC) - timedelta(minutes=1)),
        _claims(iss="https://wrong-project.supabase.co/auth/v1"),
        _claims(aud="anon"),
        _claims(sub=None),
    ],
)
def test_expired_wrong_issuer_audience_or_missing_subject_is_401(monkeypatch, claims):
    token = _signed_token(monkeypatch, claims)

    with pytest.raises(HTTPException) as result:
        auth.verify_jwt(token, SETTINGS)

    assert result.value.status_code == 401


def test_invalid_signature_is_401(monkeypatch):
    token = _signed_token(monkeypatch, _claims())
    wrong_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    signing_key = SimpleNamespace(algorithm_name="RS256", key=wrong_private_key.public_key())
    client = Mock()
    client.get_signing_key_from_jwt.return_value = signing_key
    monkeypatch.setattr(auth, "_jwks_client", lambda url: client)

    with pytest.raises(HTTPException) as result:
        auth.verify_jwt(token, SETTINGS)

    assert result.value.status_code == 401


def test_hs256_is_rejected_before_jwks_verification(monkeypatch):
    client = Mock()
    monkeypatch.setattr(auth, "_jwks_client", lambda url: client)
    token = jwt.encode(_claims(), "x" * 32, algorithm="HS256")

    with pytest.raises(HTTPException) as result:
        auth.verify_jwt(token, SETTINGS)

    assert result.value.status_code == 401
    client.get_signing_key_from_jwt.assert_not_called()


def test_missing_bearer_token_is_401():
    with pytest.raises(HTTPException) as result:
        auth.require_credentials(None)

    assert result.value.status_code == 401
    assert result.value.headers["WWW-Authenticate"] == "Bearer"


def test_missing_supabase_url_returns_service_configuration_error():
    with pytest.raises(HTTPException) as result:
        auth.verify_jwt("invalid", Settings(supabase_url=None))
    assert result.value.status_code == 503


def test_first_login_profile_bootstrap_reuses_verified_subject(monkeypatch):
    profile = UserProfile(
        id=uuid.uuid4(),
        auth_user_id=uuid.UUID(USER_ID),
        display_name="PodFlow User",
    )

    class Result:
        def scalar_one(self):
            return profile

    class Session:
        def __init__(self):
            self.statements = []

        async def execute(self, statement, params=None):
            self.statements.append((statement, params))
            return Result()

    async def set_user(session, user_id):
        assert user_id == uuid.UUID(USER_ID)

    monkeypatch.setattr(auth, "set_rls_user", set_user)
    monkeypatch.setattr(
        auth,
        "verify_jwt",
        lambda token, settings: {"sub": USER_ID, "user_metadata": {"name": "PodFlow User"}},
    )

    async def inline_threadpool(function, *args):
        return function(*args)

    monkeypatch.setattr(auth, "run_in_threadpool", inline_threadpool)
    session = Session()
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="signed-token")

    async def run():
        first = await auth.get_current_user(credentials, session, SETTINGS)
        second = await auth.get_current_user(credentials, session, SETTINGS)
        return first, second

    coroutine = run()
    try:
        coroutine.send(None)
    except StopIteration as completed:
        first, second = completed.value
    else:
        raise AssertionError("profile bootstrap unexpectedly yielded external async work")

    assert first is second is profile
    assert len(session.statements) == 4  # Idempotent insert and profile read on each login.
    insert_statement = session.statements[0][0]
    assert insert_statement._post_values_clause.inferred_target_elements == [
        UserProfile.auth_user_id
    ]
    assert uuid.UUID(USER_ID) in insert_statement.compile().params.values()
