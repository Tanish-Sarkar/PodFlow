# PodFlow --- Technical Requirements Document

> **Status:** Supporting technical specification. Read with `00_PodFlow_V2_Master_Specification.md`, which resolves product-scope conflicts.

## Architecture

``` text
Dashboard / PWA / Chrome Extension / Future Connectors
            |
       REST / OpenAPI
            v
       FastAPI / Python
            |
   +--------+---------+----------------+
   |                  |                |
Workflow          Knowledge        Delivery
Engine             Engine           Service
   |                  |                |
Durable runs    Ingestion/RAG      Presentations, exports,
                                sharing, Gmail/etc.
   |                  |
   +--------+---------+
            |
       Supabase PostgreSQL
          + pgvector
            |
      Supabase Storage
```

## Technology decisions

| Concern | Decision |
| :--- | :--- |
| **Frontend** | Next.js + React + TypeScript; responsive PWA |
| **Extension** | Chrome extension as an authenticated API client |
| **UI** | Tailwind CSS + component system |
| **Server state** | TanStack Query |
| **Workflow UI** | React Flow |
| **Backend** | FastAPI + Python 3.13 only after dependency compatibility validation |
| **Python tooling** | `uv` with pinned dependencies and lockfile |
| **Frontend tooling** | Bun with pinned dependencies and lockfile, after Next.js compatibility validation |
| **ORM** | SQLAlchemy 2.x |
| **Migrations** | Alembic |
| **Database** | Supabase PostgreSQL |
| **Vector search** | pgvector in PostgreSQL |
| **Object storage** | Supabase Storage |
| **Auth** | Supabase Auth + Google OAuth |
| **Orchestration** | LangGraph |
| **LLM** | Provider abstraction; evaluated open-weight models initially |
| **API** | FastAPI-generated OpenAPI |
| **CI** | GitHub Actions |
| **Review** | CodeRabbit + human review |
| **Frontend deploy** | Vercel |
| **Backend deploy** | Render |

## Backend boundaries

``` text
backend/app/
  api/
  application/
  domain/
  workflow/
  ingestion/
  retrieval/
  llm/
  integrations/
  persistence/
  evaluation/
  core/
```

`domain` must not depend on FastAPI, provider SDKs or UI code. Provider
SDKs live behind adapters. API schemas are separate from database
models.

## Ingestion

YouTube/Web/PDF/Document → source adapter → normalized document →
chunker → embedding → PostgreSQL + pgvector.

Every normalized document retains provenance such as source ID and
page/timestamp/section locator where available.

## Retrieval

Start with vector similarity, metadata filtering and top-k retrieval.
Add hybrid retrieval only if evaluation demonstrates a need. Do not
introduce a dedicated vector DB without measured justification.

## AI generation and improvement

LLM calls use typed outputs, validation, transient-error retries,
provider/model metadata, and source references. Raw private content and
secrets should not be logged.

Use explicit preferences and consented feedback for personalization.
Do not perform uncontrolled online training from live runs. Candidate
prompt/model/fine-tuning changes require offline evaluation against a
fixed benchmark before release.

## Presentation and chat

Presentation generation returns validated structured data rendered by a
constrained frontend component system; it must not return executable
HTML, JavaScript, or CSS. Chat retrieval is restricted to user-selected
artifact/source attachments, and every answer records the versions used.

## Persistence

PostgreSQL stores users, sources, documents, chunks, embeddings,
workflows, runs, artifacts, versions, citations and integration
metadata. Supabase Storage stores binary uploads and generated exports.

## Security

Validate Supabase JWTs, enforce ownership server-side, validate
URLs/uploads, restrict file sizes/types, sanitize rendered HTML, use
unguessable expiring share tokens, and never log secrets.

## Reliability

Process-local state such as the prototype's in-memory structures must
not be the production source of truth. Long-running workflows need
durable run state.

## Observability

Capture request ID, user ID where safe, run/source/artifact IDs,
provider/model, latency, retries and categorized errors. Avoid raw
transcripts/private artifact content in logs.

## API

REST/JSON, `/api/v1`, OpenAPI as contract, structured errors,
pagination, and idempotency for retry-sensitive operations.
