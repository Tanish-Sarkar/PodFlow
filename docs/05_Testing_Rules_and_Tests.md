# PodFlow --- Testing Rules and Test Plan

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

### E2E

Playwright tests for sign-in, source creation, workflow run,
review/edit, artifact view and share/export.

### AI evaluation

Maintain a benchmark with sources, questions, expected facts/evidence
and known failure cases.

Track retrieval recall@k, citation correctness, groundedness,
structured-output validity, latency, cost and human acceptance.

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

Ruff/formatting, typecheck, Python tests, integration tests, frontend
lint/typecheck/build, migration validation, Docker build and secret
scan.

## Naming

`test_<behavior>_<condition>_<expected_result>`
