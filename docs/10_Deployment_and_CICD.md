# PodFlow --- Deployment and CI/CD

> **Status:** Supporting deployment specification. Extend this plan as the PWA, extension, and model-hosting approach are selected.

> **Current state:** `.github/workflows/ci.yml` runs repository/secret checks, backend Ruff/pytest/Alembic validation, and frontend lint/typecheck/build/Playwright checks. No deployment, Docker build, hosted smoke test, or migration-apply job is configured. See [the repository audit](15_Repository_Audit.md) for the exact observed commands and results.

## Target

``` text
GitHub
  |
  +--> Vercel  -> Next.js (dashboard, PWA, public website views)
  |
  +--> Render  -> FastAPI
  |
  +--> Supabase
        ├── PostgreSQL + pgvector
        ├── Auth
        └── Storage
```

## Environments

Maintain local, preview/staging and production. Never develop directly
against production data.

## Supabase

Use separate dev/prod projects where practical. Enable PostgreSQL,
pgvector, Storage, Auth and Google OAuth. Never expose service-role
credentials to the browser.

## Vercel

Deploy Next.js. Public variables may include Supabase URL/key and API
base URL. Server-only secrets must never use public environment variable
prefixes.

## Chrome extension

Ship the extension as a separately versioned client. It uses the public
authenticated API and contains no database, service-role, model-provider,
or privileged integration credentials.

## Model deployments

Open-weight model hosting, model weights, and evaluation datasets require
a separate deployment decision. Record model version, prompt version,
evaluation result, latency, and cost for production changes.

## Render

Deploy FastAPI via Docker or managed Python. Configure DB, Supabase
auth, model, storage and integration secrets through the platform secret
store.

## Migrations

Validate migrations in CI. Apply them as a controlled deployment step.
Prefer additive/expand-and-contract migrations for risky changes. Never
use drop/recreate as normal production evolution.

## GitHub Actions PR pipeline

Checkout → install → lint/format/typecheck → unit tests → integration
tests → frontend checks/build → migration validation → Docker build →
secret scan.

## Main pipeline

Repeat required checks → build → deploy → migrate → readiness/smoke test
→ report deployment.

## Merge gates

No merge on failed tests, lint, typecheck, build, migration validation
or critical security checks.

## Rollback

Application rollback can redeploy a known-good build. Database rollback
should generally prefer forward fixes; destructive migrations require
backups and an explicit recovery plan.

## Backups

Define retention, restore procedure, RPO and RTO. Test restores
periodically.

## Monitoring

Track API availability, latency, error rate, workflow/ingestion
failures, LLM failures, job latency, database health and storage
failures.

## Security

Rotate secrets, scan dependencies, scan secrets, use restrictive CORS,
HTTPS, rate limiting, upload validation and authorization tests.
