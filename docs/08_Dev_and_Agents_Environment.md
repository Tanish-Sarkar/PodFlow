# PodFlow --- Development and AI Agent Environment

## Tools

Git, Python 3.11+, Node.js LTS, Docker, PostgreSQL client tools, GitHub
CLI, IDE and Playwright.

Cloud/services: GitHub, Supabase, Vercel, Render, Google Cloud where
OAuth/Gmail requires it, CodeRabbit.

## Agent setup

Create:

``` text
.agents/
  rules/
  workflows/
  skills/
```

Rules cover architecture boundaries, tests, security, migrations,
secrets, branch policy and API/documentation updates.

## Antigravity

Primary long-context/workspace agent for repository-wide changes,
architecture work, multi-file features and large refactors.

## Codex

Second implementation/review agent for isolated tasks, debugging, tests
and targeted refactors.

Do not have Antigravity and Codex modify the same feature
simultaneously.

## CodeRabbit

Install on GitHub and enable PR reviews. Keep `.coderabbit.yaml` in the
repository so review configuration is version-controlled. Focus reviews
on correctness, security, tests, migrations, API compatibility and
architecture.

## Agent task contract

``` text
Goal:
Context:
Allowed files:
Forbidden files:
Constraints:
Acceptance criteria:
Tests required:
Expected output:
```

## Branching

`main` is protected. Use `feat/*`, `fix/*`, `chore/*`. One feature per
PR.

## PR gate

Local tests → CI → CodeRabbit → human review → merge.

## Secrets

Use `.env.local` locally and deployment secret stores in
CI/Vercel/Render/Supabase. Never commit OAuth secrets, service-role
keys, Gmail tokens, DB passwords or model API keys.

If a secret was ever committed, rotate/revoke it; deleting the current
file is not enough.

## Agent safety

Agents may implement code, tests, docs and migrations on branches. They
may not destroy production data, rotate credentials, bypass CI, merge
their own PR or delete historical branches without human verification.
