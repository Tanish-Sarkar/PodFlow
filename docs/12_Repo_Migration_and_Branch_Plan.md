# PodFlow --- Repository Migration and Branch Plan

## Decision

Keep the existing PodFlow repository. Do not create a new repository.

The project already has history, identity and prototype context. A clean
architecture can be introduced without losing that history.

## Step 1 --- Freeze legacy

``` bash
git checkout main
git pull --ff-only
git tag v0.1-legacy
git push origin v0.1-legacy
```

## Step 2 --- Restructure branch

``` bash
git checkout -b restructure/v2-foundation
```

Use this branch to establish the new architecture, docs, CI, tests and
environment.

## Step 3 --- Do not delete old branches immediately

Compare every branch with main and verify no unique work is required.
The audited branches are candidates for deletion after final
verification: - feat/frontend-ui - dev - feat/backend-agents -
feature/backend-agents - feat/state - feature/infra-setup -
chore/project-setup

## Step 4 --- Pull request

Open `restructure/v2-foundation → main`.

Required: - CI green; - CodeRabbit review; - human architecture/security
review; - migration review; - README/setup verification; - no active
secrets.

## Step 5 --- Merge and tag

After merge:

``` bash
git checkout main
git pull
git tag v0.2-foundation
git push origin v0.2-foundation
```

Then delete obsolete branches only after confirming no open
PR/deployment depends on them.

## Credential warning

If credentials were ever committed to Git history, revoke/rotate them.
Removing a secret from the latest tree does not make it safe.

## Target structure

``` text
podflow/
├── .github/workflows/
├── .agents/{rules,workflows,skills}
├── docs/{prd,architecture,api,adr,testing,evaluation,runbooks}
├── backend/{app,tests,alembic,pyproject.toml}
├── frontend/{app,components,lib,tests,package.json}
├── .coderabbit.yaml
├── docker/
├── docker-compose.yml
├── .env.example
└── README.md
```

## Rule

Do not make the restructure a giant unreviewable code dump. Establish
the foundation in the restructure branch, merge it through a PR, then
return to small feature PRs.
