# Repository Audit

## Mode and purpose

Read-only by default. Produce a repeatable, evidence-backed comparison of repository implementation against authoritative requirements. This skill does not authorize file changes, branch deletion, history rewriting, or destructive operations.

## Procedure

1. Record audit date, working directory, branch, commit, `git status --short --branch`, recent log, remotes (redact embedded credentials), and available local refs. Never reset/clean or change branches.
2. Inventory tracked and untracked files with `rg --files`/`git ls-files`; inspect root instructions, manifests/lockfiles, app entry points, routes, schemas/migrations, environment examples, tests, CI, deployment, docs, and relevant Git history.
3. Inspect source code rather than inferring behavior from README/planned endpoints. Classify each major capability as implemented and verified, implemented but unverified, partial, planned, missing, or broken.
4. Map important findings to file/line evidence, impact, severity, and a concrete remediation. Inspect authz/data tenancy, input validation, errors, dependency versions/config, test layers, accessibility/SEO/performance, CI/deployment, docs drift, and maintainability.
5. Run safe checks already supported by the repo when authorized: backend `uv run ruff check .`, `uv run pytest`, Alembic heads; frontend `bun run lint`, `bun run typecheck`, `bun run build`, and the documented browser test. Do not require external credentials or mutate production systems. Report blocked commands exactly.
6. Check GitHub/deployment only through actually available authenticated tools. If unavailable, state the limitation; do not imply that remote PRs, issues, or Actions were inspected.
7. Compare results to product docs and record contradictions, assumptions, open decisions, and prioritized backlog dependencies/acceptance criteria.
8. Before delivering, recheck worktree status and ensure the report distinguishes observations from recommendations.

## Report format

Include scope/date/commit; summary; architecture and file map; feature-status matrix; stack/config; data/API inventory; security and quality findings with evidence/severity/remediation; docs contradictions; exact commands/results; inaccessible systems; prioritized next steps; unresolved decisions.

## Completion criteria

No check is represented as passed unless it ran successfully. No planned behavior is described as implemented without source evidence. The audit is repeatable and leaves files, branches, and Git history unchanged.
