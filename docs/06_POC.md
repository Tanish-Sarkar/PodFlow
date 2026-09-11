# PodFlow --- Proof of Concept

## Objective

Prove the technically risky core before building the complete product.

Questions: 1. Can YouTube, web and PDF content be ingested reliably? 2.
Can sources be normalized? 3. Does pgvector retrieval return useful
evidence? 4. Can structured generation stay grounded in retrieved
context? 5. Can citations survive the pipeline? 6. Is quality good
enough to justify the architecture?

## Flow

``` text
YouTube / URL / PDF
        ↓
Source adapter
        ↓
Normalized document
        ↓
Chunking
        ↓
Embedding
        ↓
PostgreSQL + pgvector
        ↓
Retrieval
        ↓
Structured LLM generation
        ↓
KnowledgeArtifact JSON
        ↓
Citation-aware viewer
```

## Scope

One YouTube source, one web page, one PDF, one embedding model,
pgvector, top-k retrieval, one structured generation path and
citation-aware artifact output.

## Evaluation dataset

10--20 sources with 5--10 questions per source, expected evidence and
deliberately difficult questions.

## Metrics

-   recall@5
-   qualitative precision
-   citation correctness
-   unsupported-claim rate
-   structured-output validation rate
-   latency
-   approximate cost/artifact

## Exit criteria

Proceed only if retrieval is useful, citations are traceable, outputs
validate, failures are recoverable, and retrieval materially improves
grounding compared with prompting over the whole source.
