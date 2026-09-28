# Security Audit

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| SEC-01 | Critical | Previously disclosed deployment credentials require rotation | Operator action required |
| SEC-02 | High | Domain records lack a consistent institution key/policy | Open |
| SEC-03 | High | Refresh tokens have no persisted family/reuse detection or global revocation | Open |
| SEC-04 | High | Password-reset token could be consumed concurrently | Fixed with transaction and row lock |
| SEC-05 | Medium | Password recovery shared only a broad auth limiter | Fixed with 5/15-minute limiter |
| SEC-06 | Medium | SQL statements were logged in production | Fixed |
| SEC-07 | Medium | CSP and browser policy behavior lack deployed verification | Open |
| SEC-08 | Medium | Security regression coverage is incomplete | Open |

## Existing controls

JWT signature algorithm restriction, server-side user lookup, role middleware, Helmet, CORS allowlist, bounded JSON bodies, upload byte/type checks, login throttling, generic recovery response, hashed recovery tokens, internal AI token, prompt-input sanitization, and audit records.

## Required before approval

Rotate all disclosed secrets; implement refresh-token families/session revocation; add institution-scoped policies and IDOR tests; run SAST/dependency/DAST checks in CI; verify CSP, cookie, proxy, and CORS behavior on staging.
