# UI Redesign Changelog

## 2026-09-24 — Phase 1 audit

- Inventoried 32 active frontend routes across public, Student, Mentor, and Admin areas.
- Audited the shared shell, authentication, design primitives, API usage, responsiveness, accessibility, state handling, and known fallback data.
- Identified public role-selection, fabricated notification/analytics/team/marks data, native alerts, dead actions, and duplicated primitives as primary trust issues.
- Established the academic-operations-journal direction and documented design-system and route contracts.

## 2026-09-24 — Phase 1 production foundation

- Added shared page-header and feedback primitives with consistent loading, empty, error, and retry states.
- Centralized layout, radius, motion, and z-index tokens; changed passive cards so they no longer imply clickability.
- Restored focus to the invoking control when shared dialogs close.
- Restricted public registration to Student accounts and explained institutional provisioning for Mentor/Admin access.
- Removed fabricated notification content, unread counts, random analytics trends, static model scores, random student profiles, fallback team generation, and placeholder evaluation grades.
- Added a reusable notification inbox and a real `/mentor/notifications` workspace.
- Made command-palette actions role-aware and removed dead Settings/Support actions from the sidebar menu.
- Corrected group-join guidance for supported six- and eight-character invite codes.
- Verified ESLint with zero errors and a complete Next.js production build across 36 routes.

### Remaining redesign work

- Replace native alerts in legacy form flows with the shared feedback/toast system.
- Migrate remaining routes to `PageHeader` and shared state primitives.
- Add automated accessibility, component, visual-regression, and complete role-journey coverage.
- Replace legacy `<img>` usage with optimized image components and address existing React effect warnings.
