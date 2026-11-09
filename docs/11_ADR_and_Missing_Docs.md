# PodFlow --- ADRs and Additional Documents

> **Status:** ADR register and required follow-up documentation. Decisions below that conflict with the master specification should be updated before implementation.

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

## ADR-008 --- Open-weight model policy

Use evaluated open-weight models through provider adapters as the default
production model strategy. Do not silently add a frontier provider; that
requires an explicit privacy, cost, and quality decision.

## ADR-009 --- Presentation renderer

Generate validated structured presentation data and render it with
predefined frontend components. Do not execute model-generated page code.

## ADR-010 --- Scoped chat

Chat retrieval is limited to explicitly attached, authorized
artifact/source scopes. Persist the scope/version snapshot for each
answer to preserve citation reproducibility.

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

### Model Improvement and Feedback Policy

User consent, feedback retention, personalization, de-identification,
benchmarking, fine-tuning approval, and model rollback.

These are more valuable than adding another database or infrastructure
technology.
