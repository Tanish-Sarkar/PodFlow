# PodFlow --- Testing Rules and Test Plan

> **Status:** Supporting test strategy. Add feature-specific acceptance tests as the API contract is finalized.

> **Current implementation:** Backend tests use pytest and FastAPI `TestClient`; the current public-page browser suite is TypeScript Playwright with axe-core in `frontend/e2e/marketing.spec.ts`. The broader journeys below are planned until product routes exist. Current test results and environment limitations are in [the repository audit](15_Repository_Audit.md).

## Philosophy

AI output is probabilistic; the surrounding system should be
deterministic wherever possible.

## Test layers

### Unit

Domain logic, parsers, URL validation, chunking, schema validation,
workflow transitions and authorization.

### Integration

SQLAlchemy repositories, Alembic migrations, pgvector queries,
transactions and storage adapters.

### API

Auth failures, ownership isolation, validation, pagination, idempotency
and dependency failures.

### Workflow

Happy path, approval, edit, rejection/retry, cancellation, provider
failure and resume after interruption.

Routine artifact runs must also test automatic persistence without a
human-review checkpoint. Delivery and sharing workflows must test their
explicit confirmation requirements.

### E2E

Use Playwright for critical end-to-end journeys. The implemented suite currently covers only the public landing page; sign-in, source creation, workflow run, artifact view, and share/export remain future coverage until those features exist. Use the frontend's TypeScript Playwright stack for browser journeys unless the repository later adopts one shared Python browser harness.

Also cover multi-source submission, presentation preview, expired share
links, recipient-file validation, and chat attachment swap/add/remove.

### AI evaluation

Maintain a benchmark with sources, questions, expected facts/evidence
and known failure cases.

Track retrieval recall@k, citation correctness, groundedness,
structured-output validity, latency, cost and human acceptance.

Evaluate presentation schema validity and visual component rendering.
For every model/prompt/fine-tuning candidate, compare against a fixed
benchmark and block releases that regress citation correctness or
unsupported-claim rate.

The model-selection benchmark must compare candidates on the same
versioned set of multi-source tasks, expected facts/evidence, difficult
questions, output schemas, and user preference examples. Score factual
coverage, citation accuracy, unsupported claims, instruction/preference
adherence, human-rated artifact usefulness, latency, memory/hardware
needs, cost, and license constraints. Repeat stochastic cases and save
model/runtime settings with results. Establish numeric pass thresholds
from a reviewed baseline before selecting a default model; do not choose
by size or reputation alone.

## Rules

-   External providers are mocked in unit tests.
-   Database is real in repository integration tests.
-   Every bug fix adds a regression test where practical.
-   Every endpoint tests happy path, invalid input, unauthenticated and
    unauthorized behavior.
-   Every migration is validated.
-   Critical authorization/security paths should have very high
    coverage.
-   Coverage is a signal, not the goal.

## CI gates

Target gates include lint/formatting, typecheck, Python and integration
tests, frontend lint/typecheck/build, migration validation, deployment
smoke checks, and secret/dependency scans as the matching tools and
environments are added. The current workflow does not yet run a Docker
build, dependency vulnerability scan, real-database integration suite,
or deployment smoke test; see the [repository audit](15_Repository_Audit.md)
for the exact configured CI steps.

## Naming

`test_<behavior>_<condition>_<expected_result>`
