# Deployment Readiness

## Verified/configured

- Separate frontend, backend, full AI and focused AI runtime entry points exist.
- Dockerfiles, Compose and GitHub workflows are configured.
- Backend performs strict secret/database checks and has liveness/readiness routes.
- Production now rejects `DB_SYNC=true` and does not use sync for empty schema creation.

## Unverified/blocked

- Complete baseline migration and hosted upgrade rehearsal.
- Secret rotation evidence.
- Full ML runtime capacity/startup/model readiness.
- Durable worker deployment, horizontal scaling and crash/load tests.
- Graceful shutdown behavior under real orchestrator termination and draining.
- Rollback exercise, database restore, alerts and post-deploy E2E.

Deployment configuration is not proof of deployability. Release only from an immutable revision after migrations, staging E2E, security gates, and rollback checks pass.
