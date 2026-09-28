# Testing Strategy

## Required layers

1. Unit: validation, security helpers, lifecycle rules, AI schemas and retry classification.
2. API integration with PostgreSQL: auth, groups, topics, logbooks, evaluations, notifications, exports, AI access, transactions.
3. Contract: frontend request/response types against Express and Express against FastAPI.
4. Browser E2E: complete Student, Mentor, and Admin workflows with denial cases.
5. Security: IDOR/BOLA, RBAC, token misuse, injection, uploads, prompt injection, cross-project/institution access.
6. Accessibility: keyboard, focus, semantics, axe/WCAG checks and responsive widths.
7. Resilience/load: dependency outages, worker crash/recovery, authenticated k6 scenarios and measured latency/error rates.

## Current evidence

On 2026-09-28, all 9 backend Jest suites passed (24 tests) without coverage instrumentation. The release test command still fails its configured coverage thresholds: statements 55.21% below 75%, branches 31.65% below 50%, lines 58.96% below 80%, and functions 40.42% below 50%; writing the local coverage artifact also encountered Windows `EPERM`.

Frontend lint and TypeScript passed. The production build was blocked locally by Windows `EPERM` on `.next/trace`. AI pytest discovered 9 tests, but the full run did not produce a conclusive completion summary. Authenticated browser E2E, security, load, accessibility, database-integration, and recovery tests remain required. These results are not sufficient for release approval.
