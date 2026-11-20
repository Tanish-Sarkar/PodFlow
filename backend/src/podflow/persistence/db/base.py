import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy declarative models.
    """

    type_annotation_map = {uuid.UUID: UUID(as_uuid=True)}


# Supabase Auth owns this table. Declaring its key lets SQLAlchemy resolve
# foreign-key metadata; Alembic never creates or modifies the external table.
Table(
    "users",
    Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    schema="auth",
    info={"external": True},
)


class TimestampMixin:
    """
    Mixin that adds created_at and updated_at columns.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
