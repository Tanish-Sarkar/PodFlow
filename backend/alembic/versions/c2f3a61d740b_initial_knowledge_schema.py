"""Initial owner-scoped PodFlow knowledge schema.

Revision ID: c2f3a61d740b
Revises: 8cf49221e92d
"""

from collections.abc import Sequence

from alembic import op

revision: str = "c2f3a61d740b"
down_revision: str | None = "8cf49221e92d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# This revision is intentionally self-contained. Do not derive an applied schema
# from the application's current SQLAlchemy metadata.
TABLE_DDL = (
    """CREATE TABLE public.resources (
        id uuid PRIMARY KEY,
        owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        kind varchar(16) NOT NULL CHECK (kind IN ('url', 'upload')),
        submitted_url text,
        title text,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_resources_kind_url CHECK (
            (kind = 'url' AND submitted_url IS NOT NULL) OR
            (kind = 'upload' AND submitted_url IS NULL)
        )
    )""",
    """CREATE TABLE public.resource_versions (
        id uuid PRIMARY KEY,
        resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
        version_number integer NOT NULL CHECK (version_number > 0),
        content_hash varchar(128) NOT NULL CHECK (content_hash <> ''),
        fetched_at timestamptz,
        storage_object_path text,
        extracted_text text,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_resource_versions_number UNIQUE (resource_id, version_number),
        CONSTRAINT uq_resource_versions_id_resource UNIQUE (id, resource_id)
    )""",
    """CREATE TABLE public.processing_runs (
        id uuid PRIMARY KEY,
        owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        status varchar(16) NOT NULL CHECK (
            status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')
        ),
        started_at timestamptz,
        finished_at timestamptz,
        model_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        failure_code varchar(100),
        failure_detail text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_processing_runs_timing CHECK (
            finished_at IS NULL OR started_at IS NULL OR finished_at >= started_at
        )
    )""",
    """CREATE TABLE public.processing_run_resources (
        run_id uuid NOT NULL REFERENCES public.processing_runs(id) ON DELETE CASCADE,
        resource_version_id uuid NOT NULL,
        resource_id uuid NOT NULL,
        PRIMARY KEY (run_id, resource_version_id),
        CONSTRAINT fk_run_resources_version_resource
            FOREIGN KEY (resource_version_id, resource_id)
            REFERENCES public.resource_versions(id, resource_id) ON DELETE CASCADE
    )""",
    """CREATE TABLE public.knowledge_artifacts (
        id uuid PRIMARY KEY,
        owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title text NOT NULL,
        lifecycle_status varchar(16) NOT NULL DEFAULT 'active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
    )""",
    """CREATE TABLE public.artifact_versions (
        id uuid PRIMARY KEY,
        artifact_id uuid NOT NULL REFERENCES public.knowledge_artifacts(id) ON DELETE CASCADE,
        version_number integer NOT NULL CHECK (version_number > 0),
        originating_run_id uuid REFERENCES public.processing_runs(id) ON DELETE RESTRICT,
        content jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_artifact_versions_number UNIQUE (artifact_id, version_number)
    )""",
    """CREATE TABLE public.artifact_version_sources (
        artifact_version_id uuid NOT NULL REFERENCES public.artifact_versions(id) ON DELETE CASCADE,
        resource_version_id uuid NOT NULL,
        resource_id uuid NOT NULL,
        PRIMARY KEY (artifact_version_id, resource_version_id),
        CONSTRAINT fk_artifact_sources_version_resource
            FOREIGN KEY (resource_version_id, resource_id)
            REFERENCES public.resource_versions(id, resource_id) ON DELETE RESTRICT
    )""",
    """CREATE TABLE public.resource_chunks (
        id uuid PRIMARY KEY,
        resource_version_id uuid NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
        chunk_index integer NOT NULL CHECK (chunk_index >= 0),
        text text NOT NULL,
        embedding vector,
        embedding_model varchar(200) NOT NULL CHECK (embedding_model <> ''),
        locator jsonb NOT NULL DEFAULT '{}'::jsonb,
        CONSTRAINT uq_resource_chunks_order UNIQUE (resource_version_id, chunk_index),
        CONSTRAINT uq_resource_chunks_id_version UNIQUE (id, resource_version_id)
    )""",
    """CREATE TABLE public.conversations (
        id uuid PRIMARY KEY,
        owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
    )""",
    """CREATE TABLE public.conversation_artifacts (
        conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
        artifact_version_id uuid NOT NULL REFERENCES public.artifact_versions(id) ON DELETE CASCADE,
        attached_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (conversation_id, artifact_version_id)
    )""",
    """CREATE TABLE public.chat_messages (
        id uuid PRIMARY KEY,
        conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
        role varchar(16) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
    )""",
    """CREATE TABLE public.message_artifact_versions (
        message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
        artifact_version_id uuid NOT NULL REFERENCES public.artifact_versions(id) ON DELETE CASCADE,
        PRIMARY KEY (message_id, artifact_version_id)
    )""",
    """CREATE TABLE public.message_citations (
        id uuid PRIMARY KEY,
        message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
        citation_order integer NOT NULL CHECK (citation_order >= 0),
        resource_chunk_id uuid,
        resource_version_id uuid REFERENCES public.resource_versions(id) ON DELETE CASCADE,
        quote text,
        CONSTRAINT ck_message_citations_target CHECK (
            resource_chunk_id IS NOT NULL OR resource_version_id IS NOT NULL
        ),
        CONSTRAINT ck_message_citations_chunk_version_pair CHECK (
            resource_chunk_id IS NULL OR resource_version_id IS NOT NULL
        ),
        CONSTRAINT fk_message_citations_chunk_version
            FOREIGN KEY (resource_chunk_id, resource_version_id)
            REFERENCES public.resource_chunks(id, resource_version_id) ON DELETE CASCADE,
        CONSTRAINT uq_message_citations_order UNIQUE (message_id, citation_order)
    )""",
    """CREATE TABLE public.presentations (
        id uuid PRIMARY KEY,
        owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        artifact_version_id uuid NOT NULL REFERENCES public.artifact_versions(id) ON DELETE CASCADE,
        snapshot jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
    )""",
    """CREATE TABLE public.presentation_shares (
        id uuid PRIMARY KEY,
        presentation_id uuid NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
        token_hash varchar(64) NOT NULL UNIQUE
            CHECK (token_hash ~ '^[0-9a-f]{64}$'),
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
    )""",
)

