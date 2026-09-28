# Database Production Readiness

## Status

**Blocked.** `backend/src/models/index.js` defines the operational schema, but only performance-index and AI-Team migrations exist. Production correctly refuses development bootstrap sync, and now also rejects `DB_SYNC=true`.

## Required remediation

1. Produce a reviewed baseline migration covering every current table, enum, FK, unique/check constraint, timestamp, and index.
2. Validate an empty PostgreSQL 15 migration in CI.
3. Compare and upgrade a sanitized copy of the existing hosted schema without data loss.
4. Record forward migration and rollback/restore procedures.
5. Add concurrency tests for group membership/capacity, topics, evaluations, reset tokens, and approvals.
6. Add institution ownership columns/policies before claiming tenant isolation.

## Current evidence

Password-reset consumption now uses a transaction and `FOR UPDATE` lock. Agent execution uses conditional status claims. These localized protections do not replace schema-level lifecycle verification.
