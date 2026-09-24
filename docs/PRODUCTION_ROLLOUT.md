# Production rollout and verification

Status: implementation in progress. No paid resources were authorized or created.

## Confirmed deployment inventory

Render workspace: EVOLVEX SYSTEM. Active API service: `srv-d8a6lt7avr4c73d7trg0`, root directory `backend`. No AI service exists in this workspace as of this audit. An older backend and suspended frontend also exist; do not repurpose them without checking their consumers.

Supabase project: CapstoneX, PostgreSQL 17. All 30 inspected public tables have RLS disabled. No Supabase migration history exists; Sequelize maintains its own metadata. `coordinator_id` exists through Sequelize associations, correcting the earlier context audit.

## Worker configuration

An external worker entry point is available through `cd backend && npm run worker`. It polls persisted queued runs and atomically claims each run through the existing service. Interrupted runs are recovered after twice the request timeout, bounded by task attempt limits. The worker remains experimental until restart/concurrency/database tests pass.

Set `AGENT_WORKER_MODE=external` on the API only when a worker is running. Configure the same database, AI URL, internal secret, and timeout on both. Keep the default mode until deployment verification succeeds; otherwise queued runs will wait indefinitely. Worker shutdown drains the current request.

## Hosting configuration to prepare

`render.blueprint.example.yaml` is a configuration-only template for the two
missing services. It has not been linked to Render or applied, and its `starter`
plans and persistent disk require explicit budget authorization.

| Process | Root | Build | Start | Readiness |
|---|---|---|---|---|
| API | backend | npm ci --omit=dev | npm run migrate && npm start | /api/ready |
| Worker | backend | npm ci --omit=dev | npm run worker | Process supervision and queue-age alerts |
| AI | ai-service | pip install -r requirements.txt | uvicorn app.main:app --host 0.0.0.0 --port $PORT | /api/ai/health/detailed |

The existing Python dependency set includes large models. Profile memory and disk before choosing a plan. Persistent model/vector storage and an always-running worker require a hosting decision; do not assume the free web tier provides these guarantees. No hosting configuration has been applied by this change.

API environment: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `AI_SERVICE_URL`, `AI_INTERNAL_SECRET`, `AGENT_WORKER_MODE`, `TRUST_PROXY_HOPS` (match the actual proxy chain), optional SMTP and Cloudinary credentials. AI and worker must use the identical internal secret. Generate fresh random secrets outside source control.

## Database and credential release gate

1. Capture an encrypted backup and record its timestamp, database version, and migration metadata.
2. Restore into an isolated empty database. Never run restore/reset against production.
3. Compare table counts, constraints, indexes, and application smoke results.
4. Build a baseline migration from the verified schema and test both empty-database installation and upgrade of a restored copy.
5. Revoke unnecessary Supabase Data API grants and enable RLS after verifying the Express/AI database roles retain intended access. This app uses application JWTs, not Supabase Auth identities; do not add unrelated auth.uid() policies.
6. Rotate previously disclosed database/API/JWT secrets and update every consumer in a coordinated rollout. JWT rotation signs users out.

No backup restore, remote RLS change, or credential rotation has been verified yet. A written procedure is not disaster-recovery evidence. Record restore duration and data-loss interval before establishing RTO/RPO targets.

## Acceptance evidence

- API readiness must fail with 503 when the database is unavailable.
- Run student group creation/join/lock/topic submission and assigned-mentor review on staging.
- Confirm another mentor cannot review or list a private group's logbooks.
- Verify reset email delivery, token expiry/reuse, and successful sign-in with the new password.
- Kill a worker during a run, restart it, and prove bounded recovery without duplicate approval or stale-result overwrite.
- Verify AI internal-token rejection and successful authenticated execution from the backend network.
- Measure model quality on independently reviewed data. `test_agent_benchmark.py` is synthetic safeguard coverage only and must not be reported as production accuracy.
- Alert on API 5xx, readiness failures, worker absence, oldest queued run, AI timeouts, and backup age. Alerts and dashboards are still pending deployment.
