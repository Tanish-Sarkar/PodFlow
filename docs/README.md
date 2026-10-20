# PodFlow --- Engineering Documentation

## Master reference

`00_PodFlow_V2_Master_Specification.md` is the current high-level product and engineering reference. It brings together the Knowledge Artifact lifecycle, presentable website views, 24-hour sharing, scoped RAG chat, exports, newsletter delivery, browser extension, and model-improvement strategy.

1. `00_PodFlow_V2_Master_Specification.md` — V2 product, architecture, and delivery baseline
2. `01_PRD.md` — product requirements
3. `02_TRD.md` — technical architecture
4. `03_API_Endpoints.md` — endpoint inventory pending OpenAPI detail
5. `04_Schemas.md` — candidate database/domain schemas
6. `05_Testing_Rules_and_Tests.md` — test strategy
7. `06_POC.md` — proof of the core knowledge pipeline
8. `07_Phase_Milestones.md` — current delivery phases
9. `08_Dev_and_Agents_Environment.md` — development and agent guidance
10. `09_UI_Design_System.md` — UI and presentation direction
11. `10_Deployment_and_CICD.md` — deployment/CI
12. `11_ADR_and_Missing_Docs.md` — ADR register and required follow-up docs
13. `12_Repo_Migration_and_Branch_Plan.md` — historical migration record; not active instructions
14. `13_Platform_Monorepo_and_Extension_Architecture.md` — client/connector and future monorepo boundaries

## Core architecture

``` text
Dashboard / PWA / Chrome Extension
      |
FastAPI / Python
      |
Workflow + Knowledge + Delivery Services
      |
Supabase PostgreSQL + pgvector
      |
Supabase Storage
```

## Principle

Use the smallest number of technologies that can support a serious
product: one relational database, vectors inside PostgreSQL, object
storage, managed auth, durable workflow state, clear boundaries and
measurable AI quality.
