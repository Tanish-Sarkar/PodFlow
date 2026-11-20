---
name: git-workflow-and-versioning
description: Structures git workflow practices. Use when making any code change. Use when committing, merging, resolving conflicts, splitting uncommitted work in a messy working tree into clean atomic commits, opening or reviewing a pull request (PR), or pushing to a remote. Use when cutting a release, choosing a semantic version bump, tagging, or writing a changelog. Use when asked to write a commit message or a changelog entry for a change, or to split a change into commits, even when the diff is pasted inline and the message seems easy to write from it.
---

# Git Workflow and Versioning

## Overview

Git is your safety net. Treat commits as save points, branches as sandboxes, and history as documentation. With AI agents generating code at high speed, disciplined version control is the mechanism that keeps changes manageable, reviewable, and reversible.

## When to Use

Always. Every code change flows through git.

## Core Principles

### Keep `main` always deployable

`main` is the primary, production branch and deploys on push. `pre-prod` is the secondary integration branch where completed implementation commits accumulate and are reviewed before promotion. Keep `main` deployable; do not commit routine work directly to it.

### 1. Commit Early, Commit Often

Each successful increment gets its own commit. Don't accumulate large uncommitted changes.

```
Work pattern:
  Implement slice → Test → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

Commits are save points. If the next change breaks something, you can revert to the last known-good state instantly.

### 2. Atomic Commits

Each commit does one logical thing:

```
# Good: Each commit is self-contained
git log --oneline
a1b2c3d Add task creation endpoint with validation
d4e5f6g Add task creation form component
h7i8j9k Connect form to API and add loading state
m1n2o3p Add task creation tests (unit + integration)

# Bad: Everything mixed together
git log --oneline
x1y2z3a Add task feature, fix sidebar, update deps, refactor utils
```

### 3. Descriptive Messages

Commit messages explain the *why*, not just the *what*:

```
# Good: Explains intent
feat: add email validation to registration endpoint

Prevents invalid email formats from reaching the database.
Uses Zod schema validation at the route handler level,
consistent with existing validation patterns in auth.ts.

# Bad: Describes what's obvious from the diff
update auth.ts
```

**Format:**
```
<type>: <short description>

<optional body explaining why, not what>
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `test` — Adding or updating tests
- `docs` — Documentation only
- `chore` — Tooling, dependencies, config

### 4. Keep Concerns Separate

Don't combine formatting changes with behavior changes. Don't combine refactors with features. Each type of change should be a separate commit — and ideally a separate PR:

```
# Good: Separate concerns
git commit -m "refactor: extract validation logic to shared utility"
git commit -m "feat: add phone number validation to registration"

# Bad: Mixed concerns
git commit -m "refactor validation and add phone number field"
```

**Separate refactoring from feature work.** A refactoring change and a feature change are two different changes — submit them separately. This makes each change easier to review, revert, and understand in history. Small cleanups (renaming a variable) can be included in a feature commit at reviewer discretion.

### 5. Size Your Changes

Target ~100 lines per commit/PR. Changes over ~1000 lines should be split. See the splitting strategies in `code-review-and-quality` for how to break down large changes.

```
~100 lines  → Easy to review, easy to revert
~300 lines  → Acceptable for a single logical change
~1000 lines → Split into smaller changes
```

## Branches and Merge Rules

### Branches

Use these branch roles:

- `main`: primary production branch. It receives reviewed promotion merges from `pre-prod`.
- `pre-prod`: persistent secondary working and integration branch. Routine implementation slices are committed and pushed here.
- `codex/<feature>`: short lived branch for a distinct feature that benefits from isolation. Merge it into `pre-prod` when complete, then push `pre-prod`.

Create a branch when the user requests one or when an explicitly requested workflow requires it. Do not create a new feature branch for every small implementation slice. Check the current branch and worktree before switching or committing. Preserve unrelated user changes and stage only files belonging to the requested work.

### Merge Rules

Pushing `main` may deploy. Push or merge to `main` only when the user asks or has already authorized that promotion.

