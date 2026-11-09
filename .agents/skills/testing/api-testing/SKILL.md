# API Testing

## Purpose

Verify endpoint contracts, validation, authentication, authorization, error behavior, and safe data boundaries.

## Current state and tools

FastAPI currently exposes only `/api/v1/health/live` and `/api/v1/health/ready`; auth is a dependency scaffold not wired into product routes. Use pytest and FastAPI `TestClient` under `backend/tests/`. Current OpenAPI paths come from the app, while `docs/03_API_Endpoints.md` is a proposal.

## Procedure

1. For each implemented endpoint, test method/path, request schema, success response schema, status, headers, and invalid/missing fields.
2. For private routes, cover no token, malformed/expired/wrong-audience token, valid identity, unknown profile, and cross-owner read/write. Verify authorization at the data query boundary, not only UI state.
3. Test consistent 4xx/5xx error shapes, pagination/idempotency where specified, and dependency failure behavior. Keep secrets out of assertions and logs.
4. Use real signed tokens for cryptographic verification tests; mocking `verify_jwt` checks dependency wiring only.
5. Run the focused test under `backend/` with `uv run pytest tests/api -q`; inspect generated OpenAPI after route/schema changes.

## Completion

Each implemented contract has success, validation, auth/authz, and failure coverage relevant to its risk. Report whether DB interactions were mocked or real. Do not mark proposed endpoints as tested.
