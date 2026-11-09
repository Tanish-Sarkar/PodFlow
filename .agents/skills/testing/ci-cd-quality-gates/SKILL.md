# CI/CD and Automated Quality Gates

## Purpose

Place reliable, risk-appropriate checks at commits, pull requests, merges, staging, and release boundaries; keep failure output actionable.

## Current pipeline

`.github/workflows/ci.yml` runs repository files/docs and tracked-secret checks, backend `uv sync --all-extras --locked`, Ruff, pytest, Alembic heads, frontend frozen Bun install, lint, typecheck, build, Playwright browser install and E2E. It has no deployment, Docker, dependency audit, model benchmark, or production smoke job. Hosted run status is not available in the audit.

## Recommended gate placement

- Local/commit: focused unit tests, lint/format, typecheck for touched language, secret-safe diff review.
- Pull request: deterministic unit + relevant integration/API tests, migrations, frontend build/E2E for UI, repository/docs checks; security/dependency checks once configured.
- Merge: required PR checks and review; do not bypass failed critical authorization or migration checks.
- Staging/release: migration plan, deployment smoke, authorization/share/email safety, performance guardrails and model evaluation for model/prompt changes.

## Design and failure handling

1. Keep checks deterministic and use locked dependencies, isolated test data, bounded retries, and artifact retention on failure.
2. Fail the job on missing tests or required docs, not on flaky external service assumptions; mock providers for unit tests and use explicit disposable services for integration.
3. Separate blocking quality gates from scheduled or opt-in expensive model/load runs. Publish versioned results.
4. When changing `.github/workflows/ci.yml`, test shell syntax and review branch/path filters, permissions, secrets scope, cache inputs, and cancellation behavior.
5. Preserve concise logs and redact credentials. Never put a production secret into workflow output.

## Completion

Each required gate has a clear owner, command, expected output, and failure effect. Report local validation separately from hosted CI results; do not claim an Actions job passed unless its run was observed.
