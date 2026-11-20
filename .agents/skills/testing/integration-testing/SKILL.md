# Integration Testing

## Purpose and when to use

Verify a real boundary between modules, persistence, migrations, storage, or an external adapter. Use this when behavior depends on SQL, serialization, transaction state, provider request shape, or framework wiring.

## Current prerequisites

The repository has SQLAlchemy/Alembic and mocked pytest tests, but no checked-in disposable PostgreSQL service or integration-test marker. Do not run write tests against production or a developer's valuable database. Ask for/prepare an isolated test database as part of implementation planning; record when that prerequisite is absent.

## Procedure

1. Identify the boundary and which dependency is real versus stubbed. Prefer a disposable PostgreSQL database for repository and migration tests; mock only external providers that cannot be safely isolated.
2. Create uniquely scoped test rows and clean them in fixture teardown or transaction rollback.
3. Test successful round trips, constraint violations, transaction rollback, missing dependency, timeout/provider error, and idempotency where relevant.
4. Exercise Alembic against a clean database and verify expected tables/indexes/constraints. The existing `uv run alembic -c alembic.ini heads` checks graph shape only, not a database upgrade.
5. Run `uv run pytest tests/integration -q` only after such a suite and isolated connection are established; currently this directory/command is not part of the repository baseline.

## Safety and completion

Never use production credentials or destructive cleanup against shared data. Redact connection strings. A passing mocked unit test is not evidence of integration correctness. Report the database version/extensions, migration revision, isolation method, and exact command. Complete when integration assertions pass on disposable infrastructure and failure cleanup is demonstrated.
