import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    cast,
    func,
)
from sqlalchemy import (
    text as sql_text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import UserDefinedType

from podflow.persistence.db.base import Base, TimestampMixin


class Vector(UserDefinedType[list[float]]):
    """PostgreSQL pgvector type while the product embedding dimension is undecided."""

    cache_ok = True

    def get_col_spec(self, **kw: Any) -> str:
        return "vector"

    def bind_expression(self, bindvalue: Any) -> Any:
        return cast(bindvalue, self)

    def bind_processor(self, dialect: Any):
        def serialize(value: list[float] | None) -> str | None:
            if value is None:
                return None
            return "[" + ",".join(str(float(item)) for item in value) + "]"

        return serialize

    def result_processor(self, dialect: Any, coltype: Any):
        def deserialize(value: str | None) -> list[float] | None:
            if value is None:
                return None
            return [float(item) for item in value.strip("[]").split(",") if item]

        return deserialize


class Resource(Base, TimestampMixin):
    __tablename__ = "resources"
    __table_args__ = (
        CheckConstraint("kind IN ('url', 'upload')", name="ck_resources_kind"),
        CheckConstraint(
            "(kind = 'url' AND submitted_url IS NOT NULL) OR "
            "(kind = 'upload' AND submitted_url IS NULL)",
            name="ck_resources_kind_url",
        ),
        Index("ix_resources_owner_created", "owner_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False
    )
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    submitted_url: Mapped[str | None] = mapped_column(Text)
    title: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(
        "metadata", JSONB, nullable=False, default=dict, server_default=sql_text("'{}'::jsonb")
    )


class ResourceVersion(Base):
    __tablename__ = "resource_versions"
    __table_args__ = (
        UniqueConstraint("resource_id", "version_number", name="uq_resource_versions_number"),
        UniqueConstraint("id", "resource_id", name="uq_resource_versions_id_resource"),
        CheckConstraint("version_number > 0", name="ck_resource_versions_number_positive"),
        CheckConstraint("content_hash <> ''", name="ck_resource_versions_hash_nonempty"),
        Index("ix_resource_versions_hash", "content_hash"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    resource_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resources.id", ondelete="CASCADE"), nullable=False
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    storage_object_path: Mapped[str | None] = mapped_column(Text)
    extracted_text: Mapped[str | None] = mapped_column(Text)
    source_metadata: Mapped[dict[str, Any]] = mapped_column(
        "metadata", JSONB, nullable=False, default=dict, server_default=sql_text("'{}'::jsonb")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ProcessingRun(Base, TimestampMixin):
    __tablename__ = "processing_runs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')",
            name="ck_processing_runs_status",
        ),
        CheckConstraint(
            "finished_at IS NULL OR started_at IS NULL OR finished_at >= started_at",
            name="ck_processing_runs_timing",
        ),
        Index("ix_processing_runs_owner_created", "owner_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="queued")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    model_metadata: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, default=dict, server_default=sql_text("'{}'::jsonb")
    )
    failure_code: Mapped[str | None] = mapped_column(String(100))
    failure_detail: Mapped[str | None] = mapped_column(Text)


class ProcessingRunResource(Base):
    __tablename__ = "processing_run_resources"
    __table_args__ = (
        ForeignKeyConstraint(
            ["resource_version_id", "resource_id"],
            ["resource_versions.id", "resource_versions.resource_id"],
            ondelete="CASCADE",
            name="fk_run_resources_version_resource",
        ),
    )

    run_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("processing_runs.id", ondelete="CASCADE"), primary_key=True
    )
    resource_version_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    resource_id: Mapped[uuid.UUID] = mapped_column(nullable=False)


class KnowledgeArtifact(Base, TimestampMixin):
    __tablename__ = "knowledge_artifacts"
    __table_args__ = (Index("ix_knowledge_artifacts_owner_updated", "owner_id", "updated_at"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    lifecycle_status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="active", server_default="active"
    )


class ArtifactVersion(Base):
    __tablename__ = "artifact_versions"
    __table_args__ = (
        UniqueConstraint("artifact_id", "version_number", name="uq_artifact_versions_number"),
        CheckConstraint("version_number > 0", name="ck_artifact_versions_number_positive"),
        ForeignKeyConstraint(["originating_run_id"], ["processing_runs.id"], ondelete="RESTRICT"),
        Index("ix_artifact_versions_artifact_created", "artifact_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    artifact_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("knowledge_artifacts.id", ondelete="CASCADE"), nullable=False
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    originating_run_id: Mapped[uuid.UUID | None] = mapped_column()
    content: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ArtifactVersionSource(Base):
    __tablename__ = "artifact_version_sources"
    __table_args__ = (
        ForeignKeyConstraint(
            ["resource_version_id", "resource_id"],
            ["resource_versions.id", "resource_versions.resource_id"],
            ondelete="RESTRICT",
            name="fk_artifact_sources_version_resource",
        ),
        UniqueConstraint(
            "artifact_version_id", "resource_version_id", name="uq_artifact_sources_version"
        ),
    )

    artifact_version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("artifact_versions.id", ondelete="CASCADE"), primary_key=True
    )
    resource_version_id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    resource_id: Mapped[uuid.UUID] = mapped_column(nullable=False)


class ResourceChunk(Base):
    __tablename__ = "resource_chunks"
    __table_args__ = (
        UniqueConstraint("resource_version_id", "chunk_index", name="uq_resource_chunks_order"),
        UniqueConstraint("id", "resource_version_id", name="uq_resource_chunks_id_version"),
        CheckConstraint("chunk_index >= 0", name="ck_resource_chunks_index"),
        CheckConstraint("embedding_model <> ''", name="ck_resource_chunks_embedding_model"),
        Index("ix_resource_chunks_resource_version", "resource_version_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    resource_version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resource_versions.id", ondelete="CASCADE"), nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(Vector())
    embedding_model: Mapped[str] = mapped_column(String(200), nullable=False)
    locator: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, default=dict, server_default=sql_text("'{}'::jsonb")
    )


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"
    __table_args__ = (Index("ix_conversations_owner_updated", "owner_id", "updated_at"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str | None] = mapped_column(Text)


class ConversationArtifact(Base):
    __tablename__ = "conversation_artifacts"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True
    )
    artifact_version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("artifact_versions.id", ondelete="CASCADE"), primary_key=True
    )
    attached_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant', 'system')", name="ck_chat_messages_role"),
        Index("ix_chat_messages_conversation_created", "conversation_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class MessageArtifactVersion(Base):
    __tablename__ = "message_artifact_versions"

    message_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_messages.id", ondelete="CASCADE"), primary_key=True
    )
    artifact_version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("artifact_versions.id", ondelete="CASCADE"), primary_key=True
    )


class MessageCitation(Base):
    __tablename__ = "message_citations"
    __table_args__ = (
        CheckConstraint(
            "resource_chunk_id IS NOT NULL OR resource_version_id IS NOT NULL",
            name="ck_message_citations_target",
        ),
        CheckConstraint(
            "resource_chunk_id IS NULL OR resource_version_id IS NOT NULL",
            name="ck_message_citations_chunk_version_pair",
        ),
        CheckConstraint("citation_order >= 0", name="ck_message_citations_order"),
        ForeignKeyConstraint(
            ["resource_chunk_id", "resource_version_id"],
            ["resource_chunks.id", "resource_chunks.resource_version_id"],
            ondelete="CASCADE",
            name="fk_message_citations_chunk_version",
        ),
        ForeignKeyConstraint(["resource_version_id"], ["resource_versions.id"], ondelete="CASCADE"),
        UniqueConstraint("message_id", "citation_order", name="uq_message_citations_order"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    message_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False
    )
    citation_order: Mapped[int] = mapped_column(Integer, nullable=False)
    resource_chunk_id: Mapped[uuid.UUID | None] = mapped_column()
    resource_version_id: Mapped[uuid.UUID | None] = mapped_column()
    quote: Mapped[str | None] = mapped_column(Text)


class Presentation(Base):
    __tablename__ = "presentations"
    __table_args__ = (Index("ix_presentations_owner_created", "owner_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False
    )
    artifact_version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("artifact_versions.id", ondelete="CASCADE"), nullable=False
    )
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class PresentationShare(Base):
    __tablename__ = "presentation_shares"
    __table_args__ = (
        UniqueConstraint("token_hash", name="uq_presentation_shares_token_hash"),
        CheckConstraint("token_hash ~ '^[0-9a-f]{64}$'", name="ck_presentation_shares_token_hash"),
        Index("ix_presentation_shares_expiry", "expires_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    presentation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("presentations.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
