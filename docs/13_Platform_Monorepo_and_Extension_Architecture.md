# 13 — Platform, Monorepo & Extension Architecture

## Status

Proposed architecture specification for PodFlow V2.1.

This document extends the existing PodFlow V2 engineering documents. It does not replace them.

## 1. Purpose

PodFlow is intended to evolve from a web application into a programmable AI knowledge platform.

The platform must support:
- a web application;
- a backend API;
- a knowledge engine;
- an AI/workflow engine;
- first-party integrations;
- external connectors;
- future browser/desktop extensions;
- future SDK/client consumers.

The architecture must avoid coupling the core domain model to any single UI, integration provider, or delivery mechanism.

Guiding principle: **Simple on the surface, rigorous underneath.**

## 2. Architectural Principle

PodFlow should be treated as a platform with multiple experiences and clients rather than as a single web application.

```text
                         PODFLOW PLATFORM
                                |
             +------------------+------------------+
             |                  |                  |
       Knowledge Engine   Workflow Engine    Connector Layer
             |                  |                  |
             +------------------+------------------+
                                |
                             Core API
                                |
              +-----------------+-----------------+
              |                 |                 |
           Web App        Browser/Desktop      External
                          Extensions/Clients     Clients
```

## 3. Logical Architecture Layers

### 3.1 Experiences

User-facing applications such as PodFlow Web, browser extensions, and future desktop applications.

Experiences should consume platform capabilities through defined APIs/contracts rather than directly manipulating persistence.

### 3.2 Artifacts

Durable knowledge products produced or edited by PodFlow, including summaries, notes, reports, study guides, research briefs, and structured knowledge artifacts.

Artifacts are domain objects, not UI documents.

### 3.3 Workflows

Workflows describe executable sequences of operations. A workflow may receive a resource, ingest/normalize it, retrieve context, invoke AI, create/update an artifact, and deliver/store/share the result.

Workflow definitions should be declarative and versionable.

### 3.4 Knowledge Engine

The knowledge engine owns concepts such as:
- Resource
- Document
- Chunk
- Embedding
- Retrieval
- Evidence
- Claim
- Provenance
- Citation
- KnowledgeArtifact

It must remain independent of a particular frontend.

### 3.5 Infrastructure

Infrastructure includes PostgreSQL/pgvector, object storage, authentication, model providers, queues/background execution when justified, observability, and deployment infrastructure.

Domain code should not become tightly coupled to infrastructure implementations.

## 4. Monorepo Strategy

The repository is already a multi-component repository. A future migration to an explicit `apps/` + `packages/` layout is possible, but it must be justified by real shared boundaries.

Candidate future structure:

```text
PodFlow/
├── apps/
│   ├── web/
│   ├── api/
│   └── extension/
├── packages/
│   ├── contracts/
│   ├── client/
│   ├── knowledge/
│   ├── workflows/
│   └── ui/
├── integrations/
│   ├── gmail/
│   ├── youtube/
│   └── ...
├── docs/
├── .agents/
└── ...
```

This is a candidate, not an immediate migration.

### Migration rule

Do not create directories merely because they appear scalable.

Introduce a new application/package/integration boundary when it has an independent runtime, clear public interface, reuse across applications, independent dependency management, independent deployment lifecycle, or materially improves ownership, testing, or security.

## 5. Dependency Direction

Preferred:

```text
Experience
    |
    v
Platform API / Application Services
    |
    +----> Knowledge Engine
    +----> Workflow Engine
    +----> Connector Interfaces
    |
    v
Infrastructure Adapters
```

Avoid direct frontend-to-database access and avoid allowing provider-specific integrations to define the core domain model.

## 6. Connector Architecture

A connector is an integration boundary that allows an external system to interact with PodFlow capabilities or PodFlow to interact with an external system.

### Inbound connector

External system -> PodFlow.

Examples:
- browser extension sends a URL;
- external client creates a resource;
- another AI system requests knowledge retrieval.

### Outbound connector

PodFlow -> external system.

Examples:
- Gmail delivery;
- external storage;
- future messaging/productivity integrations.

Connectors must not bypass authorization and domain rules.

## 7. Connector Contract

A connector should have a stable contract covering:
- identity;
- capabilities;
- authentication;
- authorization;
- input validation;
- output schema;
- error semantics;
- retries;
- rate limits;
- observability;
- versioning.

Provider-specific details belong behind the connector boundary.

## 8. Authentication and Authorization

Authentication and authorization must not be independently reinvented inside every connector.

The platform should distinguish:
- user identity;
- application/client identity;
- connector identity;
- authorization scope;
- resource ownership;
- service credentials;
- provider credentials.

Connector credentials must never be stored in source code.

## 9. External Client / Extension Boundary

Future clients may include:
- web application;
- browser extension;
- desktop application;
- external AI clients;
- automation tools;
- SDK consumers.

They should not require direct database access.

Preferred boundary:

