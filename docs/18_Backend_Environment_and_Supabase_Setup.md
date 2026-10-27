# Backend Environment and Supabase Setup

**Status:** Phase 1 setup guide. No database schema or API routes are implemented by this document.

## What the current code needs

The backend connects to PostgreSQL through SQLAlchemy and `psycopg`, and now verifies Supabase user access tokens through the project JWKS endpoint. It does not yet use a Supabase client, Data API, Storage, or Auth SDK. `backend/.env.example` lists the database, project URL, and optional explicit JWKS URL used by the current backend.

The product can still use one Supabase project for the planned platform. These are distinct services inside that project, not three separate databases:

| Responsibility | Recommended place | What belongs there |
| --- | --- | --- |
| Identity and login | Supabase Auth, backed by its managed `auth` schema in the same Postgres project | Google identity, email, sessions, token lifecycle. Do not store passwords in PodFlow's app tables. |
| Product records | Supabase Postgres `public` schema | App profile linked to Auth user ID, workspaces/projects, source/run metadata, artifact metadata and versions, citations, chats, export/share records. |
| Source and export files | Supabase Storage buckets | Original PDFs/documents and generated binary exports. Postgres should keep each object's path, owner, media type, size, checksum, and lifecycle metadata. Do not manipulate Supabase's internal `storage` schema directly. |
| RAG chunks and embeddings | The same Postgres database, using the `vector` extension (`pgvector`) | Chunk text/provenance and embedding vectors with relational metadata so retrieval can filter by owner and selected artifact scope. This is not a third database. |