**Routine implementation on `pre-prod`:**
1. Implement and verify one logical slice at a time; commit each completed slice atomically on `pre-prod` and push it.
2. For an isolated feature, create `codex/<feature>` from the current `pre-prod`, commit and push the feature branch, then merge it into `pre-prod` with `git merge --no-ff codex/<feature>` and push `pre-prod`.
3. Do not merge every implementation slice to `main`. Promote a meaningful, reviewed collection of work by merging `pre-prod` into `main` with `git merge --no-ff pre-prod`, then push `main`, when authorized.

**Initial setup or branch migration:**
1. Preserve unrelated uncommitted work and commit only explicitly selected files.
2. Push the requested source branch, then merge it into `main` with `git merge --no-ff <source-branch>` when the user explicitly requests the initial promotion.
3. Create `pre-prod` from the resulting `main` if it does not exist, then push `pre-prod` to the remote.
4. If either branch already exists, inspect its commits relative to the other branch before merging or resetting. Never force-push or replace shared history without explicit direction.

For both:
- Always merge with `git merge --no-ff`, so each promotion leaves a visible merge commit. Never fast-forward shared-branch promotions.
- Do not cherry-pick or merge partial commits from a feature branch; merge the complete reviewed feature branch into `pre-prod`.
- If `main` has commits that `pre-prod` lacks, merge `main` into `pre-prod`, resolve conflicts, re-run affected checks, push `pre-prod`, then promote `pre-prod` to `main` when authorized.
- Run the full test suite once before the first push of a batch.

## The Save Point Pattern

```
Agent starts work
    │
    ├── Makes a change
    │   ├── Test passes? → Commit → Continue
    │   └── Test fails? → Revert to last commit → Investigate
    │
    ├── Makes another change
    │   ├── Test passes? → Commit → Continue
    │   └── Test fails? → Revert to last commit → Investigate
    │
    └── Feature complete → All commits form a clean history
```

This pattern means you never lose more than one increment of work. If an agent goes off the rails, `git reset --hard HEAD` takes you back to the last successful state.

## Change Summaries

After any modification, provide a structured summary. This makes review easier, documents scope discipline, and surfaces unintended changes:

```
CHANGES MADE:
- src/routes/tasks.ts: Added validation middleware to POST endpoint
- src/lib/validation.ts: Added TaskCreateSchema using Zod

THINGS I DIDN'T TOUCH (intentionally):
- src/routes/auth.ts: Has similar validation gap but out of scope
- src/middleware/error.ts: Error format could be improved (separate task)

POTENTIAL CONCERNS:
- The Zod schema is strict — rejects extra fields. Confirm this is desired.
- Added zod as a dependency (72KB gzipped) — already in package.json
```

This pattern catches wrong assumptions early and gives reviewers a clear map of the change. The "DIDN'T TOUCH" section is especially important — it shows you exercised scope discipline and didn't go on an unsolicited renovation.

## Pre-Commit Hygiene

Before every commit:

```bash
# 1. Check what you're about to commit
git diff --staged

# 2. Ensure no secrets (lists matching file names only — any output means review them)
git diff --staged -i -G'password|secret|api_key|token' --name-only

# 3. Run tests
npm test

# 4. Run linting
npm run lint

# 5. Run type checking
npx tsc --noEmit
```

Automate this with git hooks:

```json
// package.json (using lint-staged + husky)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Handling Generated Files

- **Commit generated files** only if the project expects them (e.g., `package-lock.json`, Prisma migrations)
- **Don't commit** build output (`dist/`, `.next/`), environment files (`.env`), or IDE config (`.vscode/settings.json` unless shared)
- **Have a `.gitignore`** that covers: `node_modules/`, `dist/`, `.env`, `.env.local`, `*.pem`

## Using Git for Debugging

```bash
# Find which commit introduced a bug
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# Git checkouts midpoints; run your test at each to narrow down

# View what changed recently
git log --oneline -20
git diff HEAD~5..HEAD -- src/

# Find who last changed a specific line
git blame src/services/task.ts

# Search commit messages for a keyword
git log --grep="validation" --oneline
```

## Release & Versioning

Commits are how *you* track change; a **version** is how your *consumers* track it. The moment anything else depends on your code — another team, a published package, a deployed client — "latest on main" stops being a sufficient answer to "what am I running, and is it safe to upgrade?" A version number and a changelog are the contract that answers it.

### Semantic Versioning

For anything with consumers, version `MAJOR.MINOR.PATCH` and let the number carry meaning:

```
  MAJOR  breaking change — consumers must change their code to upgrade
  MINOR  new functionality, backward-compatible — safe to upgrade
  PATCH  bug fix, backward-compatible — safe to upgrade
