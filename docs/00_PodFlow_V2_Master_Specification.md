# PodFlow V2 — Master Product and Engineering Specification

**Status:** Planning baseline  
**Purpose:** Single source of truth for the PodFlow V2 product vision, architecture, scope, and delivery plan. Detailed documents in this directory remain supporting specifications until they are consolidated into this one.

## 1. The product in one paragraph

PodFlow is a knowledge workspace that accepts information from multiple sources, turns it into a durable and evidence-backed **Knowledge Artifact**, and makes that knowledge useful in several ways: a polished web presentation, a cited chat experience, exports, and delivery through email or future integrations. It is not an email-newsletter application with a summarizer attached. Email is one output channel among several.

Users can submit YouTube videos, web pages, and files individually or together. PodFlow preserves where knowledge came from, extracts and indexes it, creates an artifact automatically, and lets the user explore, present, share, export, or transform that artifact without reprocessing every original source.

## 2. Product pitch

Most tools turn a source into one disposable summary. PodFlow builds a reusable knowledge layer from a user's sources. A research collection can become a concise brief today, a shareable visual explanation tomorrow, a PDF next week, and a chat-grounded answer whenever the user needs it. Every important claim should lead back to the source context that supports it.

The product begins as a serious personal and portfolio project. Its architecture leaves room for workspaces, collaboration, third-party clients, and integrations without implementing those features prematurely.

## 3. Product principles

1. **Artifact first.** A canonical Knowledge Artifact is the durable result; formats are views or transformations of it.
2. **Evidence before fluency.** Generation and chat must use retrieved context and expose citations where meaningful.
3. **One service, many clients.** The dashboard, PWA, Chrome extension, and connectors call the same authenticated application API.
4. **Automatic by default.** Routine processing completes and saves artifacts without requiring a review gate.
5. **Human control for consequential actions.** Sending email, creating public sharing, deleting data, and connecting external accounts require an explicit user action.
6. **Open-weight model first.** Production AI capabilities should run on suitable open-weight models, with provider adapters so models can evolve without changing the domain.
7. **Improve with evidence.** Measure quality, collect user feedback with consent, and promote model changes only after offline evaluation.

## 4. Users and primary journeys

### 4.1 Research and knowledge creation

1. A signed-in user creates a run and submits one or more URLs and files.
2. PodFlow validates, extracts, normalizes, chunks, embeds, and indexes the content.
3. The workflow produces and saves a Knowledge Artifact with claims, takeaways, evidence, and source references.
4. The user opens the artifact as a readable, presentable knowledge page.

### 4.2 Ask questions over knowledge

1. The user opens a chat and attaches one or more artifacts or source collections.
2. The active attachments define the chat's knowledge scope.
3. PodFlow retrieves only from that scope, generates an answer, and shows citations to artifact/source passages.
4. The user can replace, remove, or add attachments during the conversation. Each answer records the artifact versions used, so its citations stay reproducible.

### 4.3 Present and share

1. The user asks PodFlow to create a website view for an artifact.
2. A presentation-generation workflow produces structured page content and a safe, constrained UI layout from approved templates/components.
3. The user previews the result in the dashboard.
4. The user explicitly creates a 24-hour public share link for that website view.
5. The share service validates the token and expiry on every request.

### 4.4 Export and distribute

1. A user selects an artifact or a particular run/version.
2. PodFlow creates Markdown, JSON, DOCX, or PDF exports from that canonical version.
3. The user may transform the artifact into a newsletter, import recipients from CSV/XLSX, review invalid and duplicate addresses, then send through the email integration.

## 5. Core domain model

| Concept | Responsibility |
| --- | --- |
| Resource | An input: YouTube URL, web URL, uploaded file, or future connector submission. |
| Document | Normalized extract from a resource, with provenance. |
| Chunk | Searchable document segment with locator and embedding. |
| Knowledge Artifact | Canonical reusable knowledge product with title, thesis, structured content, claims, evidence, and sources. |
| Artifact Version | Immutable snapshot of an artifact's content and revision number. |
| Run | Durable execution record for ingestion, generation, transformation, or export. |
| Presentation | A versioned, structured website-view representation of an artifact. |
| Chat Session / Message | A conversation plus messages and the exact attached knowledge scope used for each answer. |
| Share Link | A hashed, revocable, expiring pointer to a presentation. |
| Export | A generated file and its format, version, status, and storage reference. |
| Recipient List / Campaign | Imported recipients and a separately auditable newsletter delivery operation. |
| Connector | Authenticated inbound or outbound integration such as a browser extension, Slack, Notion, or ClickUp. |

Artifacts, sources, chunks, presentations, chats, exports, and runs are owner-scoped. A future workspace layer can extend that ownership model without changing the artifact lifecycle.

## 6. Feature scope

### Core V2

- Google sign-in through Supabase Auth.
- Ingestion of YouTube, web URLs, PDF/documents, and multi-resource submissions.
- Normalization, provenance, chunking, embeddings, and pgvector retrieval.
- Automatically saved Knowledge Artifacts with version history and evidence.
- Artifact viewer and a generated website view using safe, predefined presentation components.
- Chat over selected artifact(s) or source collections, with citations and scope switching.
- Temporary, revocable 24-hour share links for website views.
- Markdown, JSON, DOCX, and PDF export.
- Newsletter transformation, CSV/XLSX recipient import, validation, review, and email delivery.
- Authenticated dashboard, responsive PWA, and Chrome extension as API clients.

### Later, after the core proves useful

- Slack, ClickUp, Notion, and other connectors.
- Team workspaces and roles.
- Billing, marketplace/plugin runtime, native desktop apps, and enterprise controls.

## 7. Presentation website views

A website view is a distinct, presentational rendition of a Knowledge Artifact. It is not a raw export and is not the dashboard itself. It should make an artifact easy to understand and pleasant to share: title, thesis, narrative sections, visual hierarchy, key points, source/citation links, and optional structured visual blocks.

The generation system must produce **validated structured presentation data**, never arbitrary executable HTML, JavaScript, or CSS. The frontend renders that data through a constrained component library. This prevents unsafe generated code, preserves visual consistency, and makes website views exportable and maintainable.

The model choice for presentation generation follows the open-weight-first policy. A frontier model such as Claude Sonnet is not assumed in the V2 architecture; it would require an explicit later product and privacy decision. Presentation quality should initially come from strong templates, structured outputs, and a small open-weight model where capable.

## 8. Scoped RAG chat

Chat is a first-class knowledge consumption feature, not a general chatbot.

### Scope model

- A chat starts with one or more attached artifacts, source collections, or both.
- The attachments are visible as removable chips: for example, `AI Agent Research v3` and `PodFlow Architecture v2`.
- Retrieval filters by the active attachments and ownership before vector search and reranking.
- Adding or swapping attachments affects future answers only; previous answers retain their historical cited scope.
- An answer that lacks evidence must say that the selected knowledge does not establish the answer rather than inventing one.

This "knowledge swapping" model is a practical and understandable differentiator. It lets a user compare a few focused knowledge sets without losing a conversation's history or turning the entire account into one noisy retrieval pool.

## 9. Model and learning strategy

### 9.1 Model runtime

PodFlow should use a provider-neutral interface for extraction, embeddings, generation, reranking, presentation planning, and chat. Initial deployments should evaluate open-weight models in the approximate 1–4B parameter range for narrow tasks, while allowing larger open models for tasks where quality requires them. Candidate families must be selected from current benchmarks, licenses, hardware requirements, language needs, and security review—not from vendor origin alone.

Small specialized models are realistic for classification, extraction, routing, structured transformation, and lightweight summarization. A 1–4B model may not consistently deliver high-quality multi-source synthesis or sophisticated presentation planning by itself; the system must evaluate that claim against the product benchmark before committing to it.

### 9.2 How PodFlow gets better

The desired behavior—better results after a user has used PodFlow—is valuable, but it should not mean uncontrolled online reinforcement learning after ten runs. That would be noisy, hard to reproduce, and could degrade quality.

Use three controlled improvement paths instead:

1. **Remember user choices:** retain explicit style, length, audience, format, and accepted-edit preferences in the user's preference profile, then apply those choices in later runs. Let users inspect, edit, or clear these preferences. Do not infer sensitive traits or silently treat every edit as a permanent preference.
2. **Feedback data:** capture explicit ratings, regenerate choices, and optionally accepted edits, with clear consent and data-retention rules.
3. **Offline model improvement:** curate de-identified approved examples, train or preference-tune candidate models (for example supervised fine-tuning or DPO), evaluate them against a fixed benchmark, and promote only a measured improvement. Reinforcement learning is an advanced option, not the first mechanism.

The early goal is therefore **personalization after several runs**, while global model improvement happens in evaluated releases rather than silently during a user's live session.

### 9.3 Model evaluation criteria

Do not select a model by reputation or parameter count alone. Before choosing a default, run each candidate through the same versioned PodFlow benchmark: representative multi-source inputs, expected facts and evidence, difficult/ambiguous questions, structured output cases, and examples reflecting user style choices.

Score candidates on:

- **Factual coverage and correctness:** expected important facts included and contradictions avoided.
- **Evidence quality:** claims supported by the right source passages; citations resolve to the correct source and locator.
- **Groundedness:** unsupported claims and fabricated details are counted, including whether the model admits when evidence is missing.
- **Instruction and preference adherence:** output follows the user's saved length, tone, audience, and format choices.
- **Artifact usability:** structure, clarity, and usefulness, reviewed by humans on a consistent rubric.
- **Operational fit:** latency, memory/hardware needs, inference cost, context limits, and license suitability.

Use a fixed held-out benchmark and compare model/prompt versions on the same cases. Repeat stochastic generation cases and retain the outputs and model/runtime settings. Choose a model per task only when it passes minimum quality and operational requirements; among passing candidates, prefer the simplest/cheapest one that meets them. Set numeric thresholds after the first human-reviewed baseline rather than inventing them in advance. Never ship a change that regresses citation correctness or unsupported-claim rate without an explicit decision.

### 9.4 Evaluation gates

Track retrieval recall@k, citation correctness, unsupported-claim rate, structured-output validity, preference adherence, user acceptance/edit distance, latency, and cost. A model/prompt/pipeline change ships only when it meets the benchmark's agreed thresholds and does not regress critical metrics.

## 10. Architecture

```text
Dashboard / PWA / Chrome Extension / Future Connectors
                         |
                   Authenticated API
                         |
      +------------------+------------------+
      |                  |                  |
 Ingestion Service  Knowledge Service   Delivery Service
      |                  |                  |
 extraction       artifacts, RAG       presentation, export,
 normalization    chat, evaluation      sharing, email
      |                  |                  |
      +------------------+------------------+
                         |
                 PostgreSQL + pgvector
                         |
                  Supabase Storage
```

The backend application layer owns authorization, validation, orchestration, and domain rules. Clients never access the database directly. Provider adapters isolate LLMs, email, storage, YouTube extraction, and future integrations from the core domain.

## 11. Technology baseline

| Layer | Decision |
| --- | --- |
| Web / PWA | Next.js, React, TypeScript, Tailwind CSS; responsive and installable PWA support. |
| Browser extension | Chrome Extension, TypeScript; a thin authenticated client of the public API. |
| Backend | FastAPI, Python; use Python 3.13 only after all required AI/document dependencies pass compatibility checks. |
| Python tooling | `uv`, pinned dependencies, lockfile. |
| Frontend tooling | Bun, pinned dependencies, lockfile, provided compatibility is verified with the chosen Next.js toolchain. |
| Data | Supabase PostgreSQL with pgvector. |
| Object storage | Supabase Storage for uploads and generated export files. |
| Authentication | Supabase Auth with Google OAuth; backend JWT validation and server-side owner checks. |
| Models | Open-weight models behind provider adapters; model registry and evaluation records. |
| Workflow execution | Durable database-backed run state; add a queue/worker only when workload measurements justify it. |
| Deployment | Vercel for web, Render or equivalent container platform for FastAPI, Supabase for database/auth/storage. |

