"""Grant the restricted API login membership in podflow_runtime.

Revision ID: b51d0e7c21aa
Revises: a9d6bc18f22e
"""

import re
from collections.abc import Sequence

from alembic import op

revision: str = "b51d0e7c21aa"
down_revision: str | None = "a9d6bc18f22e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_SAFE_ROLE_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_.$-]{0,62}\Z")
_PROTECTED_TABLES = (
    "user_profiles",
    "workspaces",
    "workspace_members",
    "resources",
    "resource_versions",
    "processing_runs",
    "processing_run_resources",
    "knowledge_artifacts",
    "artifact_versions",
    "artifact_version_sources",
    "resource_chunks",
    "conversations",
    "conversation_artifacts",
    "chat_messages",
    "message_artifact_versions",
    "message_citations",
    "presentations",
    "presentation_shares",
)


def upgrade() -> None:
    role_name = op.get_context().config.attributes.get("podflow_runtime_login")
    if not isinstance(role_name, str) or not _SAFE_ROLE_NAME.fullmatch(role_name):
        raise RuntimeError(
            "DATABASE_URL must identify the pre-provisioned restricted runtime login"
        )

    protected_names = ", ".join(f"'{name}'" for name in _PROTECTED_TABLES)
    op.execute(
        f"""
        DO $$ DECLARE login_role record; BEGIN
          SELECT oid, rolcanlogin, rolsuper, rolcreaterole, rolcreatedb,
                 rolreplication, rolbypassrls, rolinherit
          INTO login_role FROM pg_roles WHERE rolname = '{role_name}';
          IF NOT FOUND THEN
            RAISE EXCEPTION 'configured runtime login role does not exist';
          END IF;
          IF NOT login_role.rolcanlogin OR login_role.rolsuper OR login_role.rolcreaterole
             OR login_role.rolcreatedb OR login_role.rolreplication
             OR login_role.rolbypassrls OR login_role.rolinherit THEN
            RAISE EXCEPTION 'runtime login role must be LOGIN, NOINHERIT, and unprivileged';
          END IF;
          IF EXISTS (
            SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname IN ({protected_names})
              AND c.relowner = (SELECT oid FROM pg_roles WHERE rolname = '{role_name}')
          ) THEN
            RAISE EXCEPTION 'runtime login role owns a protected PodFlow table';
          END IF;
          IF EXISTS (
            SELECT 1
            FROM pg_auth_members membership
            JOIN pg_roles granted_role ON granted_role.oid = membership.roleid
            WHERE membership.member = login_role.oid
              AND granted_role.rolname <> 'podflow_runtime'
          ) THEN
            RAISE EXCEPTION 'runtime login role has an unexpected role membership';
          END IF;
          EXECUTE 'GRANT podflow_runtime TO "{role_name}"';
        END $$
        """
    )


def downgrade() -> None:
    role_name = op.get_context().config.attributes.get("podflow_runtime_login")
    if not isinstance(role_name, str) or not _SAFE_ROLE_NAME.fullmatch(role_name):
        raise RuntimeError("DATABASE_URL must identify the runtime login role")
    op.execute(f'REVOKE podflow_runtime FROM "{role_name}"')
