# PodFlow Backend Foundation — Architecture Audit & Implementation Plan

## Phase 0 — Current Repository Understanding

### Current Repository Structure

```text
PodFlow/
├── .agents/
│   ├── rules/rules_of_code.md          # 746-line engineering rulebook
│   ├── skills/                          # empty
│   └── workflows/                       # empty
├── .coderabbit.yaml                     # PR review configuration
├── .env                                 # LOCAL ONLY — not tracked (contains live keys!)
├── .env.example                         # template — tracked
├── .git/
├── .github/workflows/ci.yml            # validates required files + secret scan
├── .gitignore                           # present but has heredoc wrapper issue
├── LICENSE
├── README.md
├── backend/
│   ├── .venv/                           # local virtual environment
│   ├── pyproject.toml                   # Python 3.13, FastAPI 0.141, etc.
│   ├── requirements.txt                 # pip-frozen lock (UTF-16LE encoding)
│   └── src/
│       ├── podflow/
│       │   └── __init__.py              # empty
│       └── podflow_backend.egg-info/    # editable install metadata
└── docs/
    ├── README.md
    ├── 01_PRD.md through 13_Platform_Monorepo_and_Extension_Architecture.md
```

### Current Git State

- **Branch:** `feature/backend-foundation` (current working branch)
- **Untracked:** `.agents/`, `backend/`, `docs/13_Platform_Monorepo_and_Extension_Architecture.md`
- **No `tests/` directory exists yet**
- **No application source code exists** — only an empty `__init__.py`
- The `.env` file is properly gitignored and not tracked

### Current `pyproject.toml` Dependency Versions (FACT)

| Package | Version Range |
|---|---|
| Python | `>=3.13, <3.14` |
| FastAPI | `>=0.141, <0.142` |
| Uvicorn[standard] | `>=0.52, <0.53` |
| pydantic-settings | `>=2.15, <3` |
| SQLAlchemy | `>=2.0.52, <2.1` |
| Alembic | `>=1.20, <1.21` |
| psycopg[binary] | `>=3.3, <3.4` |
| **Dev:** pytest | `>=9.1, <10` |
| **Dev:** httpx | `>=0.28, <0.29` |
| **Dev:** ruff | `>=0.16, <0.17` |

### Current CI Pipeline (FACT)

The CI ([ci.yml](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/.github/workflows/ci.yml)) only validates:
1. Required files exist (README, LICENSE, .gitignore, .env.example, .coderabbit.yaml, ci.yml, docs/README.md)
2. Required docs exist (01–12, does NOT validate 13)
3. Tracked secrets scan

It does **not** yet run: pytest, ruff, typecheck, build, or any backend validation.

---

## Phase 0A — Architecture Audit

### Core Architecture (FACT FROM DOCUMENTATION)

Per [02_TRD.md](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/docs/02_TRD.md) and [13_Platform_Monorepo_and_Extension_Architecture.md](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/docs/13_Platform_Monorepo_and_Extension_Architecture.md):

```text
Experiences (Web, Extensions, Clients)
        |
   Platform API (REST/OpenAPI, /api/v1)
        |
   +----+----+----+
   |         |         |
Knowledge  Workflow  Connector
Engine     Engine    Layer
   |         |         |
   +----+----+----+
        |
   Infrastructure (PostgreSQL+pgvector, Supabase, Storage)
```

### Does the Current Architecture Support the Long-Term Direction?

**Assessment: Yes, with caveats.**

