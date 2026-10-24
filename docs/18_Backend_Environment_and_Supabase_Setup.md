# Backend Environment and Supabase Setup

**Status:** Phase 1 setup guide. No database schema or API routes are implemented by this document.

## What the current code needs

The backend currently connects to PostgreSQL through SQLAlchemy and `psycopg`. It does not yet use a Supabase client, Data API, Storage, or Auth SDK. That is why the checked-in `.env.example` currently contains only `DATABASE_URL` and `APP_ENV`: it describes what the code can use today, not every value a future Supabase client will need.

The product can still use one Supabase project for the planned platform. These are distinct services inside that project, not three separate databases:

| Responsibility | Recommended place | What belongs there |
| --- | --- | --- |
| Identity and login | Supabase Auth, backed by its managed `auth` schema in the same Postgres project | Google identity, email, sessions, token lifecycle. Do not store passwords in PodFlow's app tables. |
| Product records | Supabase Postgres `public` schema | App profile linked to Auth user ID, workspaces/projects, source/run metadata, artifact metadata and versions, citations, chats, export/share records. |
| Source and export files | Supabase Storage buckets | Original PDFs/documents and generated binary exports. Postgres should keep each object's path, owner, media type, size, checksum, and lifecycle metadata. Do not manipulate Supabase's internal `storage` schema directly. |
| RAG chunks and embeddings | The same Postgres database, using the `vector` extension (`pgvector`) | Chunk text/provenance and embedding vectors with relational metadata so retrieval can filter by owner and selected artifact scope. This is not a third database. |

