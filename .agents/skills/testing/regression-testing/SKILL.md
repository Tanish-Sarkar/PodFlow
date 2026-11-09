# Regression Testing

## Purpose

Select checks that protect existing behavior after a change, refactor, dependency upgrade, or bug fix.

## Procedure

1. Read the diff and identify changed modules, callers, data contracts, routes, and shared UI.
2. Map each changed boundary to existing tests. Add the failing case that reproduces a bug before or alongside its fix.
3. Run focused tests, then adjacent suites, then CI-equivalent gates if risk is broad. Backend: `uv run pytest` and `uv run ruff check .`; frontend: `bun run lint`, `bun run typecheck`, `bun run build`, and E2E for user-visible changes.
4. Include migration/auth/ownership regressions for data-boundary changes; responsive/accessibility/reduced-motion checks for shared page styling; metadata and robots/sitemap checks for SEO changes.
5. Do not rerun all categories automatically for a text-only change. Explain scope-based exclusions.

## Completion criteria

The original defect or behavior is covered; relevant nearby and high-risk flows pass; unrelated failures are distinguished from regressions. State exact test commands and any known test-environment limitation.
