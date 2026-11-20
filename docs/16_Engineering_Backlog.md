# PodFlow Engineering Backlog

This is the prioritized next-work list derived from the repository evidence in [the audit](15_Repository_Audit.md). Effort is a relative estimate only: XS (hours), S (1–2 days), M (several days), L (one or more weeks). It is not a calendar commitment. Re-estimate after the first architecture decisions and vertical-slice measurements.

## Priority 0 — unblock safe product implementation

| ID | Work | Depends on | Effort | Impact | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| P0-1 | Decide authentication and ownership model: supported Supabase JWT signing modes, issuer/audience validation, key rotation, profile provisioning, single-user vs workspace ownership. Record ADR. | Product decision | S | Prevents insecure private endpoints and schema churn. | ADR states trust boundary and claims; signed-token tests cover valid, expired, wrong issuer/audience, wrong algorithm/key, missing subject, and key rotation; cross-owner access tests pass before any private artifact route ships. |
| P0-2 | Stabilize backend test environment and fixtures. | P0-1 can proceed in parallel | S | Makes every next backend change verifiable. | Tests collect/run on Windows dev setup or documented supported environment; fixture overrides are isolated; real PostgreSQL integration test target is explicit; CI test result is accessible. |
| P0-3 | Fix setup/documentation drift and enforce documentation/skill inventory in CI. | This audit | XS | Gives developers and agents one trustworthy entry point. | Fresh setup follows root/frontend READMEs without copying backend secrets into the frontend; CI checks authoritative docs and all catalogued skills. |
| P0-4 | Finalize first-release scope and canonical production host/environment plan. | Product decision; P0-1 | S | Bounds implementation and launch/SEO requirements. | Scope names one critical user journey, explicit deferrals, deployment targets, canonical URL, and acceptance criteria; production build has no missing-origin warning. |

## Priority 1 — source-to-artifact foundation

| ID | Work | Depends on | Effort | Impact | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| P1-1 | Define source, document, chunk, run, Knowledge Artifact, version, claim/evidence, and ownership schema; add migrations and retention rules. | P0-1, P0-4 | L | Establishes durable product core. | Migration upgrades a disposable PostgreSQL database; uniqueness/ownership constraints are tested; delete and retention behavior is defined; schema matches agreed API contracts. |
| P1-2 | Implement one vertical ingestion slice (recommended: one YouTube or web source first), with provenance and explicit processing status. | P1-1 | L | Proves source handling before widening input formats. | Authenticated request creates a run; supported content is extracted and normalized; source locator/provenance survives processing; failure/retry is durable and observable. |
| P1-3 | Build deterministic artifact generation and evidence validation behind a provider-neutral interface; select the first open-weight runtime only after benchmark/hardware/license review. | P1-1, representative ingestion data, model decision | L | Creates the core reusable output while keeping model choice measurable. | Versioned benchmark has representative inputs and expected facts/evidence; output schema validates; citations map to stored source passages; unsupported claims and latency are measured; model can be swapped without domain SDK types leaking. |
| P1-4 | Add API contracts for auth, source submission/status, artifacts, versions, and errors; generate/use OpenAPI types where stable. | P0-1, P1-1 | M | Gives dashboard and later clients stable boundaries. | Requests/responses, permissions, validation, pagination, idempotency, and error shapes are documented and contract-tested; only implemented endpoints are advertised as live. |
| P1-5 | Build authenticated artifact workspace UI and edit/review controls. | P1-2 through P1-4 | L | Makes the data useful to a user. | Sign-in and owner isolation work; processing state is visible; artifact and source citations render; routine generation saves without mandatory review; user can refine/regenerate with version history. |

## Priority 2 — presentations, export, sharing, delivery, chat

| ID | Work | Depends on | Effort | Impact | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| P2-1 | Create a constrained structured presentation schema and renderer for generated website views. | P1-3, P1-5 | M/L | Turns artifacts into the visual knowledge experience. | Model output is schema-validated data; UI renders only approved components; citations and source links remain; malformed or unsafe markup is rejected; preview is versioned. |
| P2-2 | Add Markdown and JSON exports, then DOCX/PDF with structure/source references. | P1-3 | M | Enables durable, portable knowledge exports. | Each export names its artifact version; headings, lists, links, and evidence survive; JSON follows a versioned schema; export errors and downloads are tested. |
| P2-3 | Add a 24-hour share link for a selected presentation. | P2-1, access-control design | M | Provides the intended friend-view workflow. | Random high-entropy token is stored hashed; every request checks expiry/revocation; link reveals only the selected presentation; expired/revoked links deny access; tests cover boundary times and no-store/cache behavior. |
| P2-4 | Add chat over one or more explicitly attached artifact/source scopes with citations and historical scope snapshots. | P1-3, P1-4 | L | Delivers the knowledge-base chat and memory-card swapping concept. | Retrieval enforces ownership and active scope; attach/swap/remove changes future retrieval only; answers cite source passages and say when evidence is insufficient; prior answers retain their scope/version. |
| P2-5 | Add newsletter transformation, CSV/XLSX recipient validation/review, and explicit email send. | P1-3, existing email provider decision | M/L | Keeps email as one optional delivery channel. | Invalid/duplicate recipients are reported before send; send requires confirmation; delivery result is auditable; import, generation, and delivery are separate modules. |

## Priority 3 — additional clients and integrations

| ID | Work | Depends on | Effort | Impact | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| P3-1 | Make the authenticated workspace responsive/installable as a PWA. | P1-5 | M | Improves mobile access using the same service. | Core workspace journey works at mobile widths; install/offline behavior is specified and tested; no duplicate backend processing path exists. |
| P3-2 | Implement Chrome extension as an authenticated API client. | P1-4, P1-5 | M | Captures browser sources without duplicating business logic. | Current URL/selected content can be submitted with consent; credentials use a reviewed auth flow; extension stores no privileged backend/model secret; result opens in the workspace. |
| P3-3 | Add third-party connectors, prioritizing one validated use case. | Stable API, P1/P2 core, threat model | L per integration | Extends distribution to collaboration/security systems. | Connector permission scopes, token storage/revocation, retries/idempotency, audit trail, and failure behavior are approved; resulting artifacts remain in the PodFlow workspace. SIEM/SOAR/EDR/XDR/legal/case tools are candidates, not committed first-release scope. |
| P3-4 | Add controlled improvement loop for summaries/extraction and model routing. | P1-3 benchmark, consent/data policy | M/L | Improves fit over repeat use without uncontrolled live training. | User preferences are inspectable/editable/deletable; feedback is consented and separated from private source data; candidate tuning is offline and benchmark-gated; promote/rollback criteria cover factuality, citations, preference adherence, latency, and resource cost. |

## Cross-cutting release gates

- Every private read/write has positive and negative authorization tests.
- Every migration is tested against a disposable database and the revision graph has one intended head.
- Every AI feature has a fixed evaluation set and regression comparison before its model/prompt changes ship.
- Public share, email send, and external account connection require a clear user action.
- Production release includes dependency/security checks, deployment smoke checks, observability, backup/restore, and a rollback plan.

Do not assign a reliable delivery date until P0 scope is settled and the first source-to-artifact slice has been measured.
