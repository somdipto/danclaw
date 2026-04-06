# Backend Dev Daily Log - 2026-04-06

## Session Start: 21:50 UTC (Nightly 2h check-in)

## Findings from InsForge SDK Schema Analysis

### Discovered: InsForge Auth API Structure

The `@insforge/shared-schemas@1.1.44` package reveals the actual InsForge API:

**Auth API paths (VERIFIED MATCH):**
- `POST /api/auth/users` - Create user ✅ (register route uses this)
- `POST /api/auth/sessions` - Create session ✅ (login route uses this)
- `GET /api/auth/sessions/current` - Get current user ✅ (session route uses this)

**Auth Response Structure:**
```typescript
{
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    providers?: string[];
    createdAt: string;
    updatedAt: string;
    profile: { name?: string; avatar_url?: string } | null;
    metadata: Record<string, unknown> | null;
  };
  accessToken: string;
  refreshToken?: string;
  redirectTo?: string;
  csrfToken?: string;
}
```

**ISSUE FOUND:** DanClaw's `User` type is missing `emailVerified: boolean`. This is a type mismatch that could cause issues.

### Discovered: Database API Paths

The InsForge database API uses:
- `POST /api/database/tables` - create tables
- `GET /api/database/tables/{tableName}` - get table schema
- `POST /api/database/query` - raw SQL
- `POST /api/database/export` - export
- `POST /api/database/import` - import

For CRUD records, the pattern `/api/database/records/{table}?eq[key]=value` is likely correct based on the existing code assumptions.

### Discovered: Deployment Schema Mismatch

DanClaw has its own deployment model (provisioning, starting, running, etc.) but InsForge has a different deployment schema for Vercel-like deployments (WAITING, UPLOADING, QUEUED, BUILDING, READY, ERROR, CANCELED).

**This is not necessarily a problem** - DanClaw stores its own deployment records in the `deployments` table with its own status model. The InsForge deployment schema is for a different purpose.

### Discovered: Realtime API

InsForge Realtime uses channels, webhooks, and has its own message schema. The current ChatWebSocket URL pattern `wss://insforge.dev/realtime?deployment_id=X` is a guess that needs verification.

## Current Status

### Task #1: Verify Zod schemas ✅
All required schemas are present. No issues found.

### Task #2-3: Auth routes wired to InsForge ✅
- Login, Register, Session, Logout all use correct InsForge auth endpoints
- Minor type mismatch: `emailVerified` field not in DanClaw User type

### Task #4-5: Missing routes ✅ ALL EXIST
- `/api/deployments/[id]/start` ✅
- `/api/deployments/[id]/stop` ✅
- `/api/deployments/[id]/restart` ✅ (already had DELETE via route.ts)
- `/api/user/profile` ✅
- `/api/user/usage` ✅

### Task #6: WebSocket ⚠️ UNVERIFIED
- ChatWebSocket class exists and looks well-structured
- URL pattern uses a guess: `${INSFORGE_REALTIME}/realtime?deployment_id=${deploymentId}`
- Needs actual InsForge realtime endpoint verification

## Status Summary

| Task | Status | Notes |
|------|--------|-------|
| Zod schemas | ✅ Complete | All present |
| Deployments route | ✅ Complete | Wired to InsForge |
| Auth routes | ✅ Complete | Correct paths |
| Start/Stop/Restart routes | ✅ Complete | All exist |
| User profile/usage | ✅ Complete | Both exist |
| WebSocket | ⚠️ Unverified | URL pattern is a guess |

## Next Steps for Phase 2

1. Add `emailVerified?: boolean` to DanClaw `User` type
2. Verify InsForge realtime WebSocket endpoint pattern
3. Consider if start/stop/restart need to call actual InsForge functions
4. Verify the database record CRUD paths actually work

## Session End: 22:00 UTC