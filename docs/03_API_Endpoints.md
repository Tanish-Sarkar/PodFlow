# PodFlow --- API Endpoints

## Implemented routes

All routes below use `/api/v1`. Private routes require a verified Supabase asymmetric JWT and derive the owner from its UUID `sub`. Queries also carry explicit owner filters. Response models are Pydantic v2 models. A resource or artifact missing from the caller's scope returns 404.

| Method and path | Purpose | Auth | Request → response | Ownership boundary | Status |
| --- | --- | --- | --- | --- | --- |
| `GET /auth/me` | Bootstrap profile idempotently and return it | JWT | none → `ProfileRead` | verified JWT subject | Implemented; requires reviewed/applied profile INSERT grant migration |
| `POST /resources` | Register URL metadata | JWT | `ResourceCreate` → `ResourceRead` | JWT owner | Persistence-only; upload returns 501 |
| `GET /resources` | Paginated resource metadata | JWT | `limit`, `offset` → `ResourceRead[]` | owner filter | Persistence-only |
| `GET /resources/{id}` | Read resource metadata | JWT | none → `ResourceRead` | owner filter | Persistence-only |
| `DELETE /resources/{id}` | Delete owned resource metadata | JWT | none → 204 | owner filter | Persistence-only |
| `GET /artifacts` | Paginated artifacts with latest version | JWT | `limit`, `offset` → `ArtifactRead[]` | owner filter | Persistence-only |
| `POST /artifacts` | Create manual artifact and version 1 | JWT | `ArtifactCreate` → `ArtifactRead` | JWT owner | Persistence-only JSONB write |
| `GET /artifacts/{id}` | Read artifact and latest version | JWT | none → `ArtifactRead` | owner filter | Persistence-only |
| `GET /artifacts/{id}/versions` | List immutable versions | JWT | none → `ArtifactVersionRead[]` | owner filter | Persistence-only |
| `POST /artifacts/{id}/versions` | Add next immutable version | JWT | `ArtifactVersionCreate` → `ArtifactVersionRead` | owner filter | Persistence-only; originating run gives 501 |
| `GET /artifacts/{id}/versions/{version_id}` | Read exact version | JWT | none → `ArtifactVersionRead` | owner filter | Persistence-only |
| `POST /conversations` | Create conversation with owned artifact versions | JWT | `ConversationCreate` → `ConversationRead` | JWT owner and version ownership | Persistence-only |
| `GET /conversations` | Paginated conversation summaries | JWT | `limit`, `offset` → `ConversationRead[]` | owner filter | Persistence-only |
| `GET /conversations/{id}` | Read attachments and messages | JWT | none → `ConversationRead` | owner filter | Persistence-only |
| `PUT /conversations/{id}/attachments` | Replace artifact-version scope; empty list detaches all | JWT | `ConversationAttachmentsUpdate` → `ConversationRead` | owner + version ownership | Persistence-only; resource-only attachments are unsupported |
| `POST /conversations/{id}/messages` | Persist user turn and artifact-version scope | JWT | `ChatMessageCreate` → `ChatMessageRead` | owner filter | Persistence-only; no assistant response |
| `POST /presentations` | Persist caller-supplied snapshot for owned version | JWT | `PresentationCreate` → `PresentationRead` | JWT owner + version ownership | Persistence-only; no renderer |
| `GET /presentations/{id}` | Read owned snapshot | JWT | none → `PresentationRead` | owner filter | Persistence-only |
| `POST /presentations/{id}/shares` | Issue bearer link, fixed 24-hour TTL | JWT | none → `PresentationShareIssued` | presentation owner | Implemented; SHA-256 token hash stored |
| `DELETE /presentations/{id}/shares/{share_id}` | Revoke share | JWT | none → 204 | presentation owner | Implemented |
| `GET /shares/{token}` | Resolve current share snapshot | None | token → snapshot only | hash, revocation and expiry checked in DB function per request | Implemented; `no-store` headers and access-log token redaction |
| `GET /health/live` | Liveness check | None | none → `HealthResponse` | n/a | Implemented |
| `GET /health/ready` | Database readiness check | None | none → `HealthResponse` | n/a | Implemented |

Processing run creation/status, retrieval, assistant answers/citations, Storage uploads, generated presentations, exports, newsletters, and integrations are deferred: the repository has no corresponding worker, retrieval/LLM, Storage, renderer, or exporter service. These routes must not be interpreted as operational. Vector dimensions and retrieval remain undecided.

