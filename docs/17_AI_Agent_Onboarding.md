# PodFlow AI Agent Onboarding

## Read in this order

1. Root `README.md` for the quick project status and local commands.
2. `docs/README.md` for the documentation authority map.
3. `docs/00_PodFlow_V2_Master_Specification.md` for the intended product and target architecture.
4. `docs/15_Repository_Audit.md` for what is actually implemented and the evidence limits.
5. `docs/16_Engineering_Backlog.md` for ordered work and acceptance criteria.
6. `skills/README.md` and the relevant skill(s) for the task.
7. `.agents/rules/rules_of_code.md` plus any applicable `AGENTS.md` in the directory being changed. The frontend has `frontend/AGENTS.md`; read it before Next.js changes.

Do not treat `docs/DEV_DOCS/implementation_plan.md` as active instructions. It is a marked historical snapshot. Do not treat proposed endpoints in `docs/03_API_Endpoints.md` or candidate schemas in `docs/04_Schemas.md` as implemented contracts.

## Authority map

| Question | Authority |
| --- | --- |
| What should PodFlow become? | `docs/00_PodFlow_V2_Master_Specification.md`, with detail in `docs/01_PRD.md` through `docs/14_Marketing_Landing_Page_UI_UX_Spec.md`. |
| What exists now? | `docs/15_Repository_Audit.md`, then verify against current code and commands. |
| What should happen next? | `docs/16_Engineering_Backlog.md`; update it when a dependency or priority changes. |
| How should an agent work? | This guide, root `skills/README.md`, the focused skill, repository rules, and applicable `AGENTS.md`. |
| What is the API/schema contract today? | Current FastAPI OpenAPI output and migrations are authoritative for implemented surfaces. Planning docs become binding only after the relevant contract is approved and implemented. |

## Baseline implementation map

- Backend package: `backend/src/podflow/`; app factory `api/app.py`; health routes `api/v1/health.py`; auth dependency `api/dependencies/auth.py`; config `core/config.py`; database models/session `persistence/db/`; migrations in `backend/alembic/`.
- Frontend: `frontend/src/app/` and `frontend/src/components/`; public page is `/`; current UI is a static product presentation, not a dashboard/API client.
- Tests: backend pytest under `backend/tests/`; browser tests under `frontend/e2e/`.
- CI: `.github/workflows/ci.yml`.
- Dependencies: `backend/pyproject.toml` + `uv.lock`; `frontend/package.json` + `bun.lock`.

## Change workflow

1. Check `git status --short --branch`, read applicable instructions, and inspect nearby code before editing.
2. Identify whether the task is product implementation, cleanup, or documentation. Link the exact requirement and acceptance criteria; if either is absent, record an assumption in the change rather than quietly expanding scope.
3. Use the code-writing standards skill. Keep the diff focused; preserve user changes and Git history.
4. Choose tests by risk: unit for local logic, integration for boundaries, API for contract/auth behavior, browser/E2E for user journeys, and security/performance/accessibility skills when relevant. Do not run unrelated suites by default.
5. Run the checks that apply and report exact commands/results. A blocked command is not a pass. Never claim access to GitHub, production, secrets, or external services unless actually checked.
6. Update implementation status, setup/API/schema instructions, and backlog if the behavior or architecture changed.
7. Review the diff, links, secrets, and `git status`; report changes, verification, remaining risks, and follow-up.

## Current local commands

From `backend/`: `uv sync --all-extras --locked`, `uv run ruff check .`, `uv run pytest`, `uv run alembic -c alembic.ini heads`, and `uv run uvicorn podflow.api.app:create_app --factory --reload`.

From `frontend/`: `bun install --frozen-lockfile`, `bun run lint`, `bun run typecheck`, `bun run build`, then `bun run test:e2e`. Playwright's Edge alternative is `$env:PW_CHANNEL="msedge"; bun run test:e2e` on Windows. Production build should set `NEXT_PUBLIC_SITE_URL` to the canonical origin.

The audit records that this Windows setup could not load the psycopg native binary for pytest, while the frontend Playwright suite passed with installed Edge. Re-check the environment before assuming those local limitations persist.
