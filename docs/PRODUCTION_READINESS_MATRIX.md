# Production Readiness Matrix

Verified against the repository on 2026-09-28. “Blocked” means a release gate lacks evidence or has an open high-risk issue.

| Domain | Status | Evidence | Fix applied | Remaining risk |
|---|---|---|---|---|
| Functionality | Partial | Route/controller and 33-page inventory | Core UI contract repairs documented in `UI_FUNCTIONALITY_AUDIT.md` | No authenticated full-lifecycle E2E run |
| Authentication | Partial | JWT/Firebase middleware, recovery controllers/tests | Recovery throttling; transactional one-time reset consumption | Refresh-token reuse/session revocation not persisted |
| Authorization | Partial | Route RBAC and controller ownership checks | Mentor risk results scoped to assigned groups | Institution isolation is not modeled on most records; negative coverage incomplete |
| Database | Blocked | Models vs two migrations | Production `DB_SYNC` now rejected | No complete baseline migration or verified upgrade/restore test |
| API contracts | Partial | Frontend/API route comparison | Group/topic/evaluation/AI-health mismatches repaired | Duplicate recommendation APIs remain |
| Security | Blocked | `SECURITY_AUDIT.md` | Recovery limiter, safer reset race handling, production SQL logging disabled | Secret rotation and comprehensive IDOR/security testing require operator/staging work |
| UI/UX | Partial | `UI_FUNCTIONALITY_AUDIT.md` | Fabricated states removed or labelled | Authenticated cross-role browser verification unavailable |
| Accessibility | Partial | Shared focus/modal/reduced-motion primitives | Contrast and surface-token defects repaired | Automated WCAG scan and mobile matrix not executed |
| Performance | Unverified | `PERFORMANCE_AUDIT.md` | Bounded list limits and AI concurrency exist | No representative p50/p95/p99 benchmark |
| Reliability | Partial | Agent state persistence, worker claim/recovery | Automatic transient AI retry; stale-run recovery | Worker deployment and crash/load evidence missing |
| AI/ML | Blocked | `AI_ML_PRODUCTION_READINESS.md` | Truthful fallback/health states | No versioned real dataset or independently reviewed metrics |
| AI governance | Partial | Human approval, evidence, confidence, audit records | Preserved throughout changes | Production privacy/fairness review incomplete |
| Analytics | Partial | Aggregate API only | Fake trends/metrics removed | No validated time-series/model operations data |
| Testing | Blocked | 9 backend suites/24 assertions pass; frontend type/lint pass | Recovery concurrency and limiter regressions added | Coverage gate fails; DB integration, E2E, security, load, a11y coverage incomplete |
| Observability | Blocked | Request IDs and logs | Production SQL logging disabled | No configured metrics, alerting, tracing, or dashboards |
| Deployment | Partial | Dockerfiles, Compose, GitHub Actions, hosted configs | Strict production env checks | No reproducible migration/rollback verification |
| Backup/recovery | Blocked | `DISASTER_RECOVERY.md` | Recovery runbook documented | No executed backup restore test |
| Documentation | Partial | Required audit set and project context | Claims reconciled | Must be refreshed after staging evidence |

## Release decision

**NOT PRODUCTION READY.** Database, security, testing, AI/ML, observability, and recovery gates remain blocked.
