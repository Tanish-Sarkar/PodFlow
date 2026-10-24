# PodFlow Engineering Skills

This directory contains focused, reusable procedures for AI agents and engineers. Start with [the onboarding guide](../docs/17_AI_Agent_Onboarding.md), then invoke only the skills that fit the change. The skills describe procedures; they do not imply that a feature or test tool already exists.

## Skills

| Skill | Use when | Location |
| --- | --- | --- |
| Unit testing | Testing a function, component, parser, or module in isolation. | [unit-testing](testing/unit-testing/SKILL.md) |
| Integration testing | Testing module/service/database boundaries. | [integration-testing](testing/integration-testing/SKILL.md) |
| Functional testing | Checking a feature against user-facing acceptance criteria. | [functional-testing](testing/functional-testing/SKILL.md) |
| E2E testing | Checking an end-to-end user journey across UI and backend. | [e2e-testing](testing/e2e-testing/SKILL.md) |
| Browser and UI testing | Checking rendering, navigation, responsiveness, interaction, and browser behavior. | [browser-ui-testing](testing/browser-ui-testing/SKILL.md) |
| Smoke testing | Quickly deciding whether a build/deployment is usable for deeper testing. | [smoke-testing](testing/smoke-testing/SKILL.md) |
| Regression testing | Selecting existing checks after a change or upgrade. | [regression-testing](testing/regression-testing/SKILL.md) |
| API testing | Checking endpoint schemas, status/error behavior, and access boundaries. | [api-testing](testing/api-testing/SKILL.md) |
| Performance and load testing | Measuring latency, throughput, resource use, and regressions. | [performance-load-testing](testing/performance-load-testing/SKILL.md) |
| Security testing | Reviewing auth, authorization, input boundaries, dependencies, and secrets safely. | [security-testing](testing/security-testing/SKILL.md) |
| Accessibility testing | Checking keyboard access, semantics, focus, contrast, and assistive behavior. | [accessibility-testing](testing/accessibility-testing/SKILL.md) |
| A/B and experiment testing | Validating experiment assignment/measurement and separately analyzing outcomes. | [ab-experiment-testing](testing/ab-experiment-testing/SKILL.md) |
| Visual regression testing | Comparing stable screenshots for unintended visual changes. | [visual-regression-testing](testing/visual-regression-testing/SKILL.md) |
| CI/CD quality gates | Deciding which deterministic checks block commits, PRs, and releases. | [ci-cd-quality-gates](testing/ci-cd-quality-gates/SKILL.md) |
| Test planning and data | Turning requirements/risk into scenarios and isolated, maintainable data. | [test-planning-test-data](testing/test-planning-test-data/SKILL.md) |
| Repository audit | Producing a repeatable, read-only, evidence-backed repository report. | [repository-audit](engineering/repository-audit/SKILL.md) |
| Code-writing standards | Applying the project's required implementation/change discipline. | [code-writing-standards](engineering/code-writing-standards/SKILL.md) |

## How they work together

1. Read `docs/17_AI_Agent_Onboarding.md` and the authoritative product/implementation documents.
2. For broad or unclear state, run the read-only repository audit skill.
3. Convert the agreed requirement into observable acceptance criteria and risk-based test cases.
4. Apply code-writing standards before editing.
5. Choose relevant test skills; do not run every test category for every small change.
6. Run the applicable local checks and CI gates. Report blocked checks as blocked, never as passed.
7. Update implementation status and user/developer instructions when behavior or setup changes.
8. Review the diff, links, and Git state; report changed files, exact checks, remaining risks, and next steps.

## Repository command baseline

From `backend/`: `uv run ruff check .`, `uv run pytest`, and `uv run alembic -c alembic.ini heads` (after `uv sync --all-extras --locked`).

From `frontend/`: `bun run lint`, `bun run typecheck`, `bun run build`, and `bun run test:e2e` (build first; install the Playwright browser once). On Windows, the checked-in Playwright configuration supports installed Edge through `$env:PW_CHANNEL="msedge"; bun run test:e2e`.

No model benchmark harness, database container, load-test runner, visual-baseline service, deployment smoke environment, or production deployment is currently configured. Skills for those areas provide a safe method and must call out the missing prerequisite instead of claiming a command exists.
