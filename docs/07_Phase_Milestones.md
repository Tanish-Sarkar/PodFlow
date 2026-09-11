# PodFlow --- Phase-wise Milestones

Estimates assume one strong developer using AI agents with human review.

## Phase 0 --- Repository reset: 1--2 days

Tag legacy state, create restructuring branch, clean obsolete branches
after verification, establish structure, docs, rules and CI.

## Phase 1 --- Foundation: 3--5 days

FastAPI, Next.js, Supabase, SQLAlchemy, Alembic, auth, ownership model
and health endpoints.

## Phase 2 --- Ingestion: 4--7 days

YouTube, URL, PDF/document adapters, normalization, storage, chunking
and ingestion status/jobs.

## Phase 3 --- RAG: 4--7 days

Embeddings, pgvector, retrieval API, metadata filters, retrieval
evaluation and citation locators.

## Phase 4 --- KnowledgeArtifact: 4--6 days

Artifact schema, structured generation, evidence/citations, versioning,
validation and persistence.

## Phase 5 --- Evaluation: 3--5 days

Benchmark dataset, retrieval metrics, groundedness/citation checks and
regression harness.

## Phase 6 --- Workspace: 4--6 days

Dashboard, source/artifact libraries, artifact viewer,
search/filter/tag/favorite/archive and review/edit UX.

## Phase 7 --- Exports/integrations: 4--7 days

Markdown, PDF, DOCX, temporary public sharing and Gmail.

## Phase 8 --- Workflow builder: 7--12 days

Declarative workflow definitions, React Flow editor, node configuration,
execution mapping and run history.

## Phase 9 --- Production hardening: 4--7 days

Rate limits, structured logging, error tracking, retries/idempotency,
security review, dependency/performance work and backup/restore
verification.

## Phase 10 --- Portfolio polish: 2--4 days

Architecture diagram, README, demo, benchmark results, ADRs, CI badges,
deployment docs and resume bullets.

## Total

Roughly 6--10 weeks for a serious first version. Complete the POC first;
if grounding/retrieval is weak, fix it before expanding UI.