INDEX_DDL = (
    "CREATE INDEX ix_resources_owner_created ON public.resources(owner_id, created_at)",
    "CREATE INDEX ix_resource_versions_hash ON public.resource_versions(content_hash)",
    "CREATE INDEX ix_processing_runs_owner_created ON public.processing_runs(owner_id, created_at)",
    """CREATE INDEX ix_knowledge_artifacts_owner_updated
       ON public.knowledge_artifacts(owner_id, updated_at)""",
    """CREATE INDEX ix_artifact_versions_artifact_created
       ON public.artifact_versions(artifact_id, created_at)""",
    """CREATE INDEX ix_resource_chunks_resource_version
       ON public.resource_chunks(resource_version_id)""",
    "CREATE INDEX ix_conversations_owner_updated ON public.conversations(owner_id, updated_at)",
    """CREATE INDEX ix_chat_messages_conversation_created
       ON public.chat_messages(conversation_id, created_at)""",
    "CREATE INDEX ix_presentations_owner_created ON public.presentations(owner_id, created_at)",
    "CREATE INDEX ix_presentation_shares_expiry ON public.presentation_shares(expires_at)",
)

OWNER_PREDICATES = {
    "resources": "owner_id = nullif(current_setting('app.user_id', true), '')::uuid",
    "resource_versions": """
        EXISTS (
          SELECT 1 FROM public.resources r
          WHERE r.id = resource_versions.resource_id
            AND r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
        )
    """,
    "processing_runs": "owner_id = nullif(current_setting('app.user_id', true), '')::uuid",
    "processing_run_resources": """
        EXISTS (
          SELECT 1 FROM public.processing_runs r
          JOIN public.resources s ON s.id = processing_run_resources.resource_id
          WHERE r.id = processing_run_resources.run_id
            AND r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
            AND s.owner_id = r.owner_id
        )
    """,
    "knowledge_artifacts": "owner_id = nullif(current_setting('app.user_id', true), '')::uuid",
    "artifact_versions": """
        EXISTS (
          SELECT 1 FROM public.knowledge_artifacts a
          WHERE a.id = artifact_versions.artifact_id
            AND a.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
        ) AND (
          originating_run_id IS NULL OR EXISTS (
            SELECT 1 FROM public.processing_runs r
            WHERE r.id = artifact_versions.originating_run_id
              AND r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
          )
        )
    """,
    "artifact_version_sources": """
        EXISTS (
          SELECT 1 FROM public.artifact_versions v
          JOIN public.knowledge_artifacts a ON a.id = v.artifact_id
          JOIN public.resources r ON r.id = artifact_version_sources.resource_id
          WHERE v.id = artifact_version_sources.artifact_version_id
            AND a.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
            AND r.owner_id = a.owner_id
        )
    """,
    "resource_chunks": """
        EXISTS (
          SELECT 1 FROM public.resource_versions v
          JOIN public.resources r ON r.id = v.resource_id
          WHERE v.id = resource_chunks.resource_version_id
            AND r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
        )
    """,
    "conversations": "owner_id = nullif(current_setting('app.user_id', true), '')::uuid",
    "conversation_artifacts": """
        EXISTS (
          SELECT 1 FROM public.conversations c
          JOIN public.artifact_versions v ON v.id = conversation_artifacts.artifact_version_id
          JOIN public.knowledge_artifacts a ON a.id = v.artifact_id
          WHERE c.id = conversation_artifacts.conversation_id
            AND c.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
            AND a.owner_id = c.owner_id
        )
    """,
    "chat_messages": """
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = chat_messages.conversation_id
            AND c.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
        )
    """,
    "message_artifact_versions": """
        EXISTS (
          SELECT 1 FROM public.chat_messages m
          JOIN public.conversations c ON c.id = m.conversation_id
          JOIN public.artifact_versions v ON v.id = message_artifact_versions.artifact_version_id
          JOIN public.knowledge_artifacts a ON a.id = v.artifact_id
          WHERE m.id = message_artifact_versions.message_id
            AND c.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
            AND a.owner_id = c.owner_id
        )
    """,
    "message_citations": """
        EXISTS (
          SELECT 1 FROM public.chat_messages m
          JOIN public.conversations c ON c.id = m.conversation_id
          WHERE m.id = message_citations.message_id
            AND c.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
        ) AND (
          resource_chunk_id IS NULL OR EXISTS (
            SELECT 1 FROM public.resource_chunks ch
            JOIN public.resource_versions v ON v.id = ch.resource_version_id
            JOIN public.resources r ON r.id = v.resource_id
            WHERE ch.id = message_citations.resource_chunk_id
              AND r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
          )
        ) AND (
          resource_version_id IS NULL OR EXISTS (
            SELECT 1 FROM public.resource_versions v
            JOIN public.resources r ON r.id = v.resource_id
            WHERE v.id = message_citations.resource_version_id
              AND r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
          )
        )
    """,
    "presentations": """
        presentations.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
        AND EXISTS (
          SELECT 1 FROM public.artifact_versions v
          JOIN public.knowledge_artifacts a ON a.id = v.artifact_id
          WHERE v.id = presentations.artifact_version_id
            AND a.owner_id = presentations.owner_id
        )
    """,
    "presentation_shares": """
        EXISTS (
          SELECT 1 FROM public.presentations p
          WHERE p.id = presentation_shares.presentation_id
            AND p.owner_id = nullif(current_setting('app.user_id', true), '')::uuid
        )
    """,
}

