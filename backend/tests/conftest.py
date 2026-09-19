import pytest
from fastapi.testclient import TestClient

from podflow.app import create_app
from podflow.db.session import get_db


class MockSession:
    async def execute(self, *args, **kwargs):
        pass


async def override_get_db():
    yield MockSession()


@pytest.fixture
def client() -> TestClient:
    """
    TestClient fixture for testing the FastAPI application.
    """
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)
