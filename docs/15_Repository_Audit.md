# PodFlow Repository Audit

**Audit date:** 2026-10-24  
**Repository state examined:** `feature/backend-foundation` at `a9d8238` (`fix(ci): generate Next types before typecheck and repair CodeRabbit config`)  
**Working tree before this documentation work:** clean; branch was one commit ahead of `origin/feature/backend-foundation`.

## Purpose and evidence boundary

This report records what the checked-out repository contains, not what the planning documents say should exist. “Verified” means a source file or local command supports the statement. It does not mean production behavior has been deployed or checked against a live service. Product scope and proposed architecture remain in [the master specification](00_PodFlow_V2_Master_Specification.md); this report is the authority for implementation status as of the audit date.

The local Git remote is `origin` (`git@github-personal:Tanish-Sarkar/PodFlow.git`). GitHub CLI was not available, and no GitHub connector was available in this session. Issues, pull requests, repository settings, and hosted Actions results therefore remain unverified. No deployment environment was accessed. In a later Phase 1 setup check, the ignored root `.env` was inspected programmatically for variable names and empty/non-empty status only; no values were emitted or recorded. `git ls-files` confirmed no `.env` or `.env.local` is tracked.

## Executive summary

PodFlow is currently a **marketing site plus a small backend foundation**. The Next.js public page is implemented and has a substantial passing browser suite. The FastAPI service has health routes, database configuration, two small SQLAlchemy models, migrations, and an authentication dependency. The authenticated workspace, source ingestion, artifact lifecycle, retrieval/chat, presentations, sharing, exports, email workflow, and connectors are still plans; they are not implemented by the current application.

The repository is coherent enough to continue foundation work, but private product routes should wait for a documented Supabase token-verification approach, tested ownership rules, and real database integration coverage. The frontend production build currently warns when `NEXT_PUBLIC_SITE_URL` is missing. Documentation also contains stale setup and implementation-plan instructions that this audit identifies and the documentation overhaul should retire.

## Repository and Git state

Top-level areas:

| Path | Current purpose |
| --- | --- |
| `backend/` | Python package, FastAPI app, SQLAlchemy persistence, Alembic migrations, pytest suite, `uv` lockfile. |
| `frontend/` | Next.js App Router site, marketing components, static assets, TypeScript Playwright suite, Bun lockfile. |
| `docs/` | Product requirements, proposed architecture/API/schema, delivery plans, UI specification, and this current-state audit. |
| `.agents/rules/` | Existing repository code-writing rules. |
| `.github/workflows/` | GitHub Actions CI definition. |

### Important file and module map

- `backend/pyproject.toml`, `backend/uv.lock`: Python runtime/dependency source and lock. `backend/alembic.ini`, `backend/alembic/env.py`, and `backend/alembic/versions/`: migration configuration and schema history.
- `backend/src/podflow/api/`: FastAPI factory, v1 health router, and auth dependency. `core/config.py`: environment settings. `persistence/db/`: SQLAlchemy base, async session, and current models. `backend/tests/api/` and `backend/tests/unit/`: current backend test organization.
- `frontend/package.json`, `frontend/bun.lock`, `frontend/next.config.ts`, and `frontend/AGENTS.md`: package scripts/lock, Next configuration, and frontend-specific agent instructions.
- `frontend/src/app/`: App Router page, root layout, 404, icons, robots, sitemap, and generated social images. `components/marketing/`: public-page sections and demo interactions. `components/ui/`: reusable visual components. `lib/`: site metadata and visual utilities. `public/marketing/`: static marketing assets. `frontend/e2e/marketing.spec.ts`: browser/accessibility/SEO checks.
- `docs/00_...` through `docs/14_...`: intended requirements, design, and plans. `docs/15_...` is the current-state audit, `docs/16_...` the backlog, and `docs/17_...` onboarding. `docs/DEV_DOCS/implementation_plan.md` is historical.
- `.env.example`: root development configuration template. `frontend/` has no `.env.example`; local frontend setup does not need a file by default. `.gitignore` excludes local env files and generated build/test artifacts.

At the inspected revision, the branch history includes the frontend initialization, marketing page, and latest CI/type-generation fix. The branch is one commit ahead of its remote tracking ref. `git diff --stat main...HEAD` reports 109 changed files, 8,978 insertions, and 152 deletions relative to `main`; this is the branch's accumulated work, not uncommitted work. The working tree was clean before this audit's documentation edits. No branch was deleted or rewritten.

## Current system shape

```text
Browser ──> Next.js public page (static, illustrative product UI)

FastAPI app ──> /api/v1/health/live
            └─> /api/v1/health/ready ──> SQLAlchemy async session ──> PostgreSQL

Auth dependency ──> HS256 JWT verification ──> user_profiles lookup
                   (defined, but not mounted on a product route)
```

