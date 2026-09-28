# Disaster Recovery

## Current status

No executed restore evidence exists; recovery is therefore blocked.

## Required runbook

1. Record provider-native PostgreSQL backup cadence, retention, encryption and ownership.
2. Restore the latest backup into an isolated environment.
3. Run migrations and integrity checks; verify critical row counts and three role journeys.
4. Recreate environment configuration from a secret manager and rotate compromised credentials.
5. Redeploy immutable frontend/backend/AI revisions and validate readiness.
6. Regenerate FAISS/embedding indexes from versioned source data; verify model artifact checksums.
7. Document measured RPO/RTO and gaps from the exercise.

Do not run destructive restore tests against production. Database, object storage, model artifacts and secrets require separate recovery ownership.
