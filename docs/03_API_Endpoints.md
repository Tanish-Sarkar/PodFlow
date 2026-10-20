# PodFlow --- API Endpoints

> **Status:** Endpoint inventory, not the final OpenAPI contract. The master specification defines the current product scope; exact request/response schemas remain to be designed.

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

## Health

-   `GET /health/live`
-   `GET /health/ready`

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
