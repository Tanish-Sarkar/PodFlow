# PodFlow --- Product Requirements Document

## Product thesis

PodFlow is an AI-powered knowledge workspace that turns heterogeneous
resources into grounded, structured knowledge artifacts that users can
review, edit, share, export, send, and store.

## Problem

People consume large amounts of information but struggle to extract
important ideas reliably, preserve evidence, turn information into
reusable outputs, and repeat the process across videos, URLs, PDFs and
documents.

The current prototype is a YouTube → transcript → insights → newsletter
→ email workflow with human checkpoints. The rebuild makes the reusable
KnowledgeArtifact and knowledge/retrieval layer the product core.

## V1 goals

1.  Supabase Auth + Google OAuth.
2.  YouTube, generic URL and PDF/document ingestion.
3.  Common normalized source representation.
4.  Chunking and pgvector indexing.
5.  Grounded retrieval.
6.  Canonical `KnowledgeArtifact`.
7.  Claims, evidence, sources and citations.
8.  Review/edit workflow.
9.  Artifact/version persistence.
10. Web viewer.
11. Markdown/PDF/DOCX export.
12. Temporary public sharing.
13. Gmail sending.
14. Dashboard for sources/artifacts.
15. Workflow execution model.
16. Testing, CI/CD, evaluation and observability.

## Non-goals

-   Native mobile apps.
-   Full enterprise RBAC.
-   Billing.
-   Plugin marketplace.
-   Fully autonomous internet-wide planning.
-   Kubernetes/microservices without demonstrated need.
-   Multiple databases for the same responsibility.

## Primary user journey

Sign in → add source → ingest/normalize → chunk/index → run workflow →
retrieve evidence → generate artifact → review/edit → persist →
view/share/export/send.

## Product principles

-   Simple on the surface, rigorous underneath.
-   Evidence before confidence.
-   Canonical artifact before delivery format.
-   Provider-neutral domain model.
-   Human approval where wrong output matters.
-   No hidden data access.
-   Important AI outputs should be traceable to source context.

## Success criteria

A new user can sign in, add a supported source, obtain a grounded
artifact, inspect citations/evidence, edit it, persist it, export/share
it, and repeat the workflow reliably.
