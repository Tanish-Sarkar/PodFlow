# PodFlow --- Technical Requirements Document

## Architecture

``` text
Next.js / React / TypeScript
            |
       REST / OpenAPI
            v
       FastAPI / Python
            |
   +--------+---------+----------------+
   |                  |                |
Workflow          Knowledge        Integrations
Engine             Engine
   |                  |                |
LangGraph       Ingestion/RAG      Gmail/etc.
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
| **Frontend** | Next.js + React + TypeScript |
| **UI** | Tailwind CSS + component system |
| **Server state** | TanStack Query |
| **Workflow UI** | React Flow |
| **Backend** | FastAPI + Python |
| **ORM** | SQLAlchemy 2.x |
| **Migrations** | Alembic |
| **Database** | Supabase PostgreSQL |
| **Vector search** | pgvector in PostgreSQL |
| **Object storage** | Supabase Storage |
| **Auth** | Supabase Auth + Google OAuth |
| **Orchestration** | LangGraph |
| **LLM** | Provider abstraction; Gemini initially |
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

## AI generation

LLM calls use typed outputs, validation, transient-error retries,
provider/model metadata, and source references. Raw private content and
secrets should not be logged.

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
