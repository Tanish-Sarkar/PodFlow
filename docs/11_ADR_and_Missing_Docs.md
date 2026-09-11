# PodFlow --- ADRs and Additional Documents

## ADR-001 --- Python/FastAPI

Keep the Python backend because of the AI/RAG/document ecosystem and
LangGraph integration.

## ADR-002 --- Next.js

Use Next.js + React + TypeScript for routing, public artifact pages and
a serious application shell while retaining React.

## ADR-003 --- Supabase PostgreSQL + pgvector

Use one primary relational database and vector layer. This reduces
synchronization and operational complexity.

## ADR-004 --- Supabase Auth + Google OAuth

Supabase Auth is the authentication/session layer; Google is the OAuth
identity provider.

## ADR-005 --- Object storage

Binary uploads/exports live in Supabase Storage; metadata and
relationships live in PostgreSQL.

## ADR-006 --- KnowledgeArtifact

All delivery formats render from one provider-neutral canonical
artifact.

## ADR-007 --- V1 authorization

Use owner-scoped authorization now. Add organizations/roles later
instead of implementing full RBAC prematurely.

## Additional documents you should maintain

### Threat Model

Auth, broken access control, share links, prompt injection, malicious
URLs/PDFs, SSRF, file upload attacks, secret leakage and LLM data
exposure.

### Observability Runbook

Alerts, logs, metrics, incident triage, common failures and rollback.

### Evaluation Specification

Datasets, metrics, acceptance thresholds, model comparisons and
regression process.

### Data Retention & Privacy

Source/artifact retention, deletion, public-link expiry, export and
third-party provider handling.

These are more valuable than adding another database or infrastructure
technology.
