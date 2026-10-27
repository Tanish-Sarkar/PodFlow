# PodFlow Database Schema and Migration Guide

This document records the initial persistence design in `backend/`. It is an incremental migration after the repository's existing profile/workspace revisions; it does not claim that a configured Supabase database has been inspected or migrated.

## Repository audit

- Branch at implementation start: `feature/backend-foundation`, four commits ahead of its tracking branch. The user-owned untracked `docs/Design_images/` directory was preserved.
- Existing backend: FastAPI health routes, async SQLAlchemy/psycopg, Alembic, Pydantic v2, and `uv`. Existing migrations create `user_profiles`, `workspaces`, and `workspace_members`.
- Product documentation (`00`, `01`, `02`, `04`, `11`, and current-state audit `15`) establishes PostgreSQL/pgvector, Supabase Auth/Storage, owner-scoped data and immutable artifact versions. It does not select an embedding model or dimension, and says the Supabase integration is not implemented.
- The existing workspace migration is retained for history and existing installations. New domain rows use direct `auth.users` ownership. No workspace foreign keys are introduced.
- The configured database host/user project reference matches the configured Supabase URL project reference. Read-only catalog preflight could not connect because DNS lookup failed, so public tables, Alembic revision, pgvector installation, and role flags remain unknown. No remote migration was attempted.

## Tables

All primary keys are UUIDs. New timestamps are timezone-aware. User-owned top-level records reference `auth.users(id)`; child rows inherit authorization through their parent relationships. Database objects are in `public`, except for the Supabase-managed `auth.users` reference and pgvector extension.

| Table | Purpose and essential data | Keys, indexes, relationships |
| --- | --- | --- |
| `resources` | Submitted URL or uploaded-file identity, title and metadata. | UUID PK; `owner_id` FK to `auth.users`; kind/URL checks; owner/created index. |
| `resource_versions` | Immutable fetched/extracted snapshot metadata, hash, timestamps, optional private Storage object path and extracted text. | UUID PK; resource FK; unique resource/version; hash index. Binary file bytes remain in private Supabase Storage. |
| `resource_chunks` | Searchable chunk text, locator, embedding and embedding-model identifier. | UUID PK; version FK; unique version/order; pgvector column. No ANN index until model dimension is selected. |
| `processing_runs` | Run status, timing, model metadata and failure details. | UUID PK; owner FK; status/timing checks; owner/created index. |
| `processing_run_resources` | Exact resource versions consumed by a multi-source run. | Composite PK; run FK; composite version/resource FK; unique run/version. |
| `knowledge_artifacts` | Owner-scoped artifact identity and lifecycle status. | UUID PK; owner FK; owner/updated index. |
| `artifact_versions` | Immutable JSONB artifact snapshot and optional originating run. | UUID PK; artifact/run FKs; unique artifact/version; positive version check; update-blocking trigger. |
| `artifact_version_sources` | Resource-version provenance for an exact artifact version. | Composite PK; artifact-version FK; composite resource-version/resource FK; unique pair. |
| `conversations` | Owner-scoped chat session. | UUID PK; owner FK; owner/updated index. |
| `conversation_artifacts` | Artifact versions currently attached to a conversation. | Composite PK; conversation and artifact-version FKs. |
| `chat_messages` | Persisted user, assistant or system messages. | UUID PK; conversation FK; role check; conversation/created index. |
| `message_artifact_versions` | Historical artifact-version scope used for a specific answer. | Composite PK; message and artifact-version FKs. |
| `message_citations` | Citation order and optional chunk/source-version reference for a message. | UUID PK; message/chunk/version FKs; unique message/order; target check. |
| `presentations` | View-only JSONB snapshot tied to one artifact version. | UUID PK; owner and artifact-version FKs; owner/created index. |
| `presentation_shares` | Revocable, expiring share metadata for one presentation. | UUID PK; presentation FK; unique SHA-256 token hash; expiry index. |

No exports, generic profiles, new workspace layer, newsletter, connector, recipient, or evaluation tables are added. Existing `user_profiles` remains for the prior authentication scaffold.

## Ownership and RLS access pattern

The policies use transaction-local `app.user_id`. `get_db` connects using the restricted application login in `DATABASE_URL`, then switches each request transaction to the migration-created `podflow_runtime` role before yielding a session. That role is `NOLOGIN`, `NOSUPERUSER`, `NOBYPASSRLS`, and is not the owner of the protected tables. After a Supabase JWT is verified, the backend sets `app.user_id` from its UUID subject before querying `user_profiles`. The same transaction sets a `public, extensions` search path for pgvector type resolution. Settings reset at transaction end.

The initial migration grants membership in `podflow_runtime` to its migration connection role. The API also requires the restricted login named by `DATABASE_URL` to be a member; forward revision `b51d0e7c21aa` checks that this login is `LOGIN`, `NOINHERIT`, unprivileged, not a protected table owner, and has no other role memberships before granting it membership. Alembic reads the separate admin-only `ALEMBIC_DATABASE_URL`; the FastAPI `Settings` model does not include it. Profile INSERT and conversation-attachment DELETE privileges are supplied by `a9d6bc18f22e`. Review both additive revisions before applying. Role-switch behavior remains untested against a database; do not claim effective production RLS.

