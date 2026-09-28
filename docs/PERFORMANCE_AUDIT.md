# Performance Audit

## Evidence

The backend uses PostgreSQL pooling, compression, bounded pagination in several list endpoints, external-call timeouts, and bounded AI specialist concurrency. No representative benchmark was executed in this environment.

## Open risks

- No recorded API p50/p95/p99, error rate, throughput, DB latency, or memory profile.
- Some list/query paths still need systematic pagination and query-plan review.
- Full AI dependencies have large cold-start and memory requirements; the focused runtime is a different workload.
- Frontend bundle/route hydration budgets are not enforced.
- Existing k6 coverage is not sufficient evidence and must authenticate protected workflows.

## Acceptance targets to validate in staging

Set workload-specific SLOs before testing. Record at minimum API p50/p95/p99, DB query p95, error rate, worker queue latency, AI latency, throughput, memory, and frontend route transfer/interaction metrics. Do not approve capacity from a smoke test.
