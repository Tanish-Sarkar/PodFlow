import hashlib
import uuid
from datetime import UTC, datetime
from types import SimpleNamespace

import pytest
from fastapi import HTTPException, Response

from podflow.api.access_logs import ShareTokenRedactionFilter
from podflow.api.dependencies import auth
from podflow.api.v1 import workflows
from podflow.persistence.db.models.knowledge import ArtifactVersion, KnowledgeArtifact
from podflow.persistence.db.models.user import UserProfile
from podflow.schemas.database import ConversationAttachmentsUpdate, ConversationRead


def run_sync(coroutine):
    """Drive coroutines whose mocked dependencies complete without external I/O."""
    while True:
        try:
            yielded = coroutine.send(None)
        except StopIteration as result:
            return result.value
        if yielded is not None:
            raise AssertionError("test coroutine unexpectedly yielded external async work")


class FakeResult:
    def __init__(self, scalar=None, scalars=(), rows=(), rowcount=1):
        self._scalar = scalar
        self._scalars = list(scalars)
        self._rows = list(rows)
        self.rowcount = rowcount

    def scalar_one_or_none(self):
        return self._scalar

    def scalars(self):
        return iter(self._scalars)

    def all(self):
        return self._rows


class FakeSession:
    def __init__(self, results=()):
        self.results = list(results)
        self.statements = []
        self.added = []
        self.added_many = []

    async def execute(self, statement, *args, **kwargs):
        self.statements.append(statement)
        return self.results.pop(0) if self.results else FakeResult()

    def add(self, value):
        self.added.append(value)

    def add_all(self, values):
        self.added_many.extend(values)

    async def flush(self):
        return None


def test_private_route_auth_dependency_rejects_missing_and_invalid_bearer_tokens(monkeypatch):
    with pytest.raises(HTTPException) as missing:
        auth.require_credentials(None)
    assert missing.value.status_code == 401

    def reject(token, settings):
        raise HTTPException(401, "Invalid authentication credentials")

    monkeypatch.setattr(auth, "verify_jwt", reject)

    async def inline_threadpool(function, *args):
        return function(*args)

    monkeypatch.setattr(auth, "run_in_threadpool", inline_threadpool)
    invalid_credentials = SimpleNamespace(scheme="Bearer", credentials="bad")
    with pytest.raises(HTTPException) as invalid:
        run_sync(auth.get_current_user(invalid_credentials, FakeSession(), None))
    assert invalid.value.status_code == 401


@pytest.mark.parametrize("requested_ids", [[], [uuid.uuid4(), uuid.uuid4()]])
def test_attachment_replace_supports_multiple_versions_and_detach_all(monkeypatch, requested_ids):
    user_id = uuid.uuid4()
    conversation = SimpleNamespace(id=uuid.uuid4(), owner_id=user_id, title="Chat")
    db = FakeSession(
        [FakeResult(scalar=conversation), FakeResult(scalars=requested_ids), FakeResult(rowcount=1)]
        if requested_ids
        else [FakeResult(scalar=conversation), FakeResult(rowcount=1)]
    )
    returned = ConversationRead(
        id=conversation.id,
        title="Chat",
        artifact_version_ids=requested_ids,
        messages=[],
    )

    async def get_after_replace(conversation_id, user, session):
        return returned

    monkeypatch.setattr(workflows, "get_conversation", get_after_replace)
    user = UserProfile(id=uuid.uuid4(), auth_user_id=user_id)
    result = run_sync(
        workflows.replace_conversation_attachments(
            conversation.id,
            ConversationAttachmentsUpdate(artifact_version_ids=requested_ids),
            user,
            db,
        )
    )

    assert result.artifact_version_ids == requested_ids
    assert {item.artifact_version_id for item in db.added_many} == set(requested_ids)


def test_attachment_replace_rejects_versions_not_owned_by_user(monkeypatch):
    user_id = uuid.uuid4()
    conversation = SimpleNamespace(id=uuid.uuid4(), owner_id=user_id, title="Chat")
    db = FakeSession([FakeResult(scalar=conversation), FakeResult(scalars=[])])
    user = UserProfile(id=uuid.uuid4(), auth_user_id=user_id)

    async def run():
        await workflows.replace_conversation_attachments(
            conversation.id,
            ConversationAttachmentsUpdate(artifact_version_ids=[uuid.uuid4()]),
            user,
            db,
        )

    with pytest.raises(HTTPException) as result:
        run_sync(run())
    assert result.value.status_code == 404
    assert not db.added_many
    assert user.auth_user_id in db.statements[1].compile().params.values()


