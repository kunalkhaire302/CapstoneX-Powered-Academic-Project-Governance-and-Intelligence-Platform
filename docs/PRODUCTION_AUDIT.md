# Production Audit

## Executive summary

CapstoneX is a development-stage beta with useful core workflows, not a defensible production release. The public business boundary is Express; the browser must not call protected FastAPI workflows directly. Implemented roles are Student, Mentor, and Admin.

## Verified architecture

`Next.js -> Express/RBAC -> PostgreSQL` and `Express -> internal-token FastAPI`. PostgreSQL also persists governed AI Team runs/tasks/approvals. The focused deployed AI runtime does not prove availability of the complete ML workload.

## Highest-risk findings

1. **Critical — Database:** models define the primary schema while migrations do not. Fresh production creation and upgrades are not deterministic.
2. **Critical — Operations:** previously disclosed credentials require rotation; repository changes cannot prove this occurred.
3. **High — Isolation:** institution ownership is present on User but not consistently represented/enforced across domain entities.
4. **High — Session lifecycle:** refresh tokens are rotated in the cookie but not stored, reuse-detected, or globally revoked after password reset.
5. **High — Testing:** no authenticated staging E2E evidence for the complete Student/Mentor/Admin lifecycle.
6. **High — AI/ML:** no versioned evaluation dataset or independently reviewed model metrics.
7. **High — Observability/recovery:** no configured production metrics/alerts and no restore exercise.

## Remediation applied in this pass

- Dedicated password-recovery rate limit.
- Transactional row locking and one-time invalidation for password-reset tokens.
- Older recovery tokens invalidated when a new link is issued.
- Production SQL logging disabled.
- Production startup rejects `DB_SYNC=true`.
- Readiness documentation reconciled with evidence.

See the readiness matrix for the objective release decision.

## Verification results (2026-09-28)

| Check | Result |
|---|---|
| Backend assertions: `npx jest --runInBand --coverage=false --forceExit` | Pass: 9 suites, 24 tests |
| Backend release test: `npm test -- --runInBand` | Assertions pass, but the command fails its configured coverage gate; local coverage output also encountered Windows `EPERM` |
| Backend lint | Pass with 10 pre-existing warnings and no errors |
| Frontend lint and TypeScript | Pass |
| Frontend production build | Unverified locally: Windows denied access to `.next/trace` (`EPERM`) |
| AI tests | 9 tests collected; the full quiet run did not return a conclusive completion summary |
| npm production dependency audits | Pass: zero reported backend or frontend vulnerabilities |
| Python dependency audit | Unverified: `pip-audit` is not installed |
| Authenticated browser E2E | Not completed in the local environment |

Passing assertions do not override the blocked release gates below.
