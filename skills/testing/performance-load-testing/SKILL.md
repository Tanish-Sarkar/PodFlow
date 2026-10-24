# Performance and Load Testing

## Purpose

Measure latency, throughput, resource consumption, concurrency limits, and performance change under a defined workload. Use before setting service objectives, after a bottleneck change, and before meaningful scale increases.

## Current state

PodFlow has no load-test tool, production deployment, performance SLO, or baseline dataset configured. Do not invent response-time targets or run load against production. Existing E2E tests are not load tests.

## Procedure

1. Define the user operation, safe test environment, dataset size, concurrency, ramp-up, duration, and stop conditions.
2. Measure a baseline with the same build/runtime and report p50/p95/p99 latency, throughput, error rate, CPU/memory, DB connections/queries, and cold/warm behavior where relevant.
3. Start with a small controlled workload. Increase concurrency gradually; stop on resource exhaustion, error surge, runaway cost, or shared-environment impact.
4. Separate frontend asset timing, API time, model inference, retrieval, and queue delay. Record model revision, prompt, hardware, data version, and cache state for AI workloads.
5. Use a Python harness only when it can produce reproducible request patterns and raw results; choose and pin a tool after the API and environment are stable. No load tool is currently declared in either lockfile.

## Completion

Report methodology, environment, workload, raw measurements, variance, bottleneck evidence, and safe next steps. A result without repeatable workload and environment metadata is not a reliable regression baseline.