```text
Client
  |
  v
Authenticated API / Connector Interface
  |
  v
PodFlow Application Layer
  |
  v
Domain Services
```

## 10. API Contract Strategy

The API is a product boundary.

Contracts should define:
- request schemas;
- response schemas;
- error format;
- authentication requirements;
- authorization requirements;
- pagination;
- filtering;
- sorting;
- idempotency where required;
- versioning.

Clients should consume contracts rather than undocumented implementation details.

## 11. Shared Contracts

If multiple clients consume the API, duplicated hand-written schemas become a maintenance risk.

A future approach may be:

```text
Backend schema
      |
      v
OpenAPI / canonical contract
      |
      +----> TypeScript client/types
      +----> Python client/types where useful
      +----> External SDKs
```

Do not create a shared package merely to duplicate every backend type.

## 12. TanStack Query

TanStack Query is a frontend server-state management layer. It is not part of the core PodFlow architecture and does not constrain the connector or monorepo strategy.

Its responsibilities include fetching, caching, refetching, mutations, invalidation, and loading/error state.

```text
Next.js / React
      |
TanStack Query
      |
PodFlow API
      |
Platform
```

TanStack Query must not become a substitute for domain state or workflow state.

## 13. Workflow and Connector Interaction

Connectors should be callable workflow capabilities where appropriate.

```text
Trigger
  |
  v
Ingest Resource
  |
  v
Normalize
  |
  v
Retrieve Context
  |
  v
Generate Artifact
  |
  v
Connector: Gmail
```

The workflow engine should operate against connector capabilities rather than provider-specific implementation details.

## 14. Knowledge Engine Independence

The knowledge engine should not care whether a request originated from the web app, browser extension, Gmail, an external AI client, or a workflow.

These clients should converge on the same domain/application capabilities.

## 15. Extension Security Boundary

Extensions are untrusted clients from the platform's perspective.

They must not receive database credentials, unrestricted service credentials, internal infrastructure credentials, or arbitrary privileged API access.

Extensions should use explicit authentication and scoped capabilities. Every externally initiated action must be authorized server-side.

## 16. Versioning

Public connector/API contracts should be versioned when compatibility requires it. Internal implementation details do not need public versioning.

Changes should distinguish:
- breaking API changes;
- additive API changes;
- internal refactors;
- connector capability changes;
- workflow schema migrations.

Stored workflow definitions require an explicit migration/versioning strategy.

## 17. Observability

Connector and workflow execution should eventually expose:
- request/run identifiers;
- connector identifier;
- workflow identifier;
- execution status;
- latency;
- retries;
- provider errors;
- model usage/cost where applicable.

Sensitive credentials and tokens must never be logged.

## 18. Testing Boundaries

### Unit tests
Domain logic, workflow validation, connector contracts, transformation logic.

### Integration tests
API + database, API + connector adapter, retrieval, persistence.

### Contract tests
Verify that clients and API agree on schemas and connector implementations satisfy connector contracts.

### End-to-end tests
Verify important user journeys across the platform.

External provider tests should be isolated from deterministic unit tests.

## 19. ADRs Required

Before the platform/extension ecosystem becomes implementation-heavy, create ADRs where these decisions are not already documented:

1. Monorepo and package boundary strategy
2. Public API versioning
3. Connector contract and lifecycle
4. External extension authentication
5. Shared API contract/code generation strategy
6. Workflow execution and connector invocation
7. Credential storage and secret handling
8. Observability/tracing boundary

Each ADR should record the decision, alternatives, consequences, and status.

## 20. Immediate Implementation Policy

Until the boundaries are sufficiently defined:
- do not implement a plugin marketplace;
- do not implement arbitrary third-party extensions;
- do not create a generic plugin runtime;
- do not introduce microservices;
- do not introduce a message broker without a demonstrated need;
- do not expose direct database access to clients;
- do not duplicate domain logic inside integrations;
- do not over-engineer the monorepo layout.

The first implementation target remains a clean backend foundation. Backend modules must nevertheless be designed so future clients and connectors can consume application capabilities through stable interfaces.

## 21. Architectural Tests

Before adding a major feature, ask:

> If the PodFlow Web App disappeared tomorrow, could the core capability still be used through another authenticated client?

If no, determine whether the dependency is intentional.

> If Gmail were removed from PodFlow, would the knowledge engine still make sense?

If no, provider coupling has probably leaked into the core.

> If a browser extension and the web app both need the same capability, do they call the same platform service rather than duplicate the implementation?

If no, reconsider the boundary.

## 22. Current Recommendation

Keep the current repository structure while implementing the first backend foundation. Do not perform a speculative monorepo migration yet.

First establish:
- FastAPI application;
- configuration;
- health endpoint;
- tests;
- linting;
- clean package boundaries.

Then introduce database/domain boundaries.

When there is demonstrated shared code or an independently deployable client, evolve the repository toward the appropriate `apps/`, `packages/`, and `integrations/` structure.

The goal is evolutionary architecture: establish strong boundaries early without paying the complexity cost before it is justified.