React Flow, animation libraries, charting libraries, and a UI component library are implementation choices, not architecture requirements. Introduce each only when a concrete screen needs it. The currently mentioned “Storyly” option must be verified for fit, licensing, and maintenance before adoption.

### 11.1 Stack breakdown

| Area | Selected baseline | Responsibility and boundary |
| --- | --- | --- |
| Web frontend | Next.js + React + TypeScript | Public marketing pages, authenticated dashboard, artifact viewer, presentation preview, and web share pages. Keep public and authenticated routes distinct; enforce access in the API too. |
| PWA | Next.js/React responsive app with installable PWA support | Mobile-friendly access to the same account and backend. It is not a second processing system. |
| Browser extension | Chrome extension + TypeScript | Capture a page or selected content, submit it to the API, and open the resulting artifact. Treat it as an untrusted client; no direct database access or privileged secrets. |
| UI and styling | Tailwind CSS plus a selected accessible component library | Shared dashboard and presentation components. Choose the library after evaluating maintenance, accessibility, licensing, and compatibility. |
| Frontend server state | TanStack Query | API fetching, caching, mutation state, invalidation, and loading/error states. Workflow execution state remains on the backend. |
| API contract | FastAPI-generated OpenAPI, REST/JSON under `/api/v1` | Shared boundary for web, PWA, extension, and connectors. Generate client types only after the API shapes stabilize. |
| Backend | FastAPI + Python | Authentication checks, validation, application services, domain operations, workflows, and integrations. Keep domain logic independent from web and provider SDKs. |
| Python environment | `uv`, pinned dependencies and committed lockfile | Reproducible backend development, scripts, and CI. Confirm Python 3.13 compatibility for model, document, and database dependencies before locking the runtime. |
| Request and persistence schemas | Pydantic + SQLAlchemy 2.x | Pydantic validates API and model outputs; SQLAlchemy maps persistence. Do not return ORM objects directly. |
| Database changes | Alembic | Version every schema change; validate upgrades in CI and apply them as a controlled deployment step. |
| Database and retrieval | Supabase PostgreSQL + pgvector | Relational metadata, ownership, runs, artifacts, versions, provenance, embeddings, retrieval filters, and audit records. Start with vector search and metadata filters; add hybrid search when benchmark results justify it. |
| Binary files | Supabase Storage | Uploaded source files and generated exports. Keep ownership, lifecycle, and object references in PostgreSQL. |
| Authentication | Supabase Auth + Google OAuth | Supabase establishes identity; FastAPI validates JWTs and enforces owner/workspace authorization on every private operation. |
| AI model interface | Provider-neutral adapters for generation, embeddings, reranking, and extraction | Allow model swaps and task-specific routing without leaking model SDK types into domain code. Start with evaluated open-weight candidates. |
| Workflow execution | Durable run records and persisted state | Record status, progress, retries, errors, and outputs in durable storage. Add a queue/worker when latency and workload justify it. |
| Backend deployment | Render or equivalent container service | Run FastAPI and, if needed, workers with secrets held in the platform secret store. |
| Frontend deployment | Vercel | Deploy the Next.js site, PWA, and public presentation/share routes. |
| Containers and local dependencies | Docker where it improves reproducibility | Local PostgreSQL/Supabase-compatible services or deployable backend image; don't require Kubernetes. |
| CI and review | GitHub Actions; optional CodeRabbit plus human review | Lint/typecheck, Python tests, frontend checks, migration validation, builds, and secret scans. A review bot does not replace test or security decisions. |
| Development configuration | `.env.example` committed; local secrets in ignored env files | Keep credentials out of Git. Separate local, preview/staging, and production services and data. |

The initial stack does not require a microservice per domain, a second vector database, a broker, a plugin runtime, or a workflow canvas. Keep a modular monolith until measured needs justify another runtime or service boundary.

### 11.2 Initial domain schema map

