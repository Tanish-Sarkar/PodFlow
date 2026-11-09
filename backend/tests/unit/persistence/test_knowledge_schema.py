import importlib.util
import uuid
from pathlib import Path

import pytest
from pydantic import ValidationError
from sqlalchemy import CheckConstraint, ForeignKeyConstraint, UniqueConstraint, insert
from sqlalchemy.dialects import postgresql

from podflow.persistence.db.models import (
    ArtifactVersion,
    Base,
    KnowledgeArtifact,
    PresentationShare,
    Resource,
    ResourceChunk,
    ResourceVersion,
)
from podflow.schemas.database import (
    ArtifactVersionRead,
    PresentationShareCreate,
    ResourceCreate,
    ResourceRead,
    ResourceUpdate,
    ResourceVersionCreate,
)
from podflow.security.presentation_shares import generate_share_token


def _constraint(table_name: str, constraint_type: type, name: str):
    table = Base.metadata.tables[table_name]
    return next(
        item
        for item in table.constraints
        if isinstance(item, constraint_type) and item.name == name
    )


def test_metadata_has_owner_foreign_keys_and_version_invariants():
    assert next(iter(Resource.__table__.c.owner_id.foreign_keys)).target_fullname == "auth.users.id"
    assert _constraint(
        "resource_versions", UniqueConstraint, "uq_resource_versions_number"
    ).columns.keys() == ["resource_id", "version_number"]
    assert (
        _constraint("artifact_versions", CheckConstraint, "ck_artifact_versions_number_positive")
        is not None
    )
    assert _constraint(
        "processing_run_resources",
        ForeignKeyConstraint,
        "fk_run_resources_version_resource",
    )
    assert ResourceVersion.__table__.c.created_at.type.timezone


def test_chunks_use_unfixed_pgvector_and_record_model_metadata():
    embedding = ResourceChunk.__table__.c.embedding.type
    assert embedding.get_col_spec() == "vector"
    assert ResourceChunk.__table__.c.embedding_model.nullable is False
    assert not any(
        "hnsw" in index.name or "ivfflat" in index.name for index in ResourceChunk.__table__.indexes
    )
    statement = insert(ResourceChunk).values(
        resource_version_id=uuid.uuid4(),
        chunk_index=0,
        text="chunk",
        embedding=[0.2, 0.4],
        embedding_model="embedding-model-id",
    )
    assert "CAST(%(embedding)s AS vector)" in str(statement.compile(dialect=postgresql.dialect()))


def test_artifact_versions_are_versioned_and_store_structured_content():
    assert ArtifactVersion.__table__.c.content.type.__class__.__name__ == "JSONB"
    assert _constraint("artifact_versions", UniqueConstraint, "uq_artifact_versions_number")
    assert KnowledgeArtifact.__table__.c.owner_id.nullable is False


def test_migration_declares_owner_policy_for_each_new_table():
    migration_path = (
        Path(__file__).parents[3]
        / "alembic"
        / "versions"
        / "c2f3a61d740b_initial_knowledge_schema.py"
    )
    spec = importlib.util.spec_from_file_location("knowledge_schema_migration", migration_path)
    assert spec is not None and spec.loader is not None
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)

    assert set(migration.OWNER_PREDICATES) == set(migration.APPLICATION_TABLES)
    assert "Base.metadata" not in migration_path.read_text(encoding="utf-8")
    assert all("app.user_id" in predicate for predicate in migration.OWNER_PREDICATES.values())


def test_share_resolver_checks_expiry_revocation_and_returns_only_snapshot():
    migration_path = (
        Path(__file__).parents[3]
        / "alembic"
        / "versions"
        / "c2f3a61d740b_initial_knowledge_schema.py"
    )
    source = migration_path.read_text(encoding="utf-8")
    resolver = source.split("CREATE FUNCTION public.resolve_presentation_share", 1)[1]
    resolver = resolver.split("$$;", 1)[0]
    assert "SELECT p.snapshot" in resolver
    assert "s.revoked_at IS NULL" in resolver
    assert "s.expires_at > statement_timestamp()" in resolver


def test_resource_create_validates_resource_kind_and_url():
    resource = ResourceCreate(kind="url", submitted_url="https://example.com/a")
    assert str(resource.submitted_url) == "https://example.com/a"
    assert ResourceCreate(kind="upload").submitted_url is None

    with pytest.raises(ValidationError):
        ResourceCreate(kind="url")
    with pytest.raises(ValidationError):
        ResourceCreate(kind="upload", submitted_url="https://example.com")


def test_storage_path_and_version_number_are_validated():
    data = ResourceVersionCreate(
        version_number=1,
        content_hash="sha256:abc",
        storage_object_path="private/user/source.pdf",
    )
    assert data.version_number == 1
    with pytest.raises(ValidationError):
        ResourceVersionCreate(version_number=0, content_hash="sha256:abc")

    assert ResourceUpdate(title="Updated title").title == "Updated title"
    with pytest.raises(ValidationError):
        ResourceUpdate()


def test_share_create_accepts_expiry_but_generates_hash_server_side():
    share = PresentationShareCreate(expires_at="2030-01-01T00:00:00Z")
    issued = generate_share_token()
    assert share.expires_at.year == 2030
    assert len(issued.token_hash) == 64
    assert issued.token_hash != issued.bearer_token
    assert "token_hash" not in PresentationShareCreate.model_fields
    with pytest.raises(ValidationError):
        PresentationShareCreate(
            token_hash="bearer-token-is-not-a-public-input", expires_at="2030-01-01T00:00:00Z"
        )


def test_read_models_serialize_orm_attributes():
    owner_id = uuid.uuid4()
    resource = Resource(
        id=uuid.uuid4(),
        owner_id=owner_id,
        kind="upload",
        submitted_url=None,
        title="Research PDF",
        created_at="2026-10-25T00:00:00+00:00",
        updated_at="2026-10-25T00:00:00+00:00",
    )
    output = ResourceRead.model_validate(resource)
    assert output.owner_id == owner_id
    assert output.title == "Research PDF"

    artifact_version = ArtifactVersion(
        id=uuid.uuid4(),
        artifact_id=uuid.uuid4(),
        version_number=2,
        originating_run_id=None,
        content={"thesis": "A structured snapshot"},
        created_at="2026-10-25T00:00:00+00:00",
    )
    artifact_output = ArtifactVersionRead.model_validate(artifact_version)
    assert artifact_output.content["thesis"] == "A structured snapshot"


def test_presentation_share_token_hash_is_not_returned_by_orm_model():
    assert "token_hash" in PresentationShare.__table__.columns
    # No share read schema exists: callers must expose only resolved snapshots.
    from podflow.schemas import database

    assert not hasattr(database, "PresentationShareRead")
