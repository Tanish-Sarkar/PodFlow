import uuid
from unittest.mock import patch

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from podflow.api.dependencies.auth import get_current_user
from podflow.persistence.db.models.user import UserProfile

app = FastAPI()


@app.get("/test-auth")
def dummy_auth_endpoint(user: UserProfile = Depends(get_current_user)):
    return {"user_id": str(user.id)}


def test_auth_missing_header():
    client = TestClient(app)
    response = client.get("/test-auth")
    assert response.status_code == 403 or response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_auth_invalid_scheme():
    client = TestClient(app)
    response = client.get("/test-auth", headers={"Authorization": "Basic something"})
    assert response.status_code == 403 or response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_auth_invalid_token(monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "secret")
    client = TestClient(app)

    with patch("podflow.api.dependencies.auth.verify_jwt") as mock_verify:
        from fastapi import HTTPException

        mock_verify.side_effect = HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
        response = client.get("/test-auth", headers={"Authorization": "Bearer badtoken"})
        assert response.status_code == 401


def test_auth_valid_token_user_not_found(monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "secret")
    client = TestClient(app)

    with patch("podflow.api.dependencies.auth.verify_jwt") as mock_verify:
        mock_verify.return_value = {"sub": str(uuid.uuid4())}

        # Override get_db to return empty
        class MockResult:
            def scalar_one_or_none(self):
                return None

        class MockSession:
            async def execute(self, *args, **kwargs):
                return MockResult()

        async def override_get_db():
            yield MockSession()

        app.dependency_overrides[get_current_user.__defaults__[1]] = (
            override_get_db  # DB is the second arg or we can just override by dependency
        )
        from podflow.persistence.db.session import get_db

        app.dependency_overrides[get_db] = override_get_db

        response = client.get("/test-auth", headers={"Authorization": "Bearer goodtoken"})
        assert response.status_code == 401
        assert "not found" in response.json()["detail"].lower()


def test_auth_valid_token_success(monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "secret")
    client = TestClient(app)

    user_id = uuid.uuid4()

    with patch("podflow.api.dependencies.auth.verify_jwt") as mock_verify:
        mock_verify.return_value = {"sub": str(uuid.uuid4())}

        # Override get_db to return user
        class MockResult:
            def scalar_one_or_none(self):
                user = UserProfile()
                user.id = user_id
                return user

        class MockSession:
            async def execute(self, *args, **kwargs):
                return MockResult()

        async def override_get_db():
            yield MockSession()

        from podflow.persistence.db.session import get_db

        app.dependency_overrides[get_db] = override_get_db

        response = client.get("/test-auth", headers={"Authorization": "Bearer goodtoken"})
        assert response.status_code == 200
        assert response.json() == {"user_id": str(user_id)}
