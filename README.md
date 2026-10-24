# PodFlow

PodFlow is planned as a knowledge workspace that turns collections of sources into reusable, evidence-linked artifacts. A polished public marketing page and an initial FastAPI/database foundation are implemented; the authenticated product workflows remain planned.

## Current repository status

- **Public site:** Next.js landing page with responsive interactions, SEO metadata, and browser/accessibility checks.
- **Backend foundation:** FastAPI health endpoints, SQLAlchemy session/configuration, profile/workspace tables, migrations, and an authentication dependency scaffold.
- **Not implemented yet:** source ingestion, Knowledge Artifacts, RAG chat, generated presentation pages, expiring share links, exports, newsletter sending, PWA, Chrome extension, and third-party connectors.

The current implementation and verification evidence are tracked in [the repository audit](docs/15_Repository_Audit.md). The intended product and architecture are described separately in [the master specification](docs/00_PodFlow_V2_Master_Specification.md).

## Stack

**Present in code:** Next.js 16 / React / TypeScript / Tailwind / Bun; Python 3.13 / FastAPI / SQLAlchemy / Alembic / `uv`; PostgreSQL configuration; pytest, Ruff, Playwright, and axe-core.

**Planned, not integrated yet:** Supabase Auth/Storage/pgvector, Google OAuth, an open-weight model runtime, workflow orchestration, and deployment services. See the audit before relying on these as existing infrastructure.

## Local development

Prerequisites: Python 3.13, `uv`, Bun 1.4.2, and Node.js supported by the pinned Next.js version.

From the repository root, create the backend environment file if needed:

```powershell
Copy-Item .env.example .env
```

Use local placeholder values only; do not put server secrets in a frontend env file. The frontend needs no env file for local development. `NEXT_PUBLIC_SITE_URL` is optional locally and must be set to the real canonical origin for production builds.

Backend (from `backend/`):

```powershell
uv sync --all-extras --locked
uv run ruff check .
uv run pytest
uv run alembic -c alembic.ini heads
uv run uvicorn podflow.api.app:create_app --factory --reload
```

Frontend (from `frontend/`):

```powershell
bun install --frozen-lockfile
bun run dev
```

Before review, run `bun run lint`, `bun run typecheck`, and `bun run build`. For browser checks, install Playwright Chromium once with `bunx playwright install chromium`, then run `bun run test:e2e`. On Windows, installed Edge can be used with `$env:PW_CHANNEL="msedge"; bun run test:e2e`.

## Documentation and agent skills

Start at [the documentation index](docs/README.md), which identifies the source of truth for product vision, current implementation, API/schema planning, and procedures. Reusable engineering instructions are indexed in [skills/README.md](skills/README.md).