APPLICATION_TABLES = tuple(OWNER_PREDICATES)
IMMUTABLE_TABLES = (
    "resource_versions",
    "artifact_versions",
    "artifact_version_sources",
    "resource_chunks",
    "message_artifact_versions",
    "message_citations",
    "presentations",
)


def upgrade() -> None:
    op.execute(
        """
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
            IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
              CREATE EXTENSION vector WITH SCHEMA extensions;
            ELSE
              CREATE EXTENSION vector;
            END IF;
          END IF;
        END $$
        """
    )
    op.execute(
        """
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
            PERFORM set_config('search_path', 'public, extensions', true);
          END IF;
        END $$
        """
    )

    # Existing timestamps were written as UTC-naive timestamps by old revisions.
    for table_name in ("user_profiles", "workspaces"):
        op.execute(
            f'ALTER TABLE public."{table_name}" '
            "ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC', "
            "ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC'"
        )

    op.execute(
        """
        DO $$ BEGIN
          IF EXISTS (
            SELECT 1 FROM public.user_profiles p
            LEFT JOIN auth.users u ON u.id = p.auth_user_id
            WHERE u.id IS NULL
          ) THEN
            RAISE EXCEPTION 'orphan user_profiles rows prevent adding the auth.users foreign key';
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'fk_user_profiles_auth_user_id_auth_users'
              AND conrelid = 'public.user_profiles'::regclass
          ) THEN
            ALTER TABLE public.user_profiles
              ADD CONSTRAINT fk_user_profiles_auth_user_id_auth_users
              FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
          END IF;
        END $$
        """
    )

    op.execute(
        """
        DO $$ DECLARE role_row record; runtime_oid oid; BEGIN
          SELECT oid, rolsuper, rolbypassrls, rolcanlogin INTO role_row
          FROM pg_roles WHERE rolname = 'podflow_runtime';
          IF NOT FOUND THEN
            EXECUTE 'CREATE ROLE podflow_runtime NOLOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT';
          ELSIF role_row.rolsuper OR role_row.rolbypassrls OR role_row.rolcanlogin THEN
            RAISE EXCEPTION 'existing podflow_runtime role is not a restricted NOLOGIN role';
          END IF;
          SELECT oid INTO runtime_oid FROM pg_roles WHERE rolname = 'podflow_runtime';
          IF EXISTS (
            SELECT 1
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relowner = runtime_oid
              AND c.relname IN (
                'user_profiles', 'workspaces', 'workspace_members', 'resources',
                'resource_versions', 'processing_runs', 'processing_run_resources',
                'knowledge_artifacts', 'artifact_versions', 'artifact_version_sources',
                'resource_chunks', 'conversations', 'conversation_artifacts', 'chat_messages',
                'message_artifact_versions', 'message_citations', 'presentations',
                'presentation_shares'
              )
          ) THEN
            RAISE EXCEPTION 'podflow_runtime owns a protected PodFlow table';
          END IF;
          EXECUTE format('GRANT podflow_runtime TO %I', current_user);
        END $$
        """
    )

    for statement in TABLE_DDL:
        op.execute(statement)
    for statement in INDEX_DDL:
        op.execute(statement)

    op.execute("ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY owner_scope ON public.user_profiles "
        "USING (auth_user_id = nullif(current_setting('app.user_id', true), '')::uuid) "
        "WITH CHECK (auth_user_id = nullif(current_setting('app.user_id', true), '')::uuid)"
    )
    # Retained workspace tables are explicitly inaccessible to application/API roles.
    op.execute("ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY")

    for table_name, predicate in OWNER_PREDICATES.items():
        op.execute(f'ALTER TABLE public."{table_name}" ENABLE ROW LEVEL SECURITY')
        op.execute(
            f'CREATE POLICY owner_scope ON public."{table_name}" '
            f"USING ({predicate}) WITH CHECK ({predicate})"
        )

    for table_name in (*APPLICATION_TABLES, "user_profiles", "workspaces", "workspace_members"):
        op.execute(f'REVOKE ALL ON TABLE public."{table_name}" FROM PUBLIC')
        op.execute(f'REVOKE ALL ON TABLE public."{table_name}" FROM podflow_runtime')
        op.execute(
            f"DO $$ BEGIN "
            f"IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN "
            f"EXECUTE 'REVOKE ALL ON TABLE public.\"{table_name}\" FROM anon'; END IF; "
            f"IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN "
            f"EXECUTE 'REVOKE ALL ON TABLE public.\"{table_name}\" FROM authenticated'; END IF; "
            f"END $$"
        )

    op.execute("GRANT SELECT ON TABLE public.user_profiles TO podflow_runtime")
    for table_name in (
        "resources",
        "processing_runs",
        "conversations",
    ):
        op.execute(
            f'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."{table_name}" '
            "TO podflow_runtime"
        )
    op.execute(
        "GRANT SELECT, INSERT, UPDATE ON TABLE public.knowledge_artifacts TO podflow_runtime"
    )
    for table_name in (
        "resource_versions",
        "processing_run_resources",
        "artifact_versions",
        "artifact_version_sources",
        "resource_chunks",
        "conversation_artifacts",
        "chat_messages",
        "message_artifact_versions",
        "message_citations",
        "presentations",
    ):
        op.execute(f'GRANT SELECT, INSERT ON TABLE public."{table_name}" TO podflow_runtime')
    op.execute("GRANT SELECT, INSERT ON TABLE public.presentation_shares TO podflow_runtime")
    op.execute("GRANT UPDATE (revoked_at) ON TABLE public.presentation_shares TO podflow_runtime")
    for table_name in IMMUTABLE_TABLES:
        op.execute(f'REVOKE UPDATE, DELETE ON TABLE public."{table_name}" FROM podflow_runtime')

    op.execute(
        """
        CREATE FUNCTION public.reject_provenance_update()
        RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public
        AS $$ BEGIN RAISE EXCEPTION 'provenance records are immutable'; END $$
        """
    )
    for table_name in ("artifact_versions", "artifact_version_sources"):
        op.execute(
            f'CREATE TRIGGER "{table_name}_immutable" BEFORE UPDATE ON public."{table_name}" '
            "FOR EACH ROW EXECUTE FUNCTION public.reject_provenance_update()"
        )

    op.execute(
        """
        CREATE FUNCTION public.resolve_presentation_share(p_token_hash text)
        RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER
        SET search_path = pg_catalog, public
        AS $$
          SELECT p.snapshot
          FROM public.presentation_shares AS s
          JOIN public.presentations AS p ON p.id = s.presentation_id
          WHERE s.token_hash = p_token_hash
            AND s.revoked_at IS NULL
            AND s.expires_at > statement_timestamp()
          LIMIT 1
        $$
        """
    )
    op.execute("REVOKE ALL ON FUNCTION public.resolve_presentation_share(text) FROM PUBLIC")
    op.execute(
        "GRANT EXECUTE ON FUNCTION public.resolve_presentation_share(text) TO podflow_runtime"
    )
    op.execute(
        """
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
            EXECUTE 'GRANT EXECUTE ON FUNCTION public.resolve_presentation_share(text) TO anon';
          END IF;
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
            EXECUTE 'GRANT EXECUTE ON FUNCTION public.resolve_presentation_share(text) '
              'TO authenticated';
          END IF;
        END $$
        """
    )


def downgrade() -> None:
    raise RuntimeError(
        "This revision protects user data and is not downgradeable on a shared database. "
        "Use a reviewed forward migration instead."
    )
