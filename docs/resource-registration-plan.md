# Dashboard resource registration

**Status:** Approved implementation direction; implementation can begin. This file captures the agreed scope and API/database design. It does not claim the behavior is implemented.

## Effort score

**8/10 — substantial, bounded feature.** The dashboard form, batch persistence, and uniqueness migration are moderate work. The required live availability check accounts for most of the effort because it makes the API an outbound-network client and must be protected against SSRF, redirects, DNS rebinding, timeouts, and partial failures.

Estimated implementation slices:

| Slice | Effort | Notes |
| --- | --- | --- |
| Shared parsing, normalization, batch API, and result models | 2/10 | Small, contained backend change. |
| Same-owner unique index and migration verification | 2/10 | Requires a disposable PostgreSQL integration environment and a duplicate-data preflight. |
| Safe bounded availability probe | 4/10 | Requires a maintained HTTP client, controlled DNS/connection policy, redirect handling, and focused tests. |
| Dashboard wiring and browser coverage | 2/10 | Blocked only by the separate real-auth session provider. |

The scores overlap because the pieces are implemented and tested together. If availability probing is deferred, the registration-only version is approximately **5/10**.

## Repository facts

- The dashboard has a multiline URL panel, but validation and the resource list are currently UI-only. It combines three illustrative resource fixtures with in-memory session entries. The form currently accepts any URL scheme recognized by the browser parser and logs raw submitted URLs.
- The backend has a `resources` SQLAlchemy model and migration, `ResourceCreate` / `ResourceRead` schemas, and authenticated single-resource create, list, get, and delete routes in `backend/src/podflow/api/v1/workflows.py`.
- The resource table has an `auth.users` owner foreign key, URL/upload checks, and an owner/created index. It has no uniqueness rule for URLs. No registration fetch is implemented.
- Backend tests cover resource schema constraints and owner-scoped not-found behavior, but not resource creation or batch registration end to end.
- Private API auth derives the owner from a verified token and uses owner filters/RLS context. The dashboard's current developer-preview session is explicitly not authentication and cannot call private APIs.
- `docs/19_Database_Schema_and_Migrations.md` says the configured Supabase database has not been migrated or inspected successfully. The current live schema must not be assumed from checked-in migrations alone.

## User flow

1. Load the current user's resources from `GET /api/v1/resources`; do not present sample fixtures as persisted user resources.
2. The user pastes one URL per line into the existing dashboard panel and submits once.
3. The API splits, validates, and normalizes each nonblank line, then performs a bounded availability probe before attempting to register that URL.
4. Return an outcome for every nonblank input line. The dashboard displays created, already registered, duplicate-in-paste, unavailable, or invalid results and refreshes its persisted list.

Registration remains synchronous. The probe is not scraping or extraction: it must not retain page bodies, parse content, create versions, or start background processing.

## Optimized registration sequence

Process a batch in this order:

1. Split, trim, shape-check, parse, and normalize all nonblank lines.
2. Mark normalized duplicates within the same paste without probing them.
3. Fetch the caller's matching normalized URLs in one owner-scoped query; mark these as `already_exists` without probing them.
4. Probe only remaining candidate URLs, with bounded concurrency. A recommended initial limit is 25 input URLs and five simultaneous probes.
5. Insert reachable candidates with an atomic conflict-safe insert. If a concurrent request wins, read the caller's existing resource and return `already_exists`.
6. Reassemble results in the original line order.

This keeps duplicate submits fast, avoids probing resources the caller already owns, limits outbound connections, and still produces partial-success results from one request.

## Parsing, validation, normalization

- The request contains raw multiline text; the server is responsible for line splitting. Split on line boundaries, trim surrounding whitespace, and ignore blank lines. Do not split on commas or accept multiple URLs on one line.
- Use a small, anchored regular expression as the initial shape check for absolute `http://` or `https://` URLs with a hostname. Follow it with standard URL parsing for hostname, port, and probe destination safety. The regex is usability/format validation, not an SSRF control.
- Reject credentials in URLs, malformed ports, control characters, embedded whitespace, non-HTTP(S) schemes, and URL lines longer than 2,048 characters.
- Bound the request body (recommended 64 KiB) and number of nonblank lines (recommended 25). Reject an oversized request before performing any probes or inserts. The smaller line limit keeps the synchronous availability check responsive and limits egress abuse.
- Normalize conservatively: lowercase scheme and hostname, use the parser's IDNA hostname form, remove the default port, canonicalize an empty path to `/`, and drop the fragment. Preserve path case, trailing slash, query order/values, nondefault port, and percent encoding. Use this same normalization in both the batch and existing single-resource endpoint.

## Availability probe

- Probe each valid, nonduplicate URL before inserting it. Use a bounded HTTP `GET` rather than relying on `HEAD`, which many sites do not support. Do not read or store the response body; stop after response headers or a very small bounded read if the client requires one.
- Apply short connect/read/overall timeouts (recommended three seconds overall per URL), a small response-header/body limit, and a small redirect limit (recommended three). Treat a final 2xx response as reachable. Treat 4xx/5xx, timeout, DNS/TLS failure, and redirect-policy failure as unavailable for registration and return a row-level reason. Do not treat a mere redirect response as available until its destination has been validated and reached.
- Disable ambient proxy/environment settings and do not forward cookies, authorization, or browser headers. Do not log full URLs; they can contain sensitive query values.
- Probe before insertion, so an unavailable URL creates no resource. This is not a content processing pipeline and must not persist fetched content or response metadata.

## Duplicate policy

