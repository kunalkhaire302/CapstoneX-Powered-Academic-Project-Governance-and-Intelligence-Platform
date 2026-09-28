# AI Governance

CapstoneX AI output is advisory. Official grades, approvals, mentor allocation, and academic decisions require authorized human action.

## Enforced principles

- Protected AI operations pass through Express authorization and project access checks.
- Backend-to-FastAPI calls use an internal token.
- Agent context is bounded and sanitized for prompt-injection patterns.
- Results separate findings, evidence references, confidence, limitations, and human decision state.
- AI Team runs/tasks/approvals are persisted and auditable.
- Deterministic fallback output is labelled and lower-confidence.

## Open governance work

Complete a privacy impact assessment, retention policy, bias/error review, model/data inventory ownership, incident escalation, user appeal process, and production monitoring. Never promote heuristic or fallback results as verified facts.