Before applying grants, the migration revokes any prior privileges on the protected tables from `podflow_runtime` and stops if that role already owns any protected or retained legacy table. The runtime role has no DELETE grant on knowledge artifacts, so a regular request cannot cascade-delete immutable artifact versions or their provenance.

JWT verification now derives issuer and the default JWKS endpoint from `SUPABASE_URL` (or accepts `SUPABASE_JWKS_URL`), requires `exp`, `iss`, `aud`, and UUID `sub`, restricts algorithms to asymmetric signing algorithms, and caches the JWKS for five minutes. It deliberately rejects HS256. The Supabase project must use an asymmetric signing key before authenticated routes can accept its tokens. See [Supabase JWT verification](https://supabase.com/docs/guides/auth/jwts) and [signing keys](https://supabase.com/docs/guides/auth/signing-keys).

## Share resolution

The public create payload accepts only `expires_at`. The creation boundary generates a random bearer token and stores only its SHA-256 hex digest; its one-time output model contains the bearer token and never the digest. `resolve_presentation_share(token_hash)` returns only the presentation `snapshot`, and only when `expires_at` is in the future and `revoked_at` is null. The function does not return the artifact version, source files, conversation, or dashboard data. A future serving path must hash the presented token, call this function for every request, and avoid caching the response.

## Structured content contracts

The authoritative product documents describe artifact content (claims, takeaways, evidence, sources) and constrained presentation data, but do not define a canonical versioned field schema. `ArtifactVersionCreate.content` and `PresentationCreate.snapshot` therefore currently validate only that a JSON object is supplied. Nested/versioned payload validation remains an unresolved contract; no field names or schema version are invented here.

## Embeddings

No embedding model or dimension is selected in repository code or authoritative docs. `resource_chunks.embedding` therefore uses pgvector's unconstrained `vector` type and has no ANN index. This stores vector values without inventing a size, but does not complete indexed retrieval. Once the model is approved, add an incremental migration that fixes the dimension, validates stored vectors, and creates an HNSW or IVFFlat index using the model's supported distance metric. Do not apply that dimension-fixing revision before the model choice.

The migration enables `vector` in the existing `extensions` schema when present, otherwise in the normal extension search path. It does not create or alter Supabase Storage internals or other managed schemas.

## Local setup and commands

1. Configure the Supabase project URL and database connection in the ignored backend environment. Never paste or print them. The configured project reference should match between the URLs.
2. Run a read-only preflight: list public tables and current Alembic revision, inspect the `vector` extension schema, check `rolsuper`/`rolbypassrls`/`rolcreaterole`, and check whether `podflow_runtime` exists and owns any protected tables. Stop if existing tables/data conflict or role creation is not permitted; do not drop or truncate anything.
3. Provision the restricted `podflow_app` LOGIN role out of band, set its password interactively, and use it in `DATABASE_URL`. The admin migration then grants it membership in the migration-created `podflow_runtime` role after validating role flags and ownership. Verify through the runtime login that `session_user = podflow_app`, `current_user = podflow_runtime` after role switch, and both roles are non-superuser/non-owner/`NOBYPASSRLS` before exposing private routes.
4. Review the migration. Embedding dimension/index remain pending until a model is selected.
5. From `backend/`, use the existing `uv` environment:

```powershell
uv sync --all-extras --locked
uv run alembic -c alembic.ini heads
uv run alembic -c alembic.ini upgrade head
uv run ruff check .
uv run pytest
```

Run migration upgrade tests only against a disposable local PostgreSQL database with pgvector enabled. Never point integration-test cleanup or downgrade commands at a shared or production database. Do not run downgrade against a database containing user data.

## Validation status for this change

- The Alembic graph has one head, `b51d0e7c21aa`, after `8cf49221e92d`; `c2f3a61d740b` is the initial knowledge schema, `a9d6bc18f22e` adds profile/attachment privileges, and `b51d0e7c21aa` grants validated membership to the configured runtime login.
- The read-only configuration comparison found that the configured database project reference matches `SUPABASE_URL`. Catalog preflight failed at DNS resolution for the database host; existing public tables, Alembic revision, extension schema and migration/runtime role flags remain unknown. No remote migration was applied.
- Phase 3 second-pass focused run: 49 passed, 2 skipped across API contracts/behavior, auth/JWT/profile bootstrap, configuration, schema/workspace, runtime-role/RLS, and share integration tests. Both skipped integration tests require explicitly configured disposable local PostgreSQL connections and the reviewed schema migrations.
- Full `pytest -q` did not complete on this Windows environment; it stopped progressing after nine tests at the existing TestClient health-test area. The focused test command above completed.
- Full `pytest -q` did not complete: execution stalled when entering the existing Windows `TestClient` health test. The focused auth/schema run completes and includes the rewritten, deterministic JWT tests.
- `ruff check .`, an explicit Ruff check of the excluded migration revision, `git diff --check`, `alembic heads`, and an offline `alembic upgrade head --sql` render passed. The offline render is not evidence of execution against PostgreSQL.
- No disposable PostgreSQL/pgvector endpoint was available for migration-upgrade, constraint behavior, runtime-role, RLS isolation or share-resolution execution.
- PyJWT's `crypto` extra is declared and locked. The pgvector column stays dimensionless and has no ANN index until the embedding model is selected.
- The content/presentation payload contracts and live runtime-role behavior remain unverified decisions.
