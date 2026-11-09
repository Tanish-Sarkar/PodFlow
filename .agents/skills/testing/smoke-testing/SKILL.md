# Smoke Testing

## Purpose

Run a fast, high-signal check after a build or deployment to decide whether deeper validation can proceed. Smoke checks are not a substitute for feature, security, or regression coverage.

## Current repository commands

- Backend source gate: from `backend/`, `uv run ruff check .` and `uv run alembic -c alembic.ini heads`. To smoke the service, start it with `uv run uvicorn podflow.api.app:create_app --factory --port 8000` and request `/api/v1/health/live` and `/api/v1/health/ready` using a non-production database configuration.
- Frontend gate: from `frontend/`, `bun run build`. For a locally built page, run `bun run start -p 3100` and check `/`, `/robots.txt`, and `/sitemap.xml` with an HTTP client.
- No deployment or production environment is configured in the repository; do not present local checks as deployment smoke tests.

## Procedure

1. Confirm the target build, environment, and safe test identity. Verify the app is pointed at the intended non-production services.
2. Check process startup, critical public route, health endpoints, and one read-only dependency check.
3. Check response status/content type and a few essential headers; avoid writes or sending email.
4. Keep the smoke suite short and deterministic. Stop on startup or critical-route failure and preserve logs without secrets.

## Completion

Report target/version, exact route checks, status codes, and dependencies contacted. A successful liveness check only proves process response; readiness and private user journeys require separate evidence.