- In one paste, the first valid occurrence is probed/registered. Later equivalent normalized URLs return `duplicate_in_batch` and reference the first input line.
- If the same owner already has the normalized URL, return `already_exists` with that owner's resource. Never create another row.
- If another owner has the URL, create a separate row for the caller. Never query globally or disclose another user's existence.
- Enforce same-owner uniqueness in PostgreSQL to close the concurrent-request race. On a conflict, return the caller's existing row.

## API contract

Add `POST /api/v1/resources/batch`.

Request:

```json
{
  "text": "https://example.com/a\nhttps://example.com/b"
}
```

Return `200` for a completed batch with one ordered result per nonblank line. Each result includes `line_number`, normalized URL where parseable, a status (`created`, `already_exists`, `duplicate_in_batch`, `unavailable`, or `invalid`), and either a `ResourceRead`/existing resource reference or a row error code. Return `422` for malformed request envelopes, blank-only input, or exceeded body/line limits; do not partially process such envelopes. Row-level invalid or unavailable URLs do not block valid rows. Use `401` for missing/invalid credentials. Continue returning `404` for individual resource IDs outside the caller's ownership.

The existing `POST /api/v1/resources` must share normalization, availability probe, and duplicate handling so it cannot bypass the batch invariant. It remains persistence-only for metadata; URL registration does not trigger scraping.

## Database behavior

The existing columns are sufficient. Add an ORM-declared partial unique index on `(owner_id, submitted_url)` for URL resources, where `kind = 'url'`. Add an incremental migration because no current constraint prevents same-owner duplicates under concurrency. The migration must detect existing duplicate pairs and stop with a clear error; never delete or merge rows automatically. Do not add a normalized URL column, queue, or new table for this slice.

The migration must be reviewed against the actual configured database state before application. The repository does not establish that Supabase has the checked-in schema applied.

## Frontend state

Use `idle`, `submitting`, `complete`, and request-level `error` states, with per-line outcomes. Keep the pasted text on request-level failure, clear it after a completed response, prevent duplicate submits while pending, and announce progress/results accessibly. Refresh the resource list from the API. Do not make authenticated calls using the existing developer-preview session; use the real session/token provider from the separate auth work. Remove raw URLs from logs.

## Security

- The verified JWT subject is the only source of `owner_id`; continue explicit owner filters and RLS.
- Registration-time fetching creates an SSRF boundary. Before every outbound request and every redirect, resolve and reject loopback, private, link-local, reserved, multicast, unspecified, and cloud metadata destinations. Defend against DNS rebinding by using an egress client or transport that connects only to the validated address while preserving the original hostname for TLS/SNI; a normal URL regex or an HTTP client's default DNS lookup cannot provide this guarantee. Allow only HTTP(S) on ports 80 and 443. Never forward user credentials/cookies. A redirect must be revalidated from scratch.
- Enforce time, redirect, header, and response-size limits. Do not log full URLs or response content.
- Client-side validation is only for feedback. All parsing, ownership, uniqueness, and fetch safety checks are server-side.

## Test plan

- Backend unit/schema tests: regex and parser boundaries, malformed ports, credentials, schemes, normalization invariants, size limits, line numbering, result ordering, and the optimized duplicate-before-probe sequence.
- Probe tests with mocked DNS/transport: success, 4xx/5xx, timeout, TLS/DNS failure, redirect limit, redirect to blocked address, credentials not forwarded, and no body persistence.
- API tests: one owner-scoped existing-URL lookup per batch, partial row outcomes, same-paste and existing-owner duplicates that make no probe, another-owner independence, single endpoint parity, missing/invalid auth, and owner-scoped reads.
- Disposable local PostgreSQL integration: migration/index behavior, concurrent same-owner registration, and RLS isolation. Do not target Supabase for test cleanup.
- Frontend tests: pending/error/retry behavior, per-line statuses, persisted list refresh, accessibility announcements, no raw URL logging, and no private API calls in developer preview.

## Acceptance criteria

- A multiline paste yields one outcome per nonblank line and registers each accepted URL as an individual resource.
- URLs that fail format validation or the bounded reachability probe are not registered; valid available URLs in the same batch still can be.
- Same-owner duplicates are idempotent within and across requests, including concurrent requests. Other owners' copies remain independent and undisclosed.
- Redirects and DNS resolution cannot bypass SSRF controls; no page content is retained or extracted.
- The dashboard displays persisted resources and clear row-level outcomes, while real authentication remains supplied by the separate auth work.
- No queues, scraping, extraction, versions, embeddings, runs, artifacts, uploads, or YouTube ingestion are introduced.

## Implementation file plan

- `backend/src/podflow/schemas/database.py`: batch request/response schemas and limits.
- `backend/src/podflow/api/v1/workflows.py`: shared normalization/registration behavior and batch endpoint.
- `backend/src/podflow/security/resource_probe.py` (new): bounded SSRF-safe reachability probe.
- `backend/src/podflow/persistence/db/models/knowledge.py`: partial unique index metadata.
- `backend/alembic/versions/<new revision>.py`: duplicate-preflight and partial unique index migration.
- `backend/pyproject.toml` and `backend/uv.lock`: add and lock a maintained async HTTP client only if the implementation selects one; no dependency is added by this plan file.
- `backend/tests/unit/persistence/test_knowledge_schema.py`, `backend/tests/api/v1/test_workflows_contract.py`, `backend/tests/api/v1/test_workflows_behavior.py`, and new probe-focused tests: schema, API, probe, and registration coverage.
- `backend/tests/integration/test_postgres_rls.py`: database uniqueness and isolation coverage.
- `frontend/src/components/dashboard/overview.tsx`, `frontend/src/lib/dashboard-fixtures.ts`, and new `frontend/src/lib/resources-api.ts`: authenticated submission, persisted list, and outcome states.
- `frontend/e2e/` (new dashboard coverage): exercise UI result states with controlled API responses.
