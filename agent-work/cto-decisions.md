# CTO Decisions — 2026-04-05

## Decisions Made This Cycle

### 1. Schema Canonical Source
**Decision:** `docs/SCHEMA.sql` is the canonical source of truth. The migration file `001_initial_schema.sql` should be updated to match `docs/SCHEMA.sql` (rename `activity_log` → `activity`, add `public.` prefix, add RLS policies). The migration file should become an exact reflection of SCHEMA.sql after syncing.

**Rationale:** SCHEMA.sql has Phase 2 tables, RLS policies, and proper `public.` namespacing. The migration file is a subset.

### 2. Phase 2 Indexes
**Decision:** Add the 3 recommended indexes to `docs/SCHEMA.sql` and create a migration `002_add_phase2_indexes.sql`.

### 3. UI/UX Color Sync
**Decision:** Use emerald `#10B981` as the canonical secondary green across both web and mobile. Mobile should update from `#22c55e` → `#10B981`. Dark background: standardize on `#0A0A0F` (web).

### 4. Mobile Glass Effect
**Decision:** Yes — mobile cards should use `backdrop-blur-xl` with `dark800/50` background. Native performance is fine on modern devices.

### 5. Billing Provider
**Decision:** Stripe Connect for web subscriptions. RevenueCat for mobile in-app purchases. Both write to the same `subscriptions` and `payments` tables in Phase 2.

### 6. Agent Config Storage
**Decision:** Agent configs (OpenClaw/Hermes/SwarmClaw/Paperclip) are stored as JSON in the `agents` table in InsForge DB. Agent containers read their config at startup via InsForge API. Not in container filesystem.

### 7. Expo Status Labels
**Decision:** Align Expo `provisioning.tsx` step mapping to match actual `DeploymentStatus` enum: `provisioning`, `starting`, `running`, `stopping`, `stopped`, `error`, `deleting`, `deleted`.

### 8. Activity Feed (Mobile)
**Decision:** Activity feed should call `GET /api/activity` (not yet created). Backend Dev should add this endpoint. Expo Dev should wire it once the endpoint exists.

## Escalations to CEO
- Schema drift resolution needed (activity vs activity_log)
- Billing provider final confirmation (Stripe Connect + RevenueCat)
- Color palette confirmation (emerald #10B981)
