# Functional Testing

## Purpose and when to use

Validate an implemented feature against product outcomes and acceptance criteria. Use when a user-visible capability crosses more than one module but is narrower than a full application journey.

## Procedure

1. Identify the authoritative requirement and mark whether it is target scope or currently implemented. Do not test a landing-page mock as if it were the real feature.
2. Convert each acceptance criterion into observable input, action, result, and evidence.
3. Cover the main path, validation/boundary cases, empty state, permission failure, dependency failure, retry, and relevant persistence.
4. Use API/client tests or browser tests based on the interface. Keep stable business rules in deterministic tests; keep only representative scenarios at the full-stack level.
5. Record test data and expected state transitions. Avoid asserting exact model wording unless the requirement is structured output.
6. Run focused tests first, then the feature's regression set. Current available commands are `uv run pytest` (backend) and `bun run test:e2e` (frontend, after build).

## Completion criteria

Every agreed criterion maps to a passing test or a documented reason it cannot yet be automated. Report unsupported requirements as gaps, not failures of nonexistent implementation. Capture the exact command and any environment limitation.
