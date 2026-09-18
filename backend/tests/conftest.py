import pytest
from fastapi.testclient import TestClient

from podflow.app import create_app


@pytest.fixture
def client() -> TestClient:
    """
    TestClient fixture for testing the FastAPI application.
    """
    app = create_app()
    return TestClient(app)