The public page does not call the backend. The frontend contains no authenticated dashboard or API client. The FastAPI factory currently mounts only the health router. No source, artifact, chat, export, presentation, share, newsletter, or connector route exists in the app.

### Implemented and locally verified

| Capability | State and evidence |
| --- | --- |
| Public landing page | Implemented at `frontend/src/app/page.tsx`, composed of marketing sections and sample UI. The previews are local illustrative interactions, not connected product features. |
| Landing-page interactions | Implemented in the frontend: responsive navigation, tabs, citation preview/pin behavior, scoped-chat demo chips, entrance motion and reduced-motion handling. These are demonstrations, not persisted sessions or RAG. |
| SEO and public metadata | Implemented: title/description, conditional canonical URL, Open Graph and Twitter metadata/images, SoftwareApplication JSON-LD, robots, sitemap, icons, and production-only indexability. `NEXT_PUBLIC_SITE_URL` is required for correct production canonical and absolute sharing-image URLs. |
| Frontend security headers | Implemented in production config: CSP, frame denial, referrer policy, MIME sniffing protection, and permissions policy. CSP currently permits inline scripts/styles for the static Next.js rendering approach. |
| FastAPI factory and health | Implemented in `backend/src/podflow/api/app.py` and `api/v1/health.py`. Liveness returns `200`; readiness runs `SELECT 1` and returns `503` on a database exception. |
| Database foundation | Implemented: SQLAlchemy async engine/session, Alembic setup, `user_profiles`, `workspaces`, and `workspace_members`. `uv run alembic -c alembic.ini heads` returned one head, `8cf49221e92d`. This checks the local revision graph; it does not connect to or migrate a live database. |
| JWT authentication dependency | Implemented as a reusable dependency in `api/dependencies/auth.py`; it verifies a token and resolves `sub` to a local profile. It is not attached to a product API route, and its signing-key assumptions need resolution before use. |
| CI definition | Implemented in `.github/workflows/ci.yml`: repository checks, backend Ruff/pytest/Alembic, and frontend lint/typecheck/build/Playwright. Hosted run results were not accessible. |

### Implemented but not fully verified

- The JWT verification path is unit-tested only with `verify_jwt` mocked; no test exercises real signature, issuer, expiry, audience, key rotation, or Supabase key discovery.
- Readiness has a mocked success test, but no test for database failure or a real PostgreSQL connection.
- Migrations and model metadata exist, but no disposable-database upgrade/downgrade test was run.
- SEO output has browser assertions, but there is no deployed canonical host, Search Console data, crawl/indexing check, or production environment to inspect.

### Partial, planned, missing, and broken items

| Area | Actual state |
| --- | --- |
| Authentication | Partial foundation. The dependency exists; login, OAuth callback/session flow, route enforcement, workspace authorization, and production-ready Supabase key handling are absent. |
| Data model | Partial foundation. Only profiles, workspaces, and membership are modeled. There are no resources, extracted documents/chunks, runs, artifacts/versions, evidence, presentations, shares, chats, exports, recipients, campaigns, or connector records. |
| Knowledge pipeline | Missing: no ingestion, extraction, normalization, embedding, vector index, retrieval, orchestration, or background worker. |
| Artifact and human review | Missing. Automatic artifact persistence and optional review/edit flows are product requirements, not code. |
| Chat and scope swapping | Missing as a product capability. The landing page has an interactive static example only. |
| Presentation website view and 24-hour sharing | Missing. The landing page illustrates the idea; there is no generated presentation schema, renderer route, token, expiry enforcement, or revocation. |
| Export and email | Missing. Markdown/JSON/DOCX/PDF export, CSV/XLSX import, newsletter generation, and email delivery are not wired in the current code. |
| PWA, Chrome extension, connectors | Missing. The docs describe future clients/connectors; there is no manifest, extension package, service worker/PWA install flow, or connector implementation. SIEM/SOAR/EDR/XDR and case-management systems are future integration possibilities, not existing integrations. |
| Model runtime and learning | Missing. No model SDK/runtime, prompt pipeline, benchmark harness, feedback store, preference profile, or fine-tuning workflow exists. Settings retains an unused optional Gemini field, while the master policy prefers evaluated open-weight models; the minimal `.env.example` no longer asks for a model key. |
| Deployment | Planned, not verified. No Docker/Compose or deployment workflow is present in the inspected file inventory. CI validates builds but does not deploy. |
| Local setup instructions | The prior root and frontend READMEs instructed copying `.env.example` from `frontend/`, where it does not exist, and the example listed unused credentials. This audit updated the instructions: copy the root example only to root `.env`; local frontend setup needs no env file. |
| Production SEO configuration | Configuration-sensitive. A build without `NEXT_PUBLIC_SITE_URL` succeeds but warns; Next reports `metadataBase` missing and falls back to `http://localhost:3000` for generated social-image URLs. Set the actual canonical origin before a production build. |