| Boundary | Current Status | Sufficient for M1? | Future Risk |
|---|---|---|---|
| **Logical domain boundaries** | Documented in TRD §"Backend boundaries" as `domain/`, `workflow/`, `ingestion/`, etc. | ✅ | Low — clean layering is described |
| **API boundaries** | `/api/v1` prefix, REST/JSON, OpenAPI contract | ✅ | Low |
| **Frontend/backend boundaries** | Separate `backend/` and future `frontend/` dirs; REST boundary | ✅ | Low |
| **Knowledge Engine boundaries** | Documented as independent of particular frontend | ✅ | Low — Doc 13 §14 explicitly addresses this |
| **Workflow Engine boundaries** | LangGraph, declarative definitions, separate from domain | ✅ | Medium — LangGraph coupling needs ADR when implemented |
| **Connector boundaries** | Doc 13 §6–7 define inbound/outbound connector contracts | ✅ (not needed for M1) | Low — well-documented |
| **Integration boundaries** | Gmail/Notion/Drive listed as connectors behind the connector layer | ✅ (not needed for M1) | Low |
| **Extension/client boundaries** | Doc 13 §9,15 — extensions are untrusted, use authenticated API | ✅ (not needed for M1) | Medium — needs ADR before implementation |
| **Shared contracts** | Doc 13 §11 — OpenAPI → TypeScript types, future SDK | ✅ (not needed for M1) | Low — deferred correctly |
| **Auth/authz** | Supabase Auth + Google OAuth + owner-scoped (ADR-004, ADR-007) | ✅ (not needed for M1) | Low |
| **Dependency direction** | Doc 13 §5 — Experience→API→Engines→Infrastructure | ✅ | Low — correct hexagonal direction |
| **Monorepo evolution** | Doc 13 §4 — current flat structure is OK; migrate to apps/packages only when justified | ✅ | Low — explicit "do not prematurely migrate" policy |
| **Testing boundaries** | Doc 13 §18 — unit/integration/contract/E2E layers defined | ✅ | Low |
| **Observability** | Doc 13 §17 — request ID, run ID, latency, retries, no secrets in logs | ✅ (not needed for M1 beyond structured logging) | Low |

**Conclusion:** The current repository structure (`backend/src/podflow/`) is sufficient for the first backend milestone. The documented architecture explicitly recommends this evolutionary approach (Doc 13 §22).

---

## Phase 0B — Contradictions and Gaps

### Contradictions Found

#### C1. Backend Package Path: `backend/app/` vs `backend/src/podflow/`

- **[02_TRD.md](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/docs/02_TRD.md) line 53** documents backend module boundaries as `backend/app/api/`, `backend/app/domain/`, etc.
- **[12_Repo_Migration_and_Branch_Plan.md](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/docs/12_Repo_Migration_and_Branch_Plan.md) line 70** shows `backend/{app,tests,alembic,pyproject.toml}`.
- **Actual repository** uses `backend/src/podflow/` with `pyproject.toml` configured as `package-dir = {"" = "src"}`.
- **Doc 13 §22** says to establish the FastAPI application with clean package boundaries — but doesn't specify the path.

**Nature:** The TRD and migration plan reference a `backend/app/` layout, but the actual `pyproject.toml` establishes a `src/podflow/` layout. These are incompatible.

**Impact:** Medium. We must choose one. The `src/podflow/` layout is already established in `pyproject.toml` and is the more standard Python packaging approach. The `backend/app/` references in TRD and Doc 12 appear to be an earlier convention.

> [!IMPORTANT]
> **Recommendation:** Follow the established `pyproject.toml` — use `backend/src/podflow/` as the package root. The TRD's `backend/app/` references should be treated as conceptual module names (i.e., `podflow.api`, `podflow.domain`, etc.), not literal directory paths. A documentation update to clarify this would be ideal but is not blocking.

#### C2. Python Version: 3.11+ vs 3.13

- **[08_Dev_and_Agents_Environment.md](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/docs/08_Dev_and_Agents_Environment.md) line 5** says "Python 3.11+".
- **`pyproject.toml`** specifies `requires-python = ">=3.13,<3.14"`.

**Nature:** Minor documentation drift. `pyproject.toml` is authoritative. Doc 08 was written earlier.

**Impact:** Low. The `pyproject.toml` is the source of truth.

#### C3. Branch Naming Convention

- **[12_Repo_Migration_and_Branch_Plan.md](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/docs/12_Repo_Migration_and_Branch_Plan.md)** specifies `restructure/v2-foundation` as the branch name.
- **[08_Dev_and_Agents_Environment.md](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/docs/08_Dev_and_Agents_Environment.md) line 60** specifies `feat/*`, `fix/*`, `chore/*`.
- **CI** ([ci.yml](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/.github/workflows/ci.yml) line 7–9) triggers on `restructure/**`, `feature/**`, `fix/**` — note `feature/` not `feat/`.
- **Current branch** is `feature/backend-foundation`.

**Nature:** Minor inconsistency in branch prefix conventions. CI uses `feature/**` while docs say `feat/*`.

**Impact:** Low. CI already triggers on the current branch. Should be unified eventually.

#### C4. `.gitignore` Contains Shell Heredoc Wrapper

The [.gitignore](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/.gitignore) file starts with `cat > .gitignore <<'EOF'` and ends with `EOF`. This is shell syntax that was accidentally pasted as the file content. Git still works because unrecognized patterns are simply ignored, but the first line `cat > .gitignore <<'EOF'` and last line `EOF` are not valid gitignore patterns.

