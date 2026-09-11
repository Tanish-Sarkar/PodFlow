# PodFlow --- API Endpoints

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
-   `POST /artifacts/{artifact_id}/share` --- temporary public link.
-   `DELETE /artifacts/{artifact_id}/share` --- revoke sharing.

## Exports

-   `POST /artifacts/{artifact_id}/exports` --- Markdown/PDF/DOCX export
    job.
-   `GET /exports/{export_id}` --- export status/location.

## Integrations

-   `GET /integrations` --- connected integrations.
-   `POST /integrations/gmail/connect` --- begin Gmail authorization.
-   `POST /integrations/gmail/send` --- send artifact/export.

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
