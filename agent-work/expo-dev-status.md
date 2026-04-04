# Expo Developer Status — DanClaw Mobile

## Date: 2026-04-05

## Audit Summary ✅

### Already Wired (No Changes Needed)
- `index.tsx` — `useDeployments` + `useUserProfile` ✅
- `deploy.tsx` — `useCreateDeployment` ✅
- `settings.tsx` — `useUserProfile` + `dancclawClient.updateProfile` ✅
- `chat/index.tsx` — `useDeployments` ✅
- `chat/[id].tsx` — `useDeployment` + `useMessages` + `ChatWebSocket` ✅
- `login.tsx` — `useLogin` + SecureStore ✅
- `register.tsx` — `dancclawClient.register` + SecureStore ✅
- `(tabs)/_layout.tsx` — Tabs ✅
- `_layout.tsx` — TanStack Query + Stack ✅

### Fixes Applied
1. **`_layout.tsx`** — Added token check on mount. Shows loading → checks SecureStore → routes to `(auth)/login` or `(tabs)`. Auth guard now working.
2. **`login.tsx`** — Fixed unreachable `setLoading(false)` by moving it before `router.replace` in error branch.

### New File Created
- **`(tabs)/provisioning.tsx`** — 4-step progress screen (Initializing → Building → Deploying → Ready). Polls `useDeployment` every 5s via `refetchInterval`. Auto-navigates to `/chat/[id]` when `status === 'running'`. Shows retry on error.

## Status
- All 6 steps complete ✅
- Mobile app fully wired to `@danclaw/api` hooks
- Real InsForge backend integration
- Token auth with SecureStore
- Provisioning flow end-to-end
