# Code-Writing Standards

Apply these rules to every implementation task. They supplement `.agents/rules/rules_of_code.md` and the task's applicable `AGENTS.md`.

## Before editing

1. Read the user request, authoritative requirement, nearby implementation, repository rules, and relevant docs.
2. Confirm current Git status. Preserve unrelated user work. Ask only when a decision blocks safe correctness; otherwise use the simplest documented convention.
3. State the acceptance criteria and smallest set of files needed. Do not expand into unrelated refactoring.

## Implementation rules

- Write the minimum code needed; prefer conventional, readable solutions over abstraction for hypothetical reuse.
- Follow existing architecture and dependency direction. Reuse current tools/dependencies before adding packages.
- Keep modules cohesive with stable interfaces; avoid duplicate business rules.
- Validate untrusted input at boundaries, handle errors explicitly, and enforce authorization in backend data operations.
- Never hardcode secrets or environment-specific endpoints. Avoid logging tokens, private source content, or credentials.
- Consider security, privacy, accessibility, performance, edge cases, deterministic behavior, and rollback when relevant.
- Preserve existing behavior unless the requirement explicitly changes it. Never overwrite unrelated files or perform destructive Git operations without explicit authorization.

## Tests and documentation

- Add/update tests for changed behavior. Choose test layers by risk; do not add a framework or run unrelated suites without need.
- Run relevant tests, lint/type checks, migrations, and builds available in the repository. Report blocked checks and exact reasons; never claim success without output.
- Update product/API/schema/setup/architecture docs when behavior or procedures change. Distinguish implemented from planned features.

## Completion report

State what changed and why; list files; report exact validation commands/results; identify outstanding issues/risks and next steps. Review the final diff and Git status before concluding.
