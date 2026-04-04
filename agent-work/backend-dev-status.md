# Backend Dev Status

## Summary

All required routes exist. Fixed `deployments/route.ts` POST response type.

## Routes Status

### Auth Routes
- `apps/web/src/app/api/auth/login/route.ts` ✅ Uses `authApi.signInWithPassword`, sets session cookie
- `apps/web/src/app/api/auth/register/route.ts` ✅ Creates user + users table entry, sets session cookie
- `apps/web/src/app/api/auth/logout/route.ts` ✅ Clears session cookie
- `apps/web/src/app/api/auth/session/route.ts` ✅ Validates session, returns user data

### Deployments Routes
- `apps/web/src/app/api/deployments/route.ts` ✅ Fixed: POST returns proper `CreateDeploymentResponse`, GET uses `Deployment` type
- `apps/web/src/app/api/deployments/[id]/route.ts` ✅ GET one, DELETE (with ownership check)
- `apps/web/src/app/api/deployments/[id]/start/route.ts` ✅ POST with status transition validation
- `apps/web/src/app/api/deployments/[id]/stop/route.ts` ✅ POST with status transition validation
- `apps/web/src/app/api/deployments/[id]/restart/route.ts` ✅ EXISTS

### User Routes
- `apps/web/src/app/api/user/profile/route.ts` ✅ GET + PUT profile
- `apps/web/src/app/api/user/usage/route.ts` ✅ GET usage stats
- `apps/web/src/app/api/user/activity/route.ts` ✅ EXISTS
- `apps/web/src/app/api/user/openrouter-token/route.ts` ✅ EXISTS

## SDK Status
- `packages/api/src/client.ts` ✅ Uses `@insforge/sdk` v1.2.0 (declared in package.json)
- SDK patterns look correct for InsForge SDK v1

## Fixed Issues
1. `deployments/route.ts` POST: Fixed return type `as any` → `as CreateDeploymentResponse`
2. `deployments/route.ts` GET: Fixed return type `as any` → proper `ListDeploymentsResponse`
3. `deployments/route.ts`: Removed unused `CreateDeploymentRequest` import (only used in client.ts)

## Notes
- All routes use `parseSessionCookie` from `@/lib/server/insforge` ✅
- All routes use `databaseApi` from `@/lib/server/insforge` ✅
- All routes use `apiError` / `apiSuccess` helpers ✅
- Session cookie flow is consistent across auth routes ✅
