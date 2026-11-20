"""Prevent duplicate URL resources for the same owner.

Revision ID: d3b8f4a91c20
Revises: b51d0e7c21aa
"""

from collections.abc import Sequence

from alembic import op
from sqlalchemy import text

revision: str = "d3b8f4a91c20"
down_revision: str | None = "b51d0e7c21aa"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """DO $$ BEGIN
        IF EXISTS (
            SELECT 1 FROM public.resources
            WHERE kind = 'url'
            GROUP BY owner_id, submitted_url
            HAVING count(*) > 1
        ) THEN
            RAISE EXCEPTION 'duplicate owner URL resources prevent uniqueness migration';
        END IF;
        END $$"""
    )
    op.create_index(
        "uq_resources_owner_url",
        "resources",
        ["owner_id", "submitted_url"],
        unique=True,
        schema="public",
        postgresql_where=text("kind = 'url'"),
    )


def downgrade() -> None:
    op.drop_index("uq_resources_owner_url", table_name="resources", schema="public")
