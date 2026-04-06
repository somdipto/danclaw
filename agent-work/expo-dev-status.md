# Expo Developer Status — DanClaw Mobile

## Audit Summary

All files audited. Mobile app is Expo SDK 55 + Expo Router at `apps/mobile/`.

## Current State

| Screen | File | Data Layer | Status |
|--------|------|------------|--------|
| Dashboard | `(tabs)/index.tsx` | `useDeployments`, `useUserProfile` | ✅ Already wired |
| Deploy | `(tabs)/deploy.tsx` | `useCreateDeployment` | ✅ Already wired |
| Provisioning | `(tabs)/provisioning.tsx` | `useDeployment` (5s poll) | ✅ Already wired |
| Chat List | `(tabs)/chat/index.tsx` | `useDeployments` | ✅ Already wired |
| Chat Room | `(tabs)/chat/[id].tsx` | `useDeployment`, `useMessages`, `ChatWebSocket` | ✅ Already wired |
| Settings | `(tabs)/settings.tsx` | `useUserProfile`, `danchlawClient.updateProfile` | ✅ Already wired |
| Login | `(auth)/login.tsx` | `useLogin`, SecureStore token | ✅ Already wired |
| Register | `(auth)/register.tsx` | `danchlawClient.register`, SecureStore | ✅ Already wired |
| Root Layout | `app/_layout.tsx` | `configureTokenStorage` with SecureStore | ✅ Already wired |
| Tabs Layout | `(tabs)/_layout.tsx` | Static tabs | ✅ Already wired |

## API Layer

- **Client**: `packages/api/src/client.ts` — `DanClawClient` class, `configureTokenStorage`
- **Hooks**: `packages/api/src/hooks.ts` — TanStack Query v5 hooks
- **Shared types**: `packages/shared/src/types/api.ts`, `constants/index.ts`
- **WebSocket**: `packages/api/src/websocket.ts` — `ChatWebSocket` for real-time

## Key Findings

1. **Everything is already wired** — no stub/mock data found anywhere. All screens use real hooks.
2. **Token storage**: `configureTokenStorage` in `_layout.tsx` wires `expo-secure-store` to `DanClawClient`.
3. **Auth flow**: Root layout checks token → sets `initialRoute` → Stack renders `(tabs)` or `(auth)/login`.
4. **Provisiong screen**: Already polls `useDeployment` every 5s via `refetchInterval`.
5. **Register `configureTokenStorage` call**: Already present in `register.tsx` — this is correct (token sync on mount).
6. **Login `onSuccess` navigate**: Already calls `router.replace('/(tabs)')`.

## Minor Observations

- `register.tsx` calls `configureTokenStorage` directly (fine, idempotent).
- `login.tsx` doesn't call `configureTokenStorage` (relies on `_layout.tsx` — correct).
- `LoginRequest` type from `@danclaw/shared` doesn't have a default export; `login.tsx` imports `type { LoginRequest }` which works.
- `CreateDeploymentRequest` includes `openrouter_token?: string` — deploy wizard doesn't pass this (OK for now).

## Conclusion

**All 6 steps already complete.** The mobile app is fully wired to the API. No changes needed. 👾
