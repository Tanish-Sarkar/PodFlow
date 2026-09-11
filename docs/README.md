# PodFlow --- Engineering Documentation

1.  `01_PRD.md` --- product requirements
2.  `02_TRD.md` --- technical architecture
3.  `03_API_Endpoints.md` --- API contract
4.  `04_Schemas.md` --- database/domain schemas
5.  `05_Testing_Rules_and_Tests.md` --- testing
6.  `06_POC.md` --- proof of concept
7.  `07_Phase_Milestones.md` --- phases/timing
8.  `08_Dev_and_Agents_Environment.md` --- Antigravity, Codex,
    CodeRabbit
9.  `09_UI_Design_System.md` --- UI system
10. `10_Deployment_and_CICD.md` --- deployment/CI
11. `11_ADR_and_Missing_Docs.md` --- ADRs + missing docs
12. `12_Repo_Migration_and_Branch_Plan.md` --- repo reset

## Core architecture

``` text
Next.js / React
      |
FastAPI / Python
      |
Workflow + Knowledge Engine
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