“RDS” usually means AWS Relational Database Service. If you mean a relational database generically, Supabase Postgres fills that role and there is no need to add AWS RDS. Auth identities are also stored by Supabase in Postgres, but in a service-managed schema; app-specific profile/project records belong in app-owned tables. Supabase recommends linking app rows to the primary key in `auth.users`, not copying authentication credentials into a second user table: [Auth user data guidance](https://supabase.com/docs/guides/auth/managing-user-data).

Knowledge Artifact content should not all be pushed into object storage by default. Keep structured, queryable artifact content, citations, ownership, and version metadata in Postgres; store large original files and downloadable renderings in Storage. Phase 2 will decide whether unusually large immutable artifact payloads also need an object copy. Embeddings consume the Postgres database quota. Enable `vector` and choose its dimension/index only during the separately authorized schema phase: [Supabase vector columns](https://supabase.com/docs/guides/ai/vector-columns).

### Authentication choice (recommended, pending your confirmation)

Recommended direction: **Supabase Auth handles identity and Google OAuth; PodFlow owns the sign-in page and product experience.** A custom UI does not require building authentication from scratch. The Next.js UI can call Supabase Auth; Supabase handles the OAuth exchange, sessions, and tokens. The backend later validates the access token using Supabase's public signing keys/JWKS and enforces product authorization. Supabase documents this Next.js pattern and Google provider setup: [Next.js Auth](https://supabase.com/docs/guides/auth/quickstarts/nextjs), [Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

Building identity fully in PodFlow would mean owning OAuth callbacks, session/refresh-token security, account linking, recovery, revocation, abuse protections, and signing-key operations. There is no product requirement that makes that extra burden valuable right now. We can revisit the provider decision before enabling Google Auth, but the managed-auth/custom-UI option is the simpler starting point.

| Variable | Status in current code | Setup guidance |
| --- | --- | --- |
| `DATABASE_URL` | Required to connect to the Supabase database. If blank, current settings fall back to localhost. | Put the Dashboard connection URI in the ignored root `.env`. Use the connection mode appropriate for the backend and network. |
| `APP_ENV` | Optional; defaults to `development`. Development mode currently enables SQLAlchemy SQL echo. | Keep `development` locally. Do not use it for production. |
| `APP_URL`, `API_URL` | Optional settings fields with defaults; no current code consumes them. | Do not add to the local file for Phase 1. |
| `SUPABASE_URL` | Optional backend settings field; no current code consumes it. | Needed later by the backend if it fetches Supabase JWKS, and by a Supabase client. Do not add just for direct Postgres access. |
| `NEXT_PUBLIC_SUPABASE_URL` | Not currently configured; future Next.js Auth/Storage client value. | Add to `frontend/.env.local` only when the Supabase client is implemented. This URL is public project metadata. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Not currently configured; future client API key if the app uses Supabase Auth/Data/Storage APIs. | Use the new publishable key, which is designed to be public. It relies on RLS policies for user data access. Do not use the legacy `SUPABASE_ANON_KEY` name for new integration work. |
| `SUPABASE_SECRET_KEY` | No current use. Elevated server key; bypasses RLS when used without a user JWT. | Do not add by default. Only introduce for a reviewed server-only administrative operation that cannot use the signed-in user's RLS scope. Never expose it to the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Legacy optional settings field; no current integration reads it. | Do not configure. Supabase is moving from legacy `anon`/`service_role` keys to publishable/secret keys; secret keys are elevated and bypass RLS. |
| `SUPABASE_JWT_SECRET` | Optional settings field used by the auth scaffold, which currently accepts only HS256 and is not wired to a product route. | Leave unset. The planned verifier should use the selected signing mode and public JWKS; do not copy a JWT secret into app configuration as a shortcut. |
| Google OAuth Client ID/Secret | No current OAuth code uses the local settings. | If Supabase Auth is selected, configure Google's client credentials in Supabase Auth > Providers > Google. They are provider configuration, not database credentials; do not put the Google client secret in the frontend. |
| `GEMINI_API_KEY` | Optional settings only; no model client is implemented. | Not needed; the product plan is open-weight-first. |
| `GOOGLE_API_KEY` | Present in the local environment file, but not declared in `Settings` or used by current backend code. | Not needed by PodFlow's current backend. Keep its value private; remove it only after confirming no separate local project needs it. |

The root `.env.example` contains only `APP_ENV` and a clearly labeled local `DATABASE_URL` example. This is intentional for the current backend. When Supabase Auth is implemented, keep browser-safe values in `frontend/.env.local` with the `NEXT_PUBLIC_` prefix; keep database URIs, Google client secrets, JWT signing material, and Supabase secret keys server-side only. A publishable key is public by design; a Supabase secret key is not. Supabase now documents publishable/secret keys and legacy-key deprecation: [API key types](https://supabase.com/docs/guides/getting-started/api-keys).

## Supabase Dashboard setup sequence

1. Before enabling login, confirm whether you want **Supabase Auth with a custom PodFlow UI**. This is the recommended option; the `.env.example` remains minimal until the client is implemented.
2. Open the Supabase Dashboard and select the PodFlow project. If no project exists, create one in the intended organization, choose a region near the planned backend host, set a strong database password, and store it in a password manager. The deployment region is not decided yet, so treat this as a development choice.
3. In the project, choose **Connect** at the top and select a PostgreSQL connection method.
4. For a persistent FastAPI/Uvicorn backend, prefer **Direct connection** if your network supports IPv6 or the project has IPv4 connectivity. If your local network is IPv4-only, use **Session pooler**. The current SQLAlchemy/psycopg setup expects a persistent/session-capable connection; avoid **Transaction pooler** for now because its prepared-statement limitations have not been configured in this code. Supabase's current guidance distinguishes direct and session connections for persistent backends from transaction pooling for serverless/edge workloads: [connection method guide](https://supabase.com/docs/guides/database/connecting-to-postgres).
5. Copy the complete URI from the Dashboard. Use the host, port, and username exactly as displayed; the shared pooler's username and host are not safely reconstructed by hand. Replace only its database-password placeholder. If the password contains URI-reserved characters (such as `@`, `#`, `?`, `/`, or spaces), percent-encode them in the URI. The Dashboard's **Connect** dialog is the source for the actual connection string.
6. Edit the root `.env` locally and replace only `DATABASE_URL=` with that URI. Do not paste the URI into this chat, a screenshot, an issue, or a terminal command that will be saved in shell history. Keep it out of the frontend `.env.local`.
7. Confirm Git still ignores `.env` with `git check-ignore .env`; do not stage it. `.env.example` remains safe to commit because it contains only local placeholder values.

If you confirm managed Auth, the subsequent dashboard-only Google setup is: Authentication > Providers > Google, enable it, obtain a Google OAuth client ID/secret from Google Cloud's OAuth client setup, paste them directly into Supabase's provider form, and copy Supabase's displayed callback URL into Google's authorized redirect URIs. Set the local Site URL/redirect allow-list to the frontend's local URL only when implementing the login flow. Keep the Google secret in Supabase's dashboard, not in either `.env` file.

## API keys and Auth are separate from the database URI

Do not copy an API key into `DATABASE_URL`. The current backend talks directly to PostgreSQL and has no Supabase SDK integration, so it needs no Supabase publishable or secret API key for the database connection. Supabase's current docs distinguish publishable keys from elevated secret keys and state that legacy `anon`/`service_role` keys are being deprecated by the end of 2026; a secret key bypasses RLS and belongs only in a backend that has its own authorization checks: [API keys](https://supabase.com/docs/guides/getting-started/api-keys).

Authentication is not ready to configure through this backend yet. The existing dependency hard-codes HS256 and a shared legacy JWT secret, while Supabase supports asymmetric signing keys and a public JWKS discovery endpoint. Supabase recommends the signing-key system over the legacy shared secret: [JWT signing keys](https://supabase.com/docs/guides/auth/signing-keys). Keep `SUPABASE_JWT_SECRET` unset until the backend verifier and the project's selected signing mode agree. This setup does not enable or rotate signing keys.

When Supabase Auth is approved, the Google OAuth Client ID and Client Secret belong in the Supabase Dashboard's Google provider settings. The browser app will need the project URL and publishable key; the backend will need the project URL to discover verification keys. The Google provider callback URL should be copied from Supabase's provider setup screen and added to Google's authorized redirect URIs. Never send these credentials in chat.

## Data access and authorization boundary

Supabase Storage uses Postgres RLS policies for object operations; by default uploads are denied until a policy grants them. User-scoped clients can use the user's Auth token plus RLS policies. A direct Postgres connection from FastAPI is a separate privileged server connection and does not automatically become the signed-in user's RLS identity. Phase 2 must decide how backend authorization is enforced for direct SQL access and how Storage policies receive the user identity. Do not assume “we enabled RLS” alone protects queries made as an owner/admin database role. Do not use a secret/service-role key for ordinary user requests because it bypasses RLS. See [Storage access control](https://supabase.com/docs/guides/storage/security/access-control) and [Postgres RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

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
    uri = urlparse(get_settings().database_url)
    with socket.create_connection((uri.hostname, uri.port or 5432), timeout=5):
        print("Database endpoint TCP reachability: PASS")
except Exception:
    print("Database endpoint TCP reachability: FAIL (details suppressed)")
    sys.exit(1)
'@ | uv run python -
```

## Current setup result and blocker

At the Phase 1 audit, the root `.env` existed and was Git-ignored. Its variable names/status were checked without emitting values. `DATABASE_URL` and the Supabase URL/key/JWT entries were blank, so the current settings resolve to the localhost fallback. Some Google/Gemini values are populated locally but are unused by the application; their values are intentionally not recorded here. No process-level Supabase overrides or `psql` client were found.

Database authentication/connectivity could not be tested in this environment: importing the installed `psycopg[binary]` package is blocked by Windows Application Control, and no system `libpq` library is available. The backend pytest run fails during collection for the same driver-import reason. This is an environment blocker, not proof of a bad Supabase URI. After a connection URI is configured, the network-only check above can test TCP reachability here; the `SELECT 1` check still needs an environment where the psycopg driver can load.

## Open setup decisions

- Which backend deployment region will be used, to make the production region selection final.
- Whether the local network supports IPv6; choose Direct if it does, otherwise Session pooler.
- The backend JWT verifier must later be updated to validate the signing-key/JWKS mode selected for Supabase Auth. Do not supply a JWT secret to the current implementation as a workaround.
- No schema, RLS policy, or route is part of Phase 1. Those belong to their separately authorized phases.
