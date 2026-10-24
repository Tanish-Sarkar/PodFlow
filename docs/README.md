# PodFlow Documentation Index

This repository distinguishes the intended product from the current implementation. The public site and backend foundation exist; most knowledge workflows remain planned.

## Sources of truth

| Topic | Authoritative document | Meaning |
| --- | --- | --- |
| Product vision and target architecture | [00 — Master specification](00_PodFlow_V2_Master_Specification.md) | Intended product and design baseline. It is aspirational unless implementation is explicitly confirmed elsewhere. |
| Detailed product requirements | [01 — PRD](01_PRD.md) | User outcomes and target behavior. |
| Target technical architecture | [02 — TRD](02_TRD.md) | Proposed stack and boundaries; not evidence that a service is integrated. |
| Implemented API | Current FastAPI source/OpenAPI and migrations | Only health endpoints and profile/workspace persistence are currently present. `03_API_Endpoints.md` is a planning inventory. |
| Candidate domain schema | [04 — Schemas](04_Schemas.md) | Proposed data objects; compare with current Alembic migrations before implementation. |
| Verified implementation status and audit evidence | [15 — Repository audit](15_Repository_Audit.md) | Current code, Git state, risks, and validation results as of 2026-10-24. |
| Prioritized next work | [16 — Engineering backlog](16_Engineering_Backlog.md) | Dependencies, effort bands, impact, and acceptance criteria. |
| New developer/agent starting point | [17 — AI agent onboarding](17_AI_Agent_Onboarding.md) | What to read and how to make a verified change. |
| Backend environment and Supabase setup | [18 — Backend environment setup](18_Backend_Environment_and_Supabase_Setup.md) | Phase 1 environment-only configuration. No schema/routes. |
| Development procedures | [Skills index](../skills/README.md) and `.agents/rules/rules_of_code.md` | Reusable testing and engineering instructions. |

If a code path, migration, command result, and planning statement disagree about what exists, use the code and reproducible command result, then update the docs. Do not silently rewrite a target requirement into an implemented feature.

## Supporting product and engineering documents

1. [01 — Product requirements](01_PRD.md)
2. [02 — Technical requirements](02_TRD.md)
3. [03 — API endpoint plan](03_API_Endpoints.md)
4. [04 — Candidate schemas](04_Schemas.md)
5. [05 — Testing rules and test plan](05_Testing_Rules_and_Tests.md)
6. [06 — Proof of concept](06_POC.md)
7. [07 — Phase milestones](07_Phase_Milestones.md)
8. [08 — Development and agent environment](08_Dev_and_Agents_Environment.md)
9. [09 — UI design system](09_UI_Design_System.md)
10. [10 — Deployment and CI/CD plan](10_Deployment_and_CICD.md)
11. [11 — ADRs and missing documents](11_ADR_and_Missing_Docs.md)
12. [12 — Repository migration and branch plan](12_Repo_Migration_and_Branch_Plan.md) — historical plan; check actual Git state.
13. [13 — Platform, monorepo, and extension architecture](13_Platform_Monorepo_and_Extension_Architecture.md)
14. [14 — Marketing landing-page UI/UX specification](14_Marketing_Landing_Page_UI_UX_Spec.md)
15. [18 — Backend environment and Supabase setup](18_Backend_Environment_and_Supabase_Setup.md)

## Current component shape

```text
Browser -> Next.js public marketing page (implemented, static/demo interactions)
FastAPI -> /api/v1/health/* -> SQLAlchemy -> configured PostgreSQL connection
```

The intended future shape—dashboard, PWA, extension, artifacts, chat, presentations, exports, sharing, and connectors through a central API—is in the master specification, not yet in the running application. The prior `docs/DEV_DOCS/implementation_plan.md` is preserved as a clearly marked historical snapshot.