## Stack and configuration found in code

| Layer | Checked-in implementation | Planned services not yet present |
| --- | --- | --- |
| Frontend | Next.js `16.4.2`, React `19.3.0`, TypeScript, Tailwind CSS `4`, Bun `1.4.2`. | Authenticated application, PWA, generated artifact view, API client. |
| Backend | Python `>=3.13,<3.14`, FastAPI `>=0.141,<0.142`, Uvicorn, Pydantic Settings, SQLAlchemy 2, Alembic, psycopg, PyJWT, `uv`. | Domain services, ingestion, LLM/model adapters, workflow engine, connector layer. |
| Database | PostgreSQL URL configuration and SQLAlchemy/Alembic models for profiles and workspaces. | Supabase project connection, pgvector extension/indexes, product schema. |
| Authentication | HTTP Bearer + PyJWT HS256 verifier. | Supabase Auth UI/session lifecycle, Google OAuth, JWKS/asymmetric-key verification decision, authorization policies. |
| Object storage | No storage client or upload path found. | Supabase Storage or a selected alternative. |
| AI | An unused `gemini_api_key` settings field remains. The current environment example does not request a model key; no inference code was found. | Open-weight runtime, task-specific SLMs, provider adapter, model selection and quality gate. |
| Tests | pytest, HTTPX/TestClient, Ruff; Playwright and axe-core for frontend. | Real database integration environment, API contract suite, model eval harness, backend E2E. |
| CI | GitHub Actions; backend and frontend checks. | Deployment, migration application, dependency vulnerability scan, production smoke test, model evaluation job. |

The code stack is evidence; the target stack and rationale are specified in `docs/00_PodFlow_V2_Master_Specification.md` and `docs/02_TRD.md`. Those files do not prove that the proposed services are provisioned or integrated.

## Data model and API inventory

The checked-in ORM and migrations define:

- `user_profiles`: local profile UUID, unique Supabase `auth_user_id`, optional display name/avatar, timestamps.
- `workspaces`: UUID, name, timestamps.
- `workspace_members`: UUID, user/workspace foreign keys with delete cascade, free-form string role.

The workspace model has no creator/owner column, no unique constraint on `(user_id, workspace_id)`, and no constrained role values. Product-level authorization rules cannot yet be derived from these tables. There is no pgvector migration.

The implemented API is limited to `GET /api/v1/health/live` and `GET /api/v1/health/ready`. `/api/docs` and `/api/openapi.json` are configured. Endpoint groups in `docs/03_API_Endpoints.md` are proposals, not implemented contracts. The live OpenAPI output was not queried from a running app because backend imports fail in this Windows environment when psycopg attempts to load its native wrapper.

## Security and engineering findings

Severity describes the risk when the relevant capability is introduced; the application currently exposes no private artifact routes.

| ID / severity | Finding and evidence | Impact | Recommended action |
| --- | --- | --- | --- |
| SEC-01 / High before private APIs | `verify_jwt` hard-codes `HS256` and a shared `SUPABASE_JWT_SECRET`; its comment acknowledges HS256 vs RS256/JWKS is unresolved. | A future Supabase signing configuration using asymmetric keys will not verify; key lifecycle and issuer checks are unspecified. | Decide supported Supabase signing modes; validate issuer, audience, expiry, subject, key rotation, and algorithm allow-list with real signed-token tests before mounting auth on private routes. |
| SEC-02 / High before multi-user data | Workspace tables do not define an owner or enforce unique membership/role values; no endpoint applies tenant filters. | Future routes could expose cross-user data if ownership is added inconsistently. | Finalize single-user/workspace ownership, add database constraints, and test cross-user reads/writes for every private route. |
| SEC-03 / Medium | Current tests use fake sessions and monkeypatch auth verification; no PostgreSQL integration or database-failure readiness test is present. | Schema/runtime mismatches and failure behavior can escape local verification. | Add isolated PostgreSQL tests (including migrations and readiness failure) before product persistence expands. |
| SEC-04 / Medium | The pre-audit `.env.example` suggested legacy service-role/JWT secrets; the setup guide was corrected to exclude unused credentials. | Users could put server-only credentials where frontend tooling might expose them or follow stale setup instructions. | Keep DB credentials in the ignored root `.env`; use no frontend env file by default; only add server-side secrets when an implemented integration needs them. |
| SEC-05 / Medium | No dependency vulnerability scan, upload validation, CORS policy, rate limit, or operational deployment controls are implemented. | These become relevant when private APIs, uploads, and external integrations are added. | Add controls with the corresponding feature boundary; do not represent future security requirements as present protections. |
| ENG-01 / Medium | `docs/DEV_DOCS/implementation_plan.md` says no app, tests, or frontend exist and contains an unverified claim about live credentials. | Agents may follow obsolete steps or infer that secrets were inspected. | Mark the document historical and point to this audit; do not treat its local-secret assertion as verified. |
| ENG-02 / Medium | Settings still contains an unused Gemini field while current product direction says open-weight-first. The environment example no longer asks for it. | The setting is confusing but does not invite a new API key to be configured. | Remove or retain the field when the model adapter is designed; document the decision, not an implemented integration. |
| ENG-03 / Low | `backend/src/podflow/persistence/db/session.py` creates the engine at module import and echoes SQL in development; `get_settings()` constructs settings per call. | Import-time DB driver loading complicates tests; per-request settings construction is unnecessary overhead. | Consider a lifespan-managed engine and cached settings as part of backend foundation hardening; add lifecycle tests. |
| ENG-04 / Low | Test fixture dependency overrides live on a module-level app in auth tests and are not reset by a fixture. | Test order can affect outcomes as coverage grows. | Use per-test app fixtures and clear dependency overrides after each test. |
| SEO-01 / Medium before launch | Production build without `NEXT_PUBLIC_SITE_URL` warns and metadata generation falls back to localhost for share-image URLs. | Search/social previews can advertise a local origin. | Require canonical origin in production deployment config and verify canonical, sitemap, robots, Open Graph, and Twitter URLs on the deployed host. |

