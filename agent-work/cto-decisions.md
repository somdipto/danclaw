# CTO Decisions - 2026-04-04 23:55 IST

## Decision 1: Table Naming
- SCHEMA.sql is canonical → `activity` table (not `activity_log`)
- Fix: All migrations and code must use `activity`
- Backend Dev: Already fixed activity inserts to use `activity` table with `timestamp`

## Decision 2: P0 Bug - Activity user_id Drift
- **Problem**: `Activity` type and `activitySchema` missing `user_id`
- **Decision**: DB Dev must fix this before Phase 1 sign-off
- **Files**: `packages/shared/src/types/index.ts`, `packages/shared/src/validators/index.ts`

## Decision 3: Missing Indexes
- `idx_messages_deployment_id_created_at` → HIGH priority (chat pagination)
- `idx_activity_log_user_id_timestamp` → HIGH priority (activity feed)
- DB Dev: Create these in next migration

## Decision 4: Pending CEO Decisions
1. **Billing provider**: RevenueCat OR Stripe Connect?
2. **Agent storage**: InsForge DB OR agent containers?

## Status
- Phase 1: ~90% complete
- Web backend/frontend: ✅ DONE
- Mobile Expo: ⏳ Needs kickstart
- P0 bugs: 2 (user_id drift in Activity type/schema)
