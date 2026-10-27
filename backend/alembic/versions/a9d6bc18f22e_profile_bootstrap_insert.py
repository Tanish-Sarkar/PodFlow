"""Allow verified users to bootstrap their own profile.

Revision ID: a9d6bc18f22e
Revises: c2f3a61d740b
"""

from collections.abc import Sequence

from alembic import op

revision: str = "a9d6bc18f22e"
down_revision: str | None = "c2f3a61d740b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("GRANT INSERT ON TABLE public.user_profiles TO podflow_runtime")
    op.execute("GRANT DELETE ON TABLE public.conversation_artifacts TO podflow_runtime")


def downgrade() -> None:
    op.execute("REVOKE DELETE ON TABLE public.conversation_artifacts FROM podflow_runtime")
    op.execute("REVOKE INSERT ON TABLE public.user_profiles FROM podflow_runtime")
