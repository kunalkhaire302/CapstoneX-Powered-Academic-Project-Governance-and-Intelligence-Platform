# CapstoneX UI Functionality Audit

**Audit date:** 2026-09-28  
**Scope:** all 33 user-facing Next.js routes, shared dashboard controls, and the Express API contracts they consume.

## Method

- Traced page actions to `frontend/lib/api.ts`, Express routes/controllers, and RBAC/ownership checks.
- Removed fabricated operational data and disabled or labelled API gaps instead of presenting them as live features.
- Ran frontend lint/type checks and backend Jest tests. Browser end-to-end validation requires an authenticated environment with PostgreSQL and is not claimed here.

## Route inventory

| Area | Routes | Result |
|---|---|---|
| Public | `/`, `/login`, `/register`, `/forgot-password`, `/reset-password` | Functional from existing auth/recovery flows; protected API paths still require staging E2E coverage. |
| Student | `/student`, `/groups`, `/topics`, `/logbook`, `/marks`, `/recommendations`, `/notifications`, `/ai-team` | Connected flows retained. Topic UI now matches the server’s one-to-three topic contract and does not claim completed AI work before it exists. Schedule/deadline cards state that no schedule API exists. |
| Mentor | `/mentor`, `/groups`, `/logbook-review`, `/evaluations`, `/reports`, `/risk`, `/schedule`, `/notifications`, `/ai-team` | Dashboard, reviews, reports and risk views now use real API data. Evaluation enum values now match the Sequelize contract. Calendar is explicitly unavailable because no API exists. |
| Admin | `/admin`, `/users`, `/topics`, `/analytics`, `/audit`, `/notifications`, `/teams`, `/ai-team`, `/risk`, `/models` | Topic approval, risk, analytics, audit, users, notification and team actions are API-backed. Models page now reports service health only; retraining/metric claims were removed. |

## Repairs delivered

| Defect | Repair | Evidence |
|---|---|---|
| Mentor risk list exposed unassigned groups | Filtered score query to mentor-assigned group IDs | `backend/src/controllers/aiController.js` |
| Mentor home, review, risk and reports used fabricated/dead data | Replaced with API calls, real Excel download, and empty/error states | `frontend/app/(dashboard)/mentor/` |
| Mentor evaluation values violated backend enum | Changed client values to `mid_term`, `final`, `viva`, `presentation`, `report` | `mentor/evaluations/page.tsx`, `models/Evaluation.js` |
| Admin topics and models had fake actions/metrics | Added topic approval actions; models show actual AI health only | `admin/topics/page.tsx`, `admin/models/page.tsx` |
| Admin dashboard offered JSON as a PDF download and fake fallback analytics | Removed PDF action and fabricated fallback/system-online state | `admin/page.tsx` |
| Student topic UI required three while API accepts one to three; success overstated AI state | Aligned validation/payload and made AI result state honest | `student/topics/page.tsx` |
| Settings simulated persistence/uploads/security controls | Saves supported name/bio through `/users/profile`; unsupported controls disabled and labelled | `components/ui/SettingsModal.tsx` |
| Shared loading component rejected valid page feedback prop | Supports the existing `message` alias | `components/ui/Feedback.tsx` |

## Intentional unavailable states

- Calendar, meeting scheduling, and deadline timeline: no backend API.
- Downloadable PDF group export: endpoint returns a pdfmake definition, not PDF bytes.
- Model registry metrics, retraining, version promotion: no governed model-registry API.
- Avatar upload, email change, and password/security update within Settings: no compatible profile API.
- Risk scores: displayed only when recorded by the AI service; no client-side heuristic is used.

## Verification

| Check | Result |
|---|---|
| `frontend: npm run lint` | Completed with existing repository warnings; no introduced lint failure. |
| `frontend: npx tsc --noEmit --incremental false` | Passed. |
| `frontend: npm run build` | Blocked by Windows `EPERM` opening `.next/trace-build`. |
| `backend: npm test -- --runInBand` | 6 suites / 17 tests passed; command exits failing because pre-existing global coverage thresholds are below target and coverage output is blocked by `EPERM`. |
| Browser/API E2E | Not run: `next dev` is blocked by Windows `spawn EPERM`, and no authenticated local database/service environment was available. |

## Remaining release blockers

1. Create and test a baseline database migration; schema creation remains non-deterministic.
2. Run role-specific Playwright/API journeys in staging: login, group, topic approval, logbook review, evaluation, exports, notifications and risk isolation.
3. Implement or formally retire the unavailable APIs above; do not turn their disabled controls back into simulated functionality.
4. Rotate disclosed secrets and verify full AI/ML hosting before any production-ready claim.
