# PodFlow

AI-powered knowledge workspace for turning sources into grounded, structured knowledge artifacts.

## Architecture

- Frontend: Next.js + React + TypeScript
- Backend: FastAPI + Python
- Database: Supabase PostgreSQL
- Vector search: pgvector
- Object storage: Supabase Storage
- Authentication: Supabase Auth + Google OAuth
- Workflow orchestration: LangGraph

## Development

Backend (from `backend/`):

```powershell
uv sync --all-extras --locked
uv run pytest
uv run alembic -c alembic.ini heads
uv run uvicorn podflow.api.app:create_app --factory --reload
```

Frontend (from `frontend/`):

```powershell
Copy-Item .env.example .env.local
bun install --frozen-lockfile
bun run dev
```

See `docs/` for the PRD, TRD, API contract, schemas, testing strategy, POC, and deployment architecture.
