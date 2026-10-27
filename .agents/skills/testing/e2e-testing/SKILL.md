# End-to-End Testing

## Purpose and when to use

Validate a critical user journey across the real UI and relevant service boundaries. Use for release-critical workflows and a small number of high-value regression journeys.

## Current state

The only current E2E suite is a TypeScript Playwright suite for the public landing page (`frontend/e2e/marketing.spec.ts`). Sign-in, ingestion, artifacts, share links, exports, email, and chat do not exist yet; do not invent passing results for them.

## Procedure

1. Select a complete journey and its acceptance criteria; document account/fixture requirements and cleanup.
2. Use an isolated test environment and non-production account/data. Do not use live email recipients, real secret material, or production DB.
3. Keep browser scripts user-oriented and assert visible outcome plus persisted/API state where warranted.
4. Avoid fixed sleeps; wait on visible state or a bounded network condition. Capture trace/screenshot on failure without storing private source content.
5. For the present frontend suite, run `bun run build` then `bun run test:e2e` from `frontend/`; Windows can use `$env:PW_CHANNEL="msedge"; bun run test:e2e` when installed Chromium is absent.
6. Add Python Playwright only if a backend cross-service journey has a concrete need and the team approves that additional harness; the present browser toolchain is TypeScript Playwright.

## Failure and completion

Separate app assertion failures from missing browsers, unavailable services, and test data setup. A complete E2E result names browser/version, target environment, test count, and cleanup status. Do not call mock-only UI demos proof of backend integration.