@pytest.mark.parametrize(
    "target",
    ["resource", "artifact", "version", "conversation", "presentation", "revoke_share"],
)
def test_owner_scoped_reads_and_mutations_hide_other_users_records(target):
    user = UserProfile(id=uuid.uuid4(), auth_user_id=uuid.uuid4())
    db = FakeSession([FakeResult(scalar=None)])
    resource_id, artifact_id, version_id, conversation_id, presentation_id, share_id = (
        uuid.uuid4() for _ in range(6)
    )

    async def run():
        if target == "resource":
            return await workflows.get_resource(resource_id, user, db)
        if target == "artifact":
            return await workflows.get_artifact(artifact_id, user, db)
        if target == "version":
            return await workflows.get_artifact_version(artifact_id, version_id, user, db)
        if target == "conversation":
            return await workflows.get_conversation(conversation_id, user, db)
        if target == "presentation":
            return await workflows.get_presentation(presentation_id, user, db)
        return await workflows.revoke_share(presentation_id, share_id, user, db)

    with pytest.raises(HTTPException) as result:
        run_sync(run())
    assert result.value.status_code == 404
    assert user.auth_user_id in db.statements[0].compile().params.values()


def test_resource_delete_returns_not_found_for_unowned_record():
    user = UserProfile(id=uuid.uuid4(), auth_user_id=uuid.uuid4())
    db = FakeSession([FakeResult(rowcount=0)])

    async def run():
        await workflows.delete_resource(uuid.uuid4(), user, db)

    with pytest.raises(HTTPException) as result:
        run_sync(run())
    assert result.value.status_code == 404
    assert user.auth_user_id in db.statements[0].compile().params.values()


def test_artifact_list_returns_latest_version_in_one_query():
    owner_id = uuid.uuid4()
    artifact_ids = [uuid.uuid4(), uuid.uuid4()]
    artifacts = [
        KnowledgeArtifact(
            id=artifact_id,
            owner_id=owner_id,
            title=f"Artifact {index}",
            lifecycle_status="active",
        )
        for index, artifact_id in enumerate(artifact_ids)
    ]
    versions = [
        ArtifactVersion(
            id=uuid.uuid4(),
            artifact_id=artifact.id,
            version_number=3,
            content={"revision": 3},
            created_at=datetime.now(UTC),
        )
        for artifact in artifacts
    ]
    db = FakeSession([FakeResult(rows=list(zip(artifacts, versions, strict=True)))])
    user = UserProfile(id=uuid.uuid4(), auth_user_id=owner_id)

    result = run_sync(workflows.list_artifacts(50, 0, user, db))

    assert len(db.statements) == 1
    assert [item.id for item in result] == artifact_ids
    assert [item.latest_version.version_number for item in result] == [3, 3]
    statement = str(db.statements[0])
    assert "row_number()" in statement
    assert "knowledge_artifacts.updated_at DESC" in statement


def test_public_share_returns_snapshot_only_and_disables_caching():
    db = FakeSession([FakeResult(scalar={"title": "Shared snapshot"})])
    response = Response()
    payload = run_sync(workflows.resolve_share("bearer-value", response, db))

    assert payload.model_dump() == {"snapshot": {"title": "Shared snapshot"}}
    assert response.headers["cache-control"] == (
        "private, no-store, no-cache, max-age=0, must-revalidate"
    )
    assert response.headers["surrogate-control"] == "no-store"
    params = db.statements[0].compile().params.values()
    assert hashlib.sha256(b"bearer-value").hexdigest() in params
    assert "bearer-value" not in params


def test_public_share_invalid_response_also_disables_caching():
    db = FakeSession([FakeResult(scalar=None)])
    response = Response()

    async def run():
        await workflows.resolve_share("invalid-token", response, db)

    with pytest.raises(HTTPException) as result:
        run_sync(run())
    assert result.value.status_code == 404
    assert response.headers["cache-control"].startswith("private, no-store")


def test_access_logs_redact_share_bearer_token_from_request_path():
    import logging

    record = logging.LogRecord(
        "uvicorn.access",
        logging.INFO,
        "server.py",
        1,
        '%s - "%s %s HTTP/%s" %d',
        ("127.0.0.1", "GET", "/api/v1/shares/private-token?x=y", "1.1", 200),
        None,
    )
    assert ShareTokenRedactionFilter().filter(record)
    assert record.args[2] == "/api/v1/shares/[REDACTED]"
