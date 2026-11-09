# PodFlow --- Product Requirements Document

> **Status:** Supporting product requirements. The current cross-product baseline is `00_PodFlow_V2_Master_Specification.md`; this document supplies the detailed original requirements and is reconciled below.

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
→ email workflow. The rebuild makes the reusable KnowledgeArtifact and
knowledge/retrieval layer the product core. Email is one delivery option,
not the product's purpose.

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
17. Presentable, structured website views for artifacts.
18. Cited chat over one or more user-selected artifact/source scopes.
19. Responsive PWA and Chrome extension clients that use the same API.
20. JSON export and recipient import from CSV/XLSX.

## Non-goals

-   Native mobile apps.
-   Full enterprise RBAC.
-   Billing.
-   Plugin marketplace.
-   Fully autonomous internet-wide planning.
-   Kubernetes/microservices without demonstrated need.
-   Multiple databases for the same responsibility.

## Primary user journey

Sign in → add one or more sources → ingest/normalize → chunk/index →
run workflow → retrieve evidence → generate and persist artifact →
view/chat/present → optionally edit, share, export, or send.

## Product principles

-   Simple on the surface, rigorous underneath.
-   Evidence before confidence.
-   Canonical artifact before delivery format.
-   Provider-neutral domain model.
-   Automatic artifact creation for routine work; explicit user action for
    external delivery, public sharing, account connections, and deletion.
-   No hidden data access.
-   Important AI outputs should be traceable to source context.

## Success criteria

A new user can sign in, add a supported source, obtain a grounded
artifact, inspect citations/evidence, edit it, persist it, export/share
it, and repeat the workflow reliably.
