# Observability

## Present

Request IDs, structured application logging, HTTP access logs, service health routes, persisted audit logs, and persisted AI Team execution state.

## Missing production evidence

No configured Prometheus scraper, Grafana dashboard, trace collector, alert routing, SLO/error-budget policy, log retention/redaction verification, or on-call runbook was found. A Python metrics dependency or configuration flag does not constitute monitoring.

## Minimum production plan

Instrument request latency/error rate, DB pool/query latency, authentication abuse, queue depth/age, worker failures/retries, AI latency/cost/fallback rate, email/upload failures, and readiness. Define alerts with owners and runbooks; verify alerts through controlled failure tests.
