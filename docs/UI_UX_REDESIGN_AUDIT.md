# CapstoneX UI/UX Redesign Audit

Verified against the frontend on 2026-09-24. `PROJECT_CONTEXT.md` and executable code are authoritative; marketing documentation is not.

## Product direction

CapstoneX should use a restrained **academic operations journal** language: editorial typography for institutional authority, compact sans-serif UI text for operational clarity, cardinal red only for brand and high-intent actions, ink/navy for governance, and paper-like neutral surfaces. Dense workflows should read like a well-structured faculty review file, not a generic card dashboard.

## Route inventory

| Area | Routes | Current implementation | Redesign priority |
|---|---|---|---|
| Public/auth | `/`, `/login`, `/register`, `/forgot-password`, `/reset-password` | All routes exist; root redirects; recovery exists | P0: registration role bug, recovery token states, error consistency |
| Student | `/student`, `/groups`, `/topics`, `/recommendations`, `/ai-team`, `/logbook`, `/marks`, `/notifications` | All requested routes exist; marks fabrication remediated | P1: clarify lifecycle and finish state migration |
| Mentor | `/mentor`, `/groups`, `/logbook-review`, `/evaluations`, `/schedule`, `/risk`, `/reports`, `/ai-team`, `/notifications` | All requested routes exist; notification inbox added; several pages remain thin/static | P1: operational review IA and real loading/error/empty states |
| Admin | `/admin`, `/users`, `/audit`, `/topics`, `/risk`, `/teams`, `/analytics`, `/ai-team`, `/models`, `/notifications` | All requested routes exist; analytics/team fabrication remediated | P1: table consistency and model degraded state |
| Global | `error.tsx`, `loading.tsx` | Branded global states exist | P1: add role-aware 403/404 patterns and reusable states |

Detailed route purpose and API dependencies are maintained in `FRONTEND_ROUTE_INVENTORY.md`.

## Reusable foundation

- `DashboardLayout`, `Sidebar`, and `Topbar` already provide one role-aware shell and should be refactored rather than replaced.
- `AuthFrame` provides a coherent public-shell foundation.
- `Button`, `Input`, `Card`, `Badge`, `Modal`, and `Skeleton` are useful primitives but lack a complete semantic/token contract.
- `AgentTeamWorkspace` is correctly shared across all three roles and preserves the governance boundary.
- `api.ts` centralizes access-token refresh and should remain the sole HTTP client.

## Critical findings

Items marked **remediated** were fixed during the 2026-09-24 production-foundation pass; the remaining findings stay open.

### Data integrity and trust

1. **Remediated:** `/register` no longer exposes Mentor selection; public creation is fixed to Student.
2. **Remediated:** `Topbar` no longer displays fabricated notification content or unread counts.
3. **Remediated:** Admin analytics no longer synthesizes time-series/model values.
4. **Remediated:** Admin team formation no longer fills profile data or produces teams randomly.
5. **Remediated:** Student marks now displays only persisted evaluations.
6. Admin model screens fall back to cached/static status without a sufficiently explicit degraded-state boundary.

### Interaction quality

1. Native `alert()` remains in logbooks, evaluations, settings, and model actions.
2. **Remediated:** Sidebar dead Settings/Support controls were removed.
3. **Partially remediated:** the command overlay is role-filtered but remains a quick-action launcher, not global data search.
4. **Remediated:** join-group copy accepts and explains legacy six-character and current eight-character codes.
5. Several consequential operations lack a consistent confirmation-dialog pattern.

### Information architecture

1. Navigation is role-aware, but page-level breadcrumbs and contextual action placement are inconsistent.
2. Dashboard pages mix overview, decorative statistics, and actions without one shared priority model.
3. Topic and logbook lifecycle states are represented page-locally instead of through shared timeline/stepper semantics.
4. Mentor review pages are too thin to support high-volume review work.
5. Admin tables do not share one column-density, filtering, pagination, or mobile strategy.

### Accessibility

1. Global focus and reduced-motion support are present.
2. **Remediated:** shared Modal restores focus to the invoking control after close.
3. Custom sidebar account control needs full keyboard activation semantics.
4. Status badges include text, which avoids color-only meaning; this convention must be preserved.
5. Some icon buttons are below the preferred 44px target outside coarse-pointer media.
6. Charts and complex workflow visuals need text equivalents and no-data descriptions.

### Responsive behavior

1. Shell collapses below desktop, but dense page-local grids frequently only wrap rather than reprioritize.
2. Tables gain horizontal scrolling globally but lack column-priority/mobile summaries.
3. The AI Team workspace is polished but remains dense at 390px.
4. Three-column review concepts require deliberate stacked panel order on mobile.

### Component duplication

- Page-local status pills, metric cards, empty panels, alert banners, field shells, toolbar filters, and table wrappers are repeated.
- Multiple pages hand-build buttons, inputs, and cards instead of extending primitives.
- Inline SVG navigation icons duplicate installed Lucide icons.

### Missing states

- Consistent page error/retry and empty/action states.
- Explicit degraded-data panels for AI/model outages.
- Token-validating recovery state (backend only validates during submission).
- Shared 403/404 experience.
- Real notification preview in the header.
- Import-progress/result summary for CSV administration.

## Redesign priorities

### P0 — Trust and correctness

- Make public registration Student-only.
- Remove fabricated notification, analytics, team, marks, and model state.
- Establish semantic design tokens and reusable loading/error/empty/status/form primitives.
- Replace raw browser alerts and raw backend messages.
- Preserve server-verified role guards and API contracts.

### P1 — Workflow architecture

- Refine the global shell, breadcrumbs, page header, contextual actions, and mobile navigation.
- Standardize group, topic, logbook, review, approval, table, chart, and notification patterns.
- Rebuild mentor review and admin operational pages around attention queues.

### P2 — Quality and scale

- Add role-aware command navigation without presenting quick links as data search.
- Add reusable data-table and chart containers.
- Expand Playwright coverage across auth and each critical role workflow.
- Complete keyboard, responsive, and screen-reader QA at the specified breakpoints.

## Route disposition

- **Reuse/refactor:** all active routes, shared shell, auth frame, AI Team workspace, API client.
- **Completely redesign:** thin mentor schedule/risk/reports/logbook review pages; data-heavy admin analytics/teams/users surfaces.
- **Do not add:** HOD, Coordinator, Examiner, unsupported settings/support/search backends, or manufactured metrics.
