# UI/UX Production Audit

The route-level audit is in `UI_FUNCTIONALITY_AUDIT.md`.

## Improvements already applied

Fabricated dashboard/model/risk/schedule/report data was removed or explicitly labelled unavailable; evaluation and topic contracts were aligned; error/loading/empty primitives and accessible modals are shared; dark-surface contrast and menu surfaces were repaired; AI Team setup was simplified.

## Open release work

- Authenticated browser verification for all roles and critical mutations.
- Consistent unauthorized/forbidden/offline/stale/retrying states.
- Replace remaining native alerts and loose `any` types.
- Confirm unsaved-change and destructive-action behavior.
- Measure mobile overflow and frontend performance across the required viewport matrix.

Truthfulness is a release requirement: unavailable backend features must stay disabled or clearly labelled.