## Documentation gaps and contradictions found

- The root and frontend README setup snippets previously copied `.env.example` from the frontend directory. This was corrected during Phase 1: use the root `.env` only for backend settings; frontend local setup needs no env file.
- `docs/DEV_DOCS/implementation_plan.md` is a pre-foundation snapshot and conflicts with current code and newer product documents.
- `docs/05_Testing_Rules_and_Tests.md` describes future end-to-end coverage and Python Playwright, while the current landing suite is TypeScript Playwright in `frontend/e2e/marketing.spec.ts`.
- `docs/00` and `docs/07` describe planned platform features and a 6–8 week target. No schedule estimate is supported by implementation velocity or a scoped first release yet.
- Before this documentation update, `.github/workflows/ci.yml` checked docs `00` through `13`, omitted the landing-page spec, and had no skills catalog checks. It now requires docs `14` through `18` and every indexed skill. The workflow still runs on `feature/**`, while `docs/08` explains that `feat/*` and `chore/*` do not currently trigger it.
- `docs/11_ADR_and_Missing_Docs.md` calls owner-scoped authorization an ADR, but the current schema and routes do not implement it. Treat it as a target decision until it has constraints and tests.

## Verification performed

| Command | Result | Limit |
| --- | --- | --- |
| `uv run ruff check .` (`backend/`) | Passed: “All checks passed!” | Lint only. CI does not run Ruff format check. |
| `uv run alembic -c alembic.ini heads` (`backend/`) | Passed: one head, `8cf49221e92d`. | Graph validation only; no live DB migration. |
| `uv run pytest` (`backend/`) | Could not collect tests. | psycopg native wrapper failed to load: Windows Application Control blocked the binary DLL; system `libpq` is absent. This is an environment failure before test assertions, not a passing suite or a demonstrated application defect. CI Linux result unavailable. |
| `bun run lint` (`frontend/`) | Passed. | ESLint only. |
| `bun run typecheck` (`frontend/`) | Passed. | Generates Next route types then runs TypeScript. |
| `bun run build` (`frontend/`) | Passed; all routes statically prerendered. | Emitted the missing canonical-host and localhost `metadataBase` warnings described above. |
| `bun run test:e2e` (`frontend/`) | Default run could not launch Chromium because the Playwright browser binary was absent. | Environment setup issue; rerun with repository-documented Edge channel below. |
| `$env:PW_CHANNEL='msedge'; bun run test:e2e` (`frontend/`) | Passed: 21/21. | Edge only; not a multi-browser matrix. Includes axe checks at 375/768/1280 widths. |
| `git ls-files .env .env.local '**/.env' '**/.env.local'` | No tracked matches. | Does not inspect ignored local secret values. |

## Recommended decisions to resolve

1. Which Supabase JWT signing modes and issuer/key-rotation behavior must the backend support?
2. Is V1 strictly single-user ownership, or does the workspace/membership model need to be part of the first release?
3. Which open-weight model runtime will be evaluated first, and on what hardware/privacy boundary? Gemini is only an unused config placeholder today.
4. Which minimum product journey defines the first releasable slice: source-to-artifact, or source-to-artifact plus presentation and chat?
5. Which deployment environments and canonical production domain will be used? This is needed to finalize SEO and release checks.

The prioritized backlog and acceptance criteria live in [the engineering backlog](16_Engineering_Backlog.md). New agents should start with [the onboarding guide](17_AI_Agent_Onboarding.md).
