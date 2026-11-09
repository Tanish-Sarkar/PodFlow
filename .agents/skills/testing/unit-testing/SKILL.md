# Unit Testing

## Purpose and when to use

Verify one function, class, UI component, or domain rule without depending on a live database, network service, model, or browser. Use this for deterministic logic and bug fixes before considering broader tests.

## Repository tools

- Backend: pytest; put tests under `backend/tests/` near the layer being tested. Run `uv run pytest tests/unit -q` from `backend/`.
- Frontend: no dedicated unit-test runner is currently configured. Do not add a new framework for one test without checking scope; use a browser test for behavior that depends on DOM/browser semantics.

## Procedure

1. State the behavior and boundary under test. Keep each test focused on one outcome.
2. Cover normal input, boundary values, invalid input, and the failure path that matters.
3. Use explicit, small fixtures. Mock external I/O at the adapter boundary, not the code whose behavior is under test.
4. Keep time, randomness, environment, and model output fixed. Do not assert incidental implementation details.
5. Name tests `test_<behavior>_<condition>_<expected_result>` and assert the observable result.
6. Run the focused file, then the relevant layer suite: `uv run pytest tests/unit/path/test_module.py -q` and `uv run pytest tests/unit -q`.

## Coverage expectations

Do not set an arbitrary project-wide percentage without a policy. Cover every meaningful branch of critical validation, state-transition, and authorization logic; prioritize edge cases and regression conditions over line-count inflation. Report any uncovered high-risk branch explicitly.

## Failure handling and completion

If importing a module opens a database connection or loads a native dependency, report the import-time coupling and isolate it only if the change legitimately addresses that boundary. Do not silently monkeypatch application behavior to make a test green. Completion means deterministic focused tests pass, failure cases are represented, and any required broader checks are reported.
