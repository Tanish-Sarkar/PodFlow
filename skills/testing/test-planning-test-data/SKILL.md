# Test Planning and Test Data Management

## Purpose

Derive repeatable, risk-based tests from requirements and keep test data isolated, understandable, and safe.

## Procedure

1. Read the authoritative requirement and list user roles, assets, trust boundaries, state changes, error paths, and acceptance criteria.
2. Rank scenarios by impact, likelihood, exposure, and reversibility. Include normal flow, boundary/invalid input, authz, dependency failure, retry/idempotency, and regression where relevant.
3. Map scenarios to the cheapest layer that gives confidence: unit, integration, API, browser/E2E, performance, or security. Avoid duplicating the same assertion at every layer.
4. Give each fixture explicit setup/teardown and ownership. Use fake identities and synthetic source content; never copy user/private production data into tests without approval and a privacy-safe process.
5. Make AI eval data versioned and consent-safe. Record model/prompt/runtime and expected facts/evidence; do not place source text in logs or analytics by default.
6. Document unavailable environments and test gaps as backlog items. Revisit the plan when schema, threat model, or user journey changes.

## Current repository commands

Backend: `uv run pytest` from `backend/`; frontend: `bun run test:e2e` after `bun run build` from `frontend/`. The backend suite currently uses mocked sessions and has no checked-in DB integration fixture; the frontend suite covers the marketing page only.

## Completion

Every important acceptance criterion has a scenario, test layer, data source, and expected result. Fixtures are isolated and repeatable, and cleanup does not touch shared or production data.