**Impact:** Low functional impact (gitignore rules between the heredoc lines work). Should be cleaned up.

### Gaps Identified

#### G1. No `tests/` Directory Exists

The `pyproject.toml` configures `testpaths = ["tests"]` but no `tests/` directory exists under `backend/`.

**Impact:** Must be created as part of M1.

#### G2. No Application Entry Point Exists

Only an empty `__init__.py` exists in `backend/src/podflow/`. No FastAPI app, no configuration module, no health endpoint.

**Impact:** This is the core of M1.

#### G3. CI Does Not Run Backend Validation

The CI pipeline validates file existence and secret scanning only. It does not run `pytest`, `ruff`, or any Python checks.

**Impact:** Should be extended as part of M1 or immediately after, but CI changes are a separate concern from the backend foundation code.

#### G4. `requirements.txt` Has UTF-16LE Encoding

The `requirements.txt` file uses UTF-16LE encoding, which can cause issues with tools that expect UTF-8.

**Impact:** Low — the file is a lock file, not a primary dependency specification. `pyproject.toml` is authoritative.

#### G5. `.env.example` Variables vs Backend Configuration

The `.env.example` lists `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc. For the first milestone, the backend configuration only needs a minimal subset. The configuration module must distinguish between required-for-production and optional-for-local-dev settings.

#### G6. Doc 13 Not in CI Validation

[ci.yml](file:///e:/Personal%20Learning/Computer%20coding/PROjects/PodFlow/.github/workflows/ci.yml) validates docs 01–12 but not `13_Platform_Monorepo_and_Extension_Architecture.md`.

**Impact:** Low — documentation-only. Can be fixed separately.

---

## Phase 0C — ADRs / Documentation Changes Assessment

### ADRs Needed Before Platform/Extension Work (NOT NEEDED FOR M1)

Per Doc 13 §19, these ADRs should exist before the platform ecosystem becomes implementation-heavy:

1. Monorepo and package boundary strategy
2. Public API versioning
3. Connector contract and lifecycle
4. External extension authentication
5. Shared API contract/code generation strategy
6. Workflow execution and connector invocation
7. Credential storage and secret handling
8. Observability/tracing boundary

**Assessment:** None of these are blocking for M1. They become relevant at Phase 2+ (ingestion), Phase 7 (integrations), and Phase 8 (workflow builder).

### Documentation Changes That Would Be Ideal (NOT BLOCKING)

1. **Clarify `backend/app/` vs `backend/src/podflow/`** in TRD and Doc 12 — the actual package layout has been established in `pyproject.toml` and diverges from these docs.
2. **Update Doc 08** to say Python 3.13 instead of 3.11+.
3. **Fix `.gitignore`** heredoc wrapper.

**Recommendation:** These are non-blocking cleanups. I will NOT modify documentation in M1 unless explicitly authorized. They can be a follow-up chore PR.

---

## Phase 0D — Pre-Implementation Report

### 1. Current Architecture Understanding

PodFlow is designed as an AI knowledge platform with a clean layered architecture: Experiences → Platform API → Engines (Knowledge, Workflow) → Infrastructure. The backend follows a hexagonal-style approach where the domain layer does not depend on FastAPI or provider SDKs. The first milestone is explicitly defined as a minimal FastAPI foundation.

### 2. Current Repository Structure

A partially scaffolded backend with `pyproject.toml`, empty `src/podflow/__init__.py`, a locked `.venv`, but no application code, no tests, and no configuration module. All 13 documentation files are present and internally consistent except for the minor contradictions listed above.

### 3. Long-Term Platform/Connector Implications

The documented architecture in Doc 13 is well-designed for platform evolution. The dependency direction is correct (inward). Connectors are properly isolated behind contracts. Extensions are treated as untrusted clients. The "do not prematurely migrate to apps/packages" policy is sound.

**No architectural changes are needed for M1 to support the long-term direction.**

### 4. Architecture Gaps

- G1–G6 as listed above. All are addressable within M1 scope or as separate chores.

### 5. Contradictions

- C1–C4 as listed above. C1 (package path) is the only one with meaningful implementation impact; resolved by following `pyproject.toml`.

### 6. Documentation Changes/ADRs Needed

- None blocking for M1. Ideal cleanups listed above.

### 7. Recommended First Backend Milestone

A minimal, production-oriented FastAPI foundation that establishes:

1. **Application factory** — a `create_app()` function that returns a configured FastAPI instance
2. **Configuration module** — `pydantic-settings` based, environment-driven, with sensible defaults for local development
3. **Health endpoints** — `GET /health/live` and `GET /health/ready` per the API spec
4. **API router structure** — `/api/v1` prefix established
5. **Tests** — pytest-based, using httpx `TestClient`, covering health endpoints (happy path + structure)
6. **Ruff-compatible code** — passes `ruff check` and `ruff format --check`

### 8. Exact Files to Create or Modify

#### New Files

| File | Purpose |
|---|---|
| `backend/src/podflow/config.py` | Pydantic-settings based configuration |
| `backend/src/podflow/app.py` | FastAPI application factory |
| `backend/src/podflow/api/__init__.py` | API package |
| `backend/src/podflow/api/v1/__init__.py` | V1 API package |
| `backend/src/podflow/api/v1/health.py` | Health endpoint router |
| `backend/tests/__init__.py` | Tests package marker |
| `backend/tests/conftest.py` | Shared fixtures (TestClient) |
| `backend/tests/api/__init__.py` | API tests package marker |
| `backend/tests/api/v1/__init__.py` | V1 API tests package marker |
| `backend/tests/api/v1/test_health.py` | Health endpoint tests |

#### Files That May Need Minor Modification

| File | Change |
|---|---|
| `backend/src/podflow/__init__.py` | Remain empty or add minimal version marker |

#### Files NOT Modified

- `pyproject.toml` — already correctly configured
- `docs/*` — no changes unless explicitly authorized
- `.agents/*` — no changes
- `.github/workflows/ci.yml` — no changes (CI expansion is a separate concern)
- `.env.example` — no changes
- `.gitignore` — no changes (heredoc fix is a separate chore)

### 9. Dependencies

**No new dependencies.** Everything needed is already declared in `pyproject.toml`:
- `fastapi` — application framework
- `uvicorn[standard]` — ASGI server (for local `uvicorn podflow.app:create_app --factory`)
- `pydantic-settings` — environment-driven configuration
- `httpx` (dev) — async test client for FastAPI
- `pytest` (dev) — test runner
- `ruff` (dev) — linter/formatter

### 10. Things Explicitly NOT Implemented Yet

- ❌ Authentication / Supabase Auth / Google OAuth
- ❌ Database connection / SQLAlchemy session / Alembic migrations
- ❌ Any domain models (Source, Document, Chunk, Artifact, etc.)
- ❌ YouTube / URL / PDF ingestion
- ❌ LLM integration / Gemini
- ❌ Embeddings / pgvector / RAG
- ❌ Workflow engine / LangGraph
- ❌ Gmail / integration connectors
- ❌ Export (Markdown/PDF/DOCX)
- ❌ Frontend / Next.js
- ❌ Browser extension / desktop app
- ❌ Redis / Celery / background workers
- ❌ Docker / docker-compose
- ❌ Production deployment (Render/Vercel)
- ❌ CI pipeline expansion (pytest/ruff in GitHub Actions)
- ❌ Observability infrastructure (structured logging, tracing)
- ❌ Rate limiting / CORS configuration
- ❌ Plugin marketplace / SDK

> [!IMPORTANT]
> The `/health/ready` endpoint is defined in the API spec. For M1, it will return `200 OK` unconditionally. In future milestones, it should check database connectivity and other subsystem readiness. This is intentional: we establish the contract now and evolve the implementation.

---

## Security Note

> [!CAUTION]
> The local `.env` file contains what appear to be **live Google API credentials** (`GOOGLE_API_KEY` and `GOOGLE_CLIENT_ID`). While `.env` is properly gitignored and not tracked, you should verify these credentials are still needed and consider rotating the `GOOGLE_API_KEY` since it was visible during this audit session.

---

## Verification Plan

After implementation, run:

```bash
cd backend
# Activate venv
.venv\Scripts\activate

# Run tests
python -m pytest tests/ -v

# Run linter
python -m ruff check src/ tests/

# Run formatter check
python -m ruff format --check src/ tests/

# Verify package integrity
python -m pip check

# Verify the app starts
python -c "from podflow.app import create_app; app = create_app(); print('OK')"
```

---

## Awaiting Approval

**STOP.** No code will be written until this audit is reviewed and implementation is explicitly authorized.
