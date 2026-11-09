import hashlib
import logging
import uuid

import pytest
from pydantic import ValidationError

from podflow.api.access_logs import ShareTokenRedactionFilter
from podflow.api.app import create_app
from podflow.schemas.database import (
    ChatMessageCreate,
    ConversationAttachmentsUpdate,
    ConversationCreate,
    PublicPresentationRead,
    ResourceCreate,
)
from podflow.security.presentation_shares import generate_share_token


def test_openapi_private_routes_require_bearer_but_public_share_does_not():
    paths = create_app().openapi()["paths"]
    assert paths["/api/v1/auth/me"]["get"]["security"] == [{"HTTPBearer": []}]
    assert "/api/v1/shares/{token}" in paths
    assert "security" not in paths["/api/v1/shares/{token}"]["get"]


def test_app_registers_non_cache_middleware_for_share_routes():
    app = create_app()
    assert any(
        getattr(middleware.kwargs.get("dispatch"), "__name__", "") == "prevent_share_caching"
        for middleware in app.user_middleware
    )


def test_app_installs_access_log_token_redaction_filter():
    create_app()
    assert any(
        isinstance(item, ShareTokenRedactionFilter)
        for item in logging.getLogger("uvicorn.access").filters
    )


@pytest.mark.parametrize(
    "payload",
    [
        {"kind": "url"},
        {"kind": "upload", "submitted_url": "https://example.com"},
        {"kind": "other", "submitted_url": "https://example.com"},
    ],
)
def test_resource_create_rejects_invalid_kind_url_combinations(payload):
    with pytest.raises(ValidationError):
        ResourceCreate.model_validate(payload)


def test_attachment_request_rejects_more_than_100_versions():
    with pytest.raises(ValidationError):
        ConversationAttachmentsUpdate(artifact_version_ids=[uuid.uuid4() for _ in range(101)])


def test_conversation_attachment_ids_must_be_unique():
    version_id = uuid.uuid4()
    with pytest.raises(ValidationError):
        ConversationCreate(artifact_version_ids=[version_id, version_id])


def test_chat_message_is_trimmed_and_has_a_size_limit():
    assert ChatMessageCreate(content=" hello ").content == "hello"
    with pytest.raises(ValidationError):
        ChatMessageCreate(content="x" * 50_001)


def test_share_token_is_random_and_only_sha256_digest_is_persisted():
    first = generate_share_token()
    second = generate_share_token()
    assert first.bearer_token != second.bearer_token
    assert first.token_hash == hashlib.sha256(first.bearer_token.encode()).hexdigest()
    assert len(first.token_hash) == 64


def test_public_share_response_exposes_only_snapshot():
    response = PublicPresentationRead(snapshot={"title": "Snapshot"})
    assert response.model_dump() == {"snapshot": {"title": "Snapshot"}}