`DATABASE_URL` is the restricted `podflow_app` runtime login; `ALEMBIC_DATABASE_URL` is migration-only and is not part of FastAPI `Settings`. A forward migration validates the runtime login's role flags/table ownership and grants membership in `podflow_runtime`; API transactions then switch role and set the verified subject transaction-locally. A preceding additive migration grants profile INSERT and conversation-attachment DELETE. Neither migration has been applied to Supabase. Shares use a fixed 24-hour TTL; every resolution returns only the snapshot and has browser/proxy/CDN no-store headers. Uvicorn access logs redact the bearer token path segment. Other infrastructure access logs must independently be configured to redact the `/api/v1/shares/{token}` segment.

## Future endpoint plan (not implemented)

The following items preserve the earlier roadmap. They are planned contracts only; they are not present in the current OpenAPI schema and must not be treated as operational.

Base path: `/api/v1`

## Auth

-   `GET /auth/me` --- current authenticated profile.
-   `POST /auth/logout` --- optional server-side session hook.

Supabase Auth handles authentication. Frontend sends the access token to
FastAPI.

## Sources

-   `POST /sources` --- register a source.
-   `GET /sources` --- list sources with pagination/filtering.
-   `GET /sources/{source_id}` --- source metadata/status.
-   `POST /sources/{source_id}/ingest` --- start/retry ingestion.
-   `DELETE /sources/{source_id}` --- delete owned source and derived
    data.

## Retrieval

-   `POST /retrieval/search` --- search indexed knowledge and return
    chunks plus provenance.

## Workflows

-   `POST /workflows/runs` --- start workflow.
-   `GET /workflows/runs/{run_id}` --- status/progress.
-   `POST /workflows/runs/{run_id}/resume` --- resume after human
    review.
-   `POST /workflows/runs/{run_id}/cancel` --- cancel run.

Runs accept a collection of authorized source references and/or uploaded
resources, rather than assuming a single source.

## Artifacts

-   `GET /artifacts` --- list with status/source/tag/favorite/archive
    filters.
-   `POST /artifacts` --- manual artifact creation if supported.
-   `GET /artifacts/{artifact_id}` --- latest version.
-   `GET /artifacts/{artifact_id}/versions` --- version history.
-   `GET /artifacts/{artifact_id}/versions/{version_id}` --- specific
    version.
-   `PATCH /artifacts/{artifact_id}` --- edit.
-   `POST /artifacts/{artifact_id}/publish` --- publish/finalize.

## Chat

-   `POST /chats` --- create a chat session with artifact/source attachments.
-   `PATCH /chats/{chat_id}/attachments` --- attach, remove, or swap active knowledge.
-   `POST /chats/{chat_id}/messages` --- produce a cited answer from the active scope.
-   `GET /chats/{chat_id}` --- chat history and attachment state.

## Presentations and shares

-   `POST /artifacts/{artifact_id}/presentations` --- generate a structured website view.
-   `GET /presentations/{presentation_id}` --- authenticated preview/read.
-   `POST /presentations/{presentation_id}/share` --- create a 24-hour public link.
-   `DELETE /presentations/{presentation_id}/share` --- revoke sharing.

## Exports

-   `POST /artifacts/{artifact_id}/exports` --- Markdown/JSON/PDF/DOCX export
    job.
-   `GET /exports/{export_id}` --- export status/location.

## Integrations

-   `GET /integrations` --- connected integrations.
-   `POST /integrations/gmail/connect` --- begin Gmail authorization.
-   `POST /integrations/gmail/send` --- send artifact/export.

## Recipients and campaigns

-   `POST /recipient-lists/imports` --- import a CSV/XLSX list and validate rows.
-   `GET /recipient-lists/{list_id}` --- review accepted, invalid, and duplicate recipients.
-   `POST /campaigns` --- prepare a newsletter delivery from an artifact version.
-   `POST /campaigns/{campaign_id}/send` --- explicitly send a reviewed campaign.

## API rules

1.  Private routes require authentication.
2.  Every query is scoped to authenticated ownership.
3.  Never trust client-supplied `owner_id`.
4.  Use 401 for authentication failures and 403 for
    authenticated-but-forbidden operations.
5.  Paginate collections.
6.  Use idempotency for expensive retriable creation/trigger operations.
7.  Never return provider secrets.
8.  OpenAPI is the contract.