“RDS” usually means AWS Relational Database Service. If you mean a relational database generically, Supabase Postgres fills that role and there is no need to add AWS RDS. Auth identities are also stored by Supabase in Postgres, but in a service-managed schema; app-specific profile/project records belong in app-owned tables. Supabase recommends linking app rows to the primary key in `auth.users`, not copying authentication credentials into a second user table: [Auth user data guidance](https://supabase.com/docs/guides/auth/managing-user-data).

Knowledge Artifact content should not all be pushed into object storage by default. Keep structured, queryable artifact content, citations, ownership, and version metadata in Postgres; store large original files and downloadable renderings in Storage. Phase 2 will decide whether unusually large immutable artifact payloads also need an object copy. Embeddings consume the Postgres database quota. Enable `vector` and choose its dimension/index only during the separately authorized schema phase: [Supabase vector columns](https://supabase.com/docs/guides/ai/vector-columns).

### Authentication choice

Recommended direction: **Supabase Auth handles identity and Google OAuth; PodFlow owns the sign-in page and product experience.** A custom UI does not require building authentication from scratch. The Next.js UI can call Supabase Auth; Supabase handles the OAuth exchange, sessions, and tokens. The backend later validates the access token using Supabase's public signing keys/JWKS and enforces product authorization. Supabase documents this Next.js pattern and Google provider setup: [Next.js Auth](https://supabase.com/docs/guides/auth/quickstarts/nextjs), [Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

Building identity fully in PodFlow would mean owning OAuth callbacks, session/refresh-token security, account linking, recovery, revocation, abuse protections, and signing-key operations. There is no product requirement that makes that extra burden valuable right now. We can revisit the provider decision before enabling Google Auth, but the managed-auth/custom-UI option is the simpler starting point.

| Variable | Status in current code | Setup guidance |
| --- | --- | --- |
| `DATABASE_URL` | Runtime connection URI. | Use the restricted application login, granted membership in `podflow_runtime`. FastAPI switches each request transaction to that `NOBYPASSRLS`, non-owner role. |
| `ALEMBIC_DATABASE_URL` | Admin-only migration connection URI. | Set only in ignored `backend/.env` for deliberate Alembic commands. The application never uses it. |
| `APP_ENV` | Optional; defaults to `development`. | Keep `development` locally. SQL statement logging is disabled so parameters and private data are not emitted. |
| `APP_URL`, `API_URL` | Optional settings fields with defaults; no current code consumes them. | Do not add to the local file for Phase 1. |
| `SUPABASE_URL` | Used to derive the JWT issuer and default JWKS URL. | Set the project URL. |
| `SUPABASE_JWKS_URL` | Optional override for the project's public JWKS endpoint. | Leave blank for the standard endpoint derived from `SUPABASE_URL`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Not currently configured; future Next.js Auth/Storage client value. | Add to `frontend/.env.local` only when the Supabase client is implemented. This URL is public project metadata. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Not currently configured; future client API key if the app uses Supabase Auth/Data/Storage APIs. | Use the new publishable key, which is designed to be public. It relies on RLS policies for user data access. Do not use the legacy `SUPABASE_ANON_KEY` name for new integration work. |
| `SUPABASE_SECRET_KEY` | No current use. Elevated server key; bypasses RLS when used without a user JWT. | Do not add by default. Only introduce for a reviewed server-only administrative operation that cannot use the signed-in user's RLS scope. Never expose it to the browser. |
| `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET` | Not used by the backend verifier or request database access. | Do not configure these as a shortcut for user authorization. The backend requires asymmetric Supabase JWT signing keys and verifies them through JWKS. |
| Google OAuth Client ID/Secret | No current OAuth code uses the local settings. | If Supabase Auth is selected, configure Google's client credentials in Supabase Auth > Providers > Google. They are provider configuration, not database credentials; do not put the Google client secret in the frontend. |
| `GEMINI_API_KEY` | Optional settings only; no model client is implemented. | Not needed; the product plan is open-weight-first. |
| `GOOGLE_API_KEY` | Present in the local environment file, but not declared in `Settings` or used by current backend code. | Not needed by PodFlow's current backend. Keep its value private; remove it only after confirming no separate local project needs it. |

`backend/.env.example` contains local placeholders only. When a Supabase browser client is implemented, keep browser-safe values in `frontend/.env.local` with the `NEXT_PUBLIC_` prefix; keep database URIs and provider secrets server-side. A publishable key is public by design; a Supabase secret key is not. Supabase documents [API key types](https://supabase.com/docs/guides/getting-started/api-keys).

## Supabase Dashboard setup sequence

1. Before enabling login, confirm whether you want **Supabase Auth with a custom PodFlow UI**. This is the recommended option; the `.env.example` remains minimal until the client is implemented.
2. Open the Supabase Dashboard and select the PodFlow project. If no project exists, create one in the intended organization, choose a region near the planned backend host, set a strong database password, and store it in a password manager. The deployment region is not decided yet, so treat this as a development choice.
3. In the project, choose **Connect** at the top and select a PostgreSQL connection method.
4. For a persistent FastAPI/Uvicorn backend, prefer **Direct connection** if your network supports IPv6 or the project has IPv4 connectivity. If your local network is IPv4-only, use **Session pooler**. The current SQLAlchemy/psycopg setup expects a persistent/session-capable connection; avoid **Transaction pooler** for now because its prepared-statement limitations have not been configured in this code. Supabase's current guidance distinguishes direct and session connections for persistent backends from transaction pooling for serverless/edge workloads: [connection method guide](https://supabase.com/docs/guides/database/connecting-to-postgres).
5. Copy the complete URI from the Dashboard. Use the host, port, and username exactly as displayed; the shared pooler's username and host are not safely reconstructed by hand. Replace only its database-password placeholder. If the password contains URI-reserved characters (such as `@`, `#`, `?`, `/`, or spaces), percent-encode them in the URI. The Dashboard's **Connect** dialog is the source for the actual connection string.
6. Edit `backend/.env` locally and replace only `DATABASE_URL=` with that URI. Do not paste the URI into this chat, a screenshot, an issue, or a terminal command that will be saved in shell history. Keep it out of the frontend `.env.local`.
7. Confirm Git still ignores the file with `git check-ignore backend/.env`; do not stage it. `backend/.env.example` remains safe to commit because it contains only local placeholder values.

If you confirm managed Auth, the subsequent dashboard-only Google setup is: Authentication > Providers > Google, enable it, obtain a Google OAuth client ID/secret from Google Cloud's OAuth client setup, paste them directly into Supabase's provider form, and copy Supabase's displayed callback URL into Google's authorized redirect URIs. Set the local Site URL/redirect allow-list to the frontend's local URL only when implementing the login flow. Keep the Google secret in Supabase's dashboard, not in either `.env` file.

## API keys and Auth are separate from the database URI

Do not copy an API key into `DATABASE_URL`. The current backend talks directly to PostgreSQL and has no Supabase SDK integration, so it needs no Supabase publishable or secret API key for the database connection. Supabase's current docs distinguish publishable keys from elevated secret keys and state that legacy `anon`/`service_role` keys are being deprecated by the end of 2026; a secret key bypasses RLS and belongs only in a backend that has its own authorization checks: [API keys](https://supabase.com/docs/guides/getting-started/api-keys).

The verifier requires Supabase asymmetric signing. The project must be configured with an asymmetric signing key; HS256 tokens are deliberately rejected. Supabase exposes public signing keys through its [JWKS endpoint](https://supabase.com/docs/guides/auth/jwts) and documents [signing-key management](https://supabase.com/docs/guides/auth/signing-keys). This setup does not change the project's signing mode.

When Supabase Auth is approved, the Google OAuth Client ID and Client Secret belong in the Supabase Dashboard's Google provider settings. The browser app will need the project URL and publishable key; the backend will need the project URL to discover verification keys. The Google provider callback URL should be copied from Supabase's provider setup screen and added to Google's authorized redirect URIs. Never send these credentials in chat.

## Data access and authorization boundary

FastAPI connects using `DATABASE_URL` as the restricted `podflow_app` login. Alembic uses only `ALEMBIC_DATABASE_URL`; this admin setting is loaded by the migration environment and is absent from FastAPI's `Settings` model. Do not set `DATABASE_URL` to an administrator, superuser, table owner, or `BYPASSRLS` role.

Provision the login once using the admin connection, replacing no secret text in a saved command. If the role is missing, create it without elevated flags and set its password using psql's interactive password prompt:

```sql
CREATE ROLE podflow_app LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
```

```text
\password podflow_app
```

Set `DATABASE_URL` to connect as `podflow_app`; the role name in the URI must match `podflow_app`. The forward migration reads that username from `DATABASE_URL`, checks that the role can log in, has `NOINHERIT`, has no superuser/role-creation/database-creation/replication/`BYPASSRLS` flags, owns none of the protected tables, and has no other role memberships. It then grants only membership in `podflow_runtime`. The runtime role itself is `NOLOGIN`, non-superuser, non-owner, and `NOBYPASSRLS`; each FastAPI transaction switches to it and sets `app.user_id` from the verified JWT subject. The app connection has no admin credential or direct table-owner privileges.

These checks are repository code only until reviewed migrations are deliberately applied. Neither migration was applied to Supabase. Runtime login capability, role flags, and cross-user denial remain database-dependent checks. Set both `PODFLOW_TEST_RUNTIME_DATABASE_URL` and `PODFLOW_TEST_ADMIN_DATABASE_URL` to connections for an explicitly disposable **local** PostgreSQL database to run integration tests; the tests reject non-local hosts. Never use the Supabase URL for these variables. Do not use a secret/service-role key for ordinary requests. Supabase Storage uses its own Postgres RLS policies; see [Storage access control](https://supabase.com/docs/guides/storage/security/access-control) and [Postgres RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

After applying reviewed local migrations, connect with the runtime login and run these read-only checks. They show only role names and flags, not connection data:

```sql
SELECT session_user, current_user,
       pg_has_role(session_user, 'podflow_runtime', 'MEMBER') AS runtime_member;
BEGIN;
SET LOCAL ROLE podflow_runtime;
SELECT current_user, rolsuper, rolbypassrls, rolcreatedb, rolcreaterole,
       rolinherit, rolreplication
FROM pg_roles WHERE rolname = current_user;
ROLLBACK;
```

Expected: initial `session_user` is `podflow_app`, membership is true, and after `SET LOCAL ROLE` current user is `podflow_runtime` with all listed privilege flags false. Also run the owner-isolation integration tests on the disposable local database; a role-flags query alone does not prove RLS policy behavior.

## Free plan fit and limits

Supabase Free is suitable for development and a small prototype, but the current limits affect this product's design. As shown in Supabase's current billing guide (recheck before launch), Free includes two projects, 500 MB database size per project, 1 GB Storage, 50,000 monthly active users, 5 GB uncached plus 5 GB cached egress, and a 50 MB maximum upload; a project can pause after a week of low activity. Free also lacks automatic backups and point-in-time recovery. See [billing and quotas](https://supabase.com/docs/guides/platform/billing-on-supabase), [project pausing](https://supabase.com/docs/guides/platform/free-project-pausing), and [Storage egress](https://supabase.com/docs/guides/storage/serving/bandwidth).

For PodFlow, database quota includes app records, chunk text, vector embeddings, and indexes; file-storage quota includes original documents and generated files. Large PDFs and repeated exports can consume the 1 GB object quota, while embeddings can make the 500 MB database quota tight. Track these separately and set upload/file-retention limits in Phase 2. Treat Free as a development tier, not as a reliability or backup plan for user data.

## Safe connection check

After `DATABASE_URL` is set, run a read-only `SELECT 1` from `backend/`. This command prints only pass/fail, not the URI or exception details:

```powershell
@'
import asyncio
import sys

try:
    from sqlalchemy import text
    from podflow.persistence.db.session import engine

    async def check():
        try:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
            print("Database connection: PASS")
        finally:
            await engine.dispose()

    asyncio.run(check())
except Exception:
    print("Database connection: FAIL (details suppressed; do not paste a raw DSN or error log)")
    sys.exit(1)
'@ | uv run python -
```

If it fails, inspect the local error privately and check, in order: driver import, URI encoding, database password, host/port/network mode, DNS/IP support, and project status. Do not share an unsanitized traceback; database driver errors may include connection details.

If the Python PostgreSQL driver cannot load, a network-only check can still verify DNS/TCP reachability without printing the host or URI. It does **not** authenticate or prove that the database password is correct:

```powershell
@'
import socket
import sys
from urllib.parse import urlparse

from podflow.core.config import get_settings

try:
    uri = urlparse(get_settings().database_dsn)
    with socket.create_connection((uri.hostname, uri.port or 5432), timeout=5):
        print("Database endpoint TCP reachability: PASS")
except Exception:
    print("Database endpoint TCP reachability: FAIL (details suppressed)")
    sys.exit(1)
'@ | uv run python -
```

## Current setup result and blocker

At the schema implementation preflight, both database and Supabase project URLs were configured, and their project references matched. The database hostname failed DNS resolution from this environment, so the existing public schema, extension installation, and role flags could not be inspected. No remote migration was applied. Secret values were not emitted.

Database authentication/connectivity could not be tested because DNS resolution failed. This does not establish whether the configured password or database role is valid. Do not treat the schema as migrated.

## Open setup decisions

- Which backend deployment region will be used, to make the production region selection final.
- Whether the local network supports IPv6; choose Direct if it does, otherwise Session pooler.
- The Supabase project must use asymmetric JWT signing for the backend verifier to accept user access tokens.
- The project catalog and runtime role remain unverified until database connectivity is available.
- The selected embedding model/dimension and nested artifact/presentation payload contracts remain open.
