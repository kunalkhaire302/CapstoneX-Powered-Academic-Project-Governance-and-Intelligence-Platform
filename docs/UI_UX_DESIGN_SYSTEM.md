# CapstoneX UI/UX Design System

## Design principle

**Academic operations journal:** institutional credibility from editorial hierarchy, operational precision from compact interface typography, and visible governance in every status or AI decision.

## Tokens

- Brand: Cardinal `#D2232A`; use for brand, selected navigation, and primary intent—not generic decoration.
- Ink: navy/near-black for governance surfaces and primary text.
- Paper: warm white and cool neutral surfaces with restrained borders.
- Semantic states: emerald success, amber attention, blue information, red failure. Always pair color with text/icon.
- Radius: 6 / 10 / 14 / 20px; dense controls use smaller radii than feature surfaces.
- Spacing: 4px base; use 4, 8, 12, 16, 24, 32, 48, 64.
- Motion: 140ms feedback, 220ms state transition, 420ms page reveal. Respect reduced motion.
- Shadows: borders first; shadows only communicate elevation or temporary layers.
- Z-index: content 0, sticky header 30, mobile navigation 60, command layer 80, dialogs 100, toasts 120.

## Typography

- Editorial display: Iowan/Palatino/Georgia fallback for page and section authority.
- Interface body: local Capstone Sans variable font.
- Data/code: local Capstone Mono.
- Use typography and spacing before borders or color to establish hierarchy.

## Layout

- One responsive shell across Student, Mentor, and Admin.
- Desktop content maximum should preserve readable measure while data tables may use full width.
- Mobile order is intent-first: title/action, current state, next action, evidence/history.
- Data tables scroll only when a card/list transformation would hide essential comparison.

## Component conventions

- Buttons: one primary action per region; loading preserves label context; destructive actions require confirmation.
- Forms: persistent labels, optional helper text, inline validation, server-safe error copy, 44px controls.
- Status: shared `StatusBadge`; never color-only; use canonical backend labels.
- Cards: no automatic hover lift unless interactive.
- Empty state: explain what is absent, why, and the next permitted action.
- Error state: summarize safely, offer retry, never expose stack traces, service URLs, or secrets.
- AI output: order as recommendation, why, evidence, confidence, limitations, next action; faculty approval is visually distinct.
- Tables: clear column priority, sticky header only for long sets, pagination and filters near the table, mobile overflow or summary cards.
- Charts: title, unit, time range, tooltip, accessible summary, loading/empty/error states; never synthesize unavailable series.

## Accessibility

- WCAG 2.2 AA target.
- Visible `:focus-visible`, skip link, semantic landmarks and headings.
- Restore focus after dialogs; Escape closes temporary layers.
- Announce asynchronous status and errors.
- Minimum 44px touch targets and no hover-only operation.

## Responsive checkpoints

Review at 1440, 1280, 1024, 768, 640, 390, and 375px. Responsive behavior must reprioritize navigation, actions, filters, tables, charts, and review panels rather than only shrinking them.