PostgreSQL should own users/profiles, optional workspaces, sources/resources, normalized documents, chunks and embedding metadata, workflow definitions/runs, knowledge artifacts and immutable versions, claims and evidence, presentations, share links, chat sessions/messages with attachment snapshots, exports, integration connections, recipient lists/recipients, campaigns/delivery records, and audit events. Supabase Storage holds source binaries and generated files. The detailed candidate fields remain in `04_Schemas.md`; implement only after ownership, retention, indexing, and relationships are reviewed against the codebase.

### 11.3 Endpoint groups

The API inventory in `03_API_Endpoints.md` is a planning contract, not a final implementation commitment. Expected groups are:

- `GET /api/v1/auth/me` for the authenticated profile.
- `/api/v1/sources` for source creation, upload registration, listing, detail, ingestion/retry, and deletion.
- `/api/v1/workflows/runs` for multi-source run creation, status/progress, cancellation, and retry/resume where appropriate.
- `/api/v1/artifacts` for listing, reading, editing, versions, publish/finalize, archive, and artifact metadata.
- `/api/v1/retrieval/search` for authorized retrieval filtered by selected artifact/source scope.
- `/api/v1/chats` and `/api/v1/chats/{chat_id}/messages` for chat sessions, attachment changes, cited answers, and history.
- `/api/v1/artifacts/{artifact_id}/presentations` for presentation generation and preview.
- `/api/v1/presentations/{presentation_id}/share` for create/revoke; a public resolver serves only valid, unexpired presentation links.
- `/api/v1/artifacts/{artifact_id}/exports` and `/api/v1/exports/{export_id}` for Markdown, JSON, DOCX, and PDF jobs.
- `/api/v1/recipient-lists` and `/api/v1/campaigns` for CSV/XLSX import, validation, review, newsletter preparation, and explicit send.
- `/api/v1/integrations` for Gmail and later connectors, with scoped auth and revocation.
- `/api/v1/health/live` and `/api/v1/health/ready` for process and dependency health.

Every route needs a defined request and response schema, auth/permission rule, error shape, pagination where applicable, and idempotency behavior for retry-sensitive creation. OpenAPI remains the source contract.

### 11.4 Development and testing tools

- **Python:** `uv`, Ruff for lint/format, Pyright or mypy for type checking, pytest for test discovery and assertions, HTTPX/FastAPI TestClient for API tests, and Alembic for migration checks.
- **Browser flows:** Python Playwright for dashboard/PWA end-to-end journeys. Browser tests run against an isolated test deployment and test account/data.
- **Frontend:** Bun scripts for install, dev server, lint, typecheck, and build; TypeScript types should be generated from OpenAPI once the contract is stable.
- **Local services:** Docker Compose may start PostgreSQL/pgvector and supporting test services. Never point automated destructive tests at production.
- **CI:** GitHub Actions runs deterministic checks on each pull request and a separate opt-in or scheduled model benchmark job where GPU/model availability makes every-PR execution impractical.
- **Model tracking:** Record dataset version, model identifier/revision, prompt/template version, inference settings, runtime/hardware, and result artifacts for each comparison. Store benchmark inputs safely; avoid logging user-private source content.

### 11.5 Python test and evaluation layout

Use Python tests as the executable source of truth, with scripts to run named suites in one command. A suggested layout is:

```text
backend/
├── scripts/
│   ├── run_feature_suite.py
│   ├── run_smoke.py
│   ├── run_ab_eval.py
│   └── run_model_benchmark.py
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── api/
│   ├── feature_flows/
│   ├── smoke/
│   └── evaluation/
└── evals/
    ├── datasets/
    ├── rubrics/
    └── baselines/
```