```

The number is a promise, so make the code match it. A "patch" that changes behavior consumers relied on is a major change wearing a disguise (Hyrum's Law — see the `api-and-interface-design` skill). When unsure whether a change is breaking, assume it is; a surprise major is far cheaper than a broken consumer.

### Tag the release, and let the tag be the source of truth

A release is an immutable point in history, not a moving branch. Tag it so it can always be reproduced:

```bash
git tag -a v1.4.0 -m "Release 1.4.0"
git push origin v1.4.0
```

Derive the version from the tag rather than hand-editing it in scattered files, so the artifact, the tag, and the changelog can never disagree.

### Keep a changelog written for humans

A changelog is not `git log`. It's the curated, consumer-facing answer to "what changed and do I care?" — grouped by `Added / Changed / Fixed / Deprecated / Removed / Security`, newest on top, every entry phrased around user impact, not internal mechanics.

```markdown
## [1.4.0] - 2025-06-12
### Added
- Bulk task import via CSV
### Fixed
- Timezone drift in recurring task due dates
### Deprecated
- `GET /v1/tasks/all` — use the paginated `GET /v1/tasks` (removal in 2.0)
```

Write the entry in the same change that makes the change, while the impact is fresh — not reconstructed from commit archaeology at release time. Breaking changes get a migration note and a deprecation window (follow the `deprecation-and-migration` skill); shipping the actual release is the `shipping-and-launch` skill's job — this section is the versioning contract that feeds it.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll commit when the feature is done" | One giant commit is impossible to review, debug, or revert. Commit each slice. |
| "The message doesn't matter" | Messages are documentation. Future you (and future agents) will need to understand what changed and why. |
| "I'll squash it all later" | Squashing destroys the development narrative. Prefer clean incremental commits from the start. |
| "A fast-forward merge is the same thing" | Same code, but no merge commit. Use `--no-ff` for shared-branch promotions. |
| "I'll merge each slice to main as it's done" | Keep routine slices on `pre-prod`; promote a reviewed, meaningful collection to `main` when authorized. |
| "I'll split this change later" | Large changes are harder to review, riskier to deploy, and harder to revert. Split before submitting, not after. |
| "I don't need a .gitignore" | Until `.env` with production secrets gets committed. Set it up immediately. |
| "It's just a small fix, bump the patch" | Check what consumers can observe. A behavior change they relied on is a major, whatever the diff size. |
| "The changelog is just the commit log" | Commits are for you; the changelog is for consumers, curated by impact. Generating one from raw commits buries what matters. |
| "We'll write the changelog at release time" | By then the impact is reconstructed from memory and half of it is missing. Write the entry with the change. |

## Red Flags

- Large uncommitted changes accumulating
- Commit messages like "fix", "update", "misc"
- Formatting changes mixed with behavior changes
- No `.gitignore` in the project
- Committing `node_modules/`, `.env`, or build artifacts
- Creating a branch the user did not ask for
- A merge into `main` or `pre-prod` that fast-forwarded (no merge commit in the history)
- Promoting a feature to `main` before it has been integrated and reviewed on `pre-prod`
- Force-pushing to shared branches
- A breaking change shipped under a minor or patch version bump
- A release with no tag, or a version number hand-edited out of sync with the tag
- A user-facing release with no changelog entry, or a changelog that's just dumped commit messages

## Verification

For every commit:

- [ ] Commit does one logical thing
- [ ] Message explains the why, follows type conventions
- [ ] Tests pass before committing
- [ ] No secrets in the diff
- [ ] No formatting-only changes mixed with behavior changes
- [ ] `.gitignore` covers standard exclusions

For every release (anything with consumers):

- [ ] The version bump matches the change: breaking → major, additive → minor, fix → patch
- [ ] The release is tagged, and the version is derived from the tag, not hand-edited out of sync
- [ ] The changelog has a curated, human-readable entry grouped by impact for this version