- **Unit tests:** deterministic domain logic, parsers, validators, chunking, ownership policies, artifact transformations, workflow transitions, and export structure. Mock external model and provider calls.
- **Integration/API tests:** real isolated PostgreSQL and pgvector, migrations, repositories, storage adapters, JWT/ownership enforcement, endpoint errors, and idempotency.
- **Feature-flow scripts:** `python scripts/run_feature_suite.py` orchestrates pytest/Playwright suites for complete journeys such as multi-source ingestion → artifact → citations → presentation/export, and attach/swap knowledge → cited chat. It creates isolated fixtures and emits one pass/fail report. The underlying tests stay independently runnable and debuggable.
- **Smoke tests:** `python scripts/run_smoke.py --base-url ...` checks readiness and a small authenticated critical path in local/preview environments: sign-in token validation, source/run creation, artifact read, and optionally export/share validation. Do not send real email in smoke tests; use a fake provider or sandbox.
- **A/B evaluation:** `python scripts/run_ab_eval.py --candidate A --candidate B --dataset ...` runs the same versioned cases with paired settings, repeats stochastic outputs, and emits per-case plus aggregate comparisons. Keep prompts, retrieval settings, and data fixed when comparing model versions.
- **Model benchmark:** `python scripts/run_model_benchmark.py --models ... --dataset ...` evaluates candidate model/pipeline combinations. Score fact coverage/correctness, claim support and citation locator correctness, unsupported-claim rate, abstention when evidence is absent, instruction/style adherence, schema validity, human rubric for readability/usefulness, latency, throughput, memory, and inference cost. Accuracy or MRR alone is insufficient. MRR/recall can still be retrieval diagnostics, not the overall product score.

The first benchmark should establish a human-reviewed baseline before numeric shipping thresholds are chosen. Freeze a held-out set, record all model and runtime versions, and never automatically train on every user's runs. Personalization uses explicit preferences; broader tuning uses consented examples and is promoted only after the benchmark shows a measurable improvement without citation or grounding regression.

### 11.6 Repository kickoff and Git history

The current repository is already established. At the time this plan was recorded, the checkout is on `feature/backend-foundation` at `504ff9b` (`feat: add database configuration, user profile model, initial migration, and health check endpoints`), tracking `origin/feature/backend-foundation`. The working tree contains uncommitted backend workspace/auth changes and documentation changes. Treat those as in-progress work; do not reset, clean, or overwrite them.

Recommended start sequence:

1. Review `git status`, `git diff`, and untracked files. Confirm which current changes belong together and preserve any work that should remain.
2. Finish and commit the existing backend foundation as a focused feature commit (for example, workspace membership/authorization and its migrations/tests), after reviewing the staged diff. Commit the documentation reconciliation separately as a docs commit. Do not stage everything blindly.
3. Run the relevant Python checks and migration validation for those changes, then push `feature/backend-foundation` and open a PR to `main` for review. Keep `main` history protected and linear through reviewed merges.
4. After the PR is merged, update local `main` with a fast-forward pull. Start each new implementation slice from `main` on a branch such as `feat/source-ingestion`, `feat/knowledge-chat`, or `feat/presentation-share`.
5. Keep each PR to one coherent feature or maintenance task. Use descriptive commits; do not mix secrets, generated artifacts, unrelated formatting, and product implementation in the same commit.
6. If the project later chooses squash merges, squash only the feature branch at merge time according to repository policy. Do not rewrite published `main` history to make it appear as a fresh repository.

This gives the repository a clean, reviewable history while preserving its useful existing commits and the work already in progress. A repository reset or deletion of branches is not required.

## 12. API surface

All private endpoints use `/api/v1`, require valid authentication, and apply server-side ownership checks.

| Area | Main operations |
| --- | --- |
| Sources | Create/list/read/delete source; upload file; start/retry ingestion. |
| Runs | Start a multi-source run; read progress; cancel; inspect errors. |
| Artifacts | List/read/edit/version/publish/archive artifacts. |
| Retrieval | Search chunks within an authorized source/artifact scope. |
| Chat | Create session; set attachments; send message; retrieve cited answers. |
| Presentations | Generate/read a website view; preview a version. |
| Shares | Create/revoke a 24-hour share link; resolve a valid public view. |
| Exports | Request/read Markdown, JSON, DOCX, or PDF export jobs. |
| Recipients and campaigns | Import CSV/XLSX; validate; create campaign; send and inspect delivery status. |
| Connectors | Connect/revoke providers and receive authorized inbound submissions. |

The formal OpenAPI document must later define exact payloads, structured errors, pagination, idempotency keys for expensive operations, and event/progress semantics.

## 13. Security, privacy, and reliability

- Never trust a client-provided owner or workspace identifier.
- Validate URLs against SSRF risks; validate uploads by size, type, and content handling policy.
- Store only hashed share tokens and enforce expiry/revocation server-side.
- Do not log raw transcripts, private artifacts, credentials, or access tokens.
- Keep provider credentials in deployment secret stores; never ship privileged credentials to extensions or browsers.
- Treat prompt injection in sources as untrusted content, not instructions for the system.
- Make destructive actions explicit and auditable.
- Preserve durable run state so a restart can report, retry, or resume safely.

## 14. Repository direction

Keep the current repository while the backend foundation is established. Do not perform a speculative monorepo migration. A future `apps/`, `packages/`, and `integrations/` layout becomes justified when an extension, shared contract/client library, or independently deployed application creates a real boundary.

Suggested near-term structure:

```text
PodFlow/
├── backend/                 # FastAPI application, domain, adapters, migrations, tests
├── frontend/                # Next.js dashboard and PWA
├── extension/               # Chrome extension when its API contract is ready
├── docs/                    # Master specification and supporting detailed documents
├── .github/workflows/
├── docker/
└── .agents/
```

## 15. Delivery roadmap and acceptance criteria

**Target schedule:** 6–8 weeks (approximately one and a half to two
months), with AI-assisted system design and development. This is a target
for a focused V2 core, not a promise that every future connector or
production-hardening item will fit. Re-estimate after Phase 0 and the POC;
if the full scope does not fit, keep the same quality gates and move
lower-priority connectors or polish to a follow-up release.

### Phase 0 — Audit and documentation

Consolidate current docs, inspect the existing YouTube-to-newsletter implementation, document what is real versus planned, and finalize the first domain/API contracts.

**Done when:** the master document is current, an implementation inventory exists, unresolved decisions are explicit, and the team can explain the end-to-end architecture without relying on assumptions.

### Phase 1 — Foundation and source pipeline

Implement authentication, ownership, migrations, health checks, source records, durable runs, YouTube/web/PDF ingestion, normalized documents, chunks, and retrieval evaluation.

**Done when:** an authorized user can ingest supported source types and retrieve cited passages with measured recall.

### Phase 2 — Artifacts and exports

Create automatic artifact generation, versioning, claim/evidence linkage, viewer, Markdown/JSON/DOCX/PDF exports, and basic evaluation.

**Done when:** a completed run reliably saves an inspectable, versioned artifact whose important claims link to evidence.

### Phase 3 — Presentation, sharing, and email

Build website views, 24-hour share links, CSV/XLSX recipient import, newsletter transformation, campaign review, and delivery records.

**Done when:** a user can safely share a polished artifact presentation and export or email a selected artifact version.

### Phase 4 — Scoped chat and clients

Build cited chat with attach/swap/multi-artifact scope, responsive PWA behavior, and the Chrome extension's submit/open-artifact flow.

**Done when:** a user can capture a webpage from the extension and ask evidence-backed questions over one or several selected knowledge artifacts.

### Phase 5 — Improvement loop and connectors

Introduce consented feedback, preference profiles, evaluation dashboards, controlled model/prompt releases, and the first prioritized third-party connector.

**Done when:** model changes are benchmarked before release, user preferences improve future outputs, and connector-originated artifacts appear in the same dashboard lifecycle.

## 16. Decisions still needed

1. The initial open-weight model family, hosting method, hardware budget, licensing requirements, and supported languages.
2. Whether artifacts belong directly to users initially or to workspaces from day one.
3. The exact supported document formats and file-size limits.
4. The first connector after the Chrome extension: Slack, Notion, or ClickUp.
5. Whether temporary website views are fully public or protected by an additional passcode/access rule.
6. Which user feedback may be stored and used for personalization or training, and for how long.
7. The visual component library after evaluation of accessibility, licensing, and maintenance.

## 17. Relationship to existing documents

This document supersedes conflicting high-level statements in earlier planning documents. The older files remain useful detailed input, especially for test strategy, deployment, data schemas, and the original POC. They must be reconciled before implementation begins, particularly where they describe extensions/connectors as purely future work or assume mandatory human review for every artifact.
