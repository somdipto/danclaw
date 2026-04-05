# Expo Developer Status — DanClaw Mobile

## Audit Date: 2026-04-05 00:15 UTC

## Status: ✅ ALL PHASE 1 WIRING COMPLETE

All 6 tasks already properly wired from previous sessions. Verified all imports and hook usage against current source.

---

## Screen-by-Screen Status

### Dashboard (index.tsx) — ✅ Wired
- `useDeployments()` → real deployment list from InsForge API
- `useUserProfile()` → user name/greeting
- Skeleton loading states, error state with "Sign In" redirect
- Deployment cards with real status dots, stats (requests, memory, uptime)
- FAB navigates to `/deploy`

### Deploy (deploy.tsx) — ✅ Wired
- `useCreateDeployment()` mutation from `@danclaw/api`
- 3-step wizard: Model → Channel → Review
- `router.replace(\`/(tabs)/provisioning?id=${depId}\`)` on success
- `Alert.alert()` on error from `result.error.message`

### Chat List (chat/index.tsx) — ✅ Wired
- `useDeployments()` → deployment list
- Empty state → navigate to deploy

### Chat Room (chat/[id].tsx) — ✅ Wired
- `useDeployment(id)` → deployment header info
- `useMessages(id)` → historical messages on mount
- `ChatWebSocket` → real-time WebSocket for live messages
- Scroll-to-end, connection state indicator, input bar

### Settings (settings.tsx) — ✅ Wired
- `useUserProfile()` → user name, email, tier badge
- `dancclawClient.updateProfile({ openrouter_token })` → save token
- Sign out: `dancclawClient.signOut()` + SecureStore delete → `(auth)/login`

### Provisioning (provisioning.tsx) — ✅ Exists + Functional
- `useDeployment(id, { refetchInterval: 5000 })` → polls every 5s
- 5-step progress animation (queued → building → pulling → starting → ready)
- `STATUS_TO_STEP` maps deployment status strings to step indices
- Auto-navigates to `/(tabs)/chat/${id}` when `status === 'running'`
- Error and success states handled

### Auth — ✅ Verified
- **login.tsx**: `useLogin()` mutation → `result.data.token` → SecureStore → `router.replace('/(tabs)')`
- **register.tsx**: `dancclawClient.register()` → `result.data.token` → SecureStore → `router.replace('/(tabs)')`
- Root `_layout.tsx`: checks SecureStore token on boot → routes to `(tabs)` or `(auth)/login`

---

## API Package (`@danclaw/api`)
- `DanClawClient` class with full CRUD: auth, deployments, messages, billing stubs
- TanStack Query v5 hooks: `useDeployments`, `useCreateDeployment`, `useMessages`, `useLogin`, `useUserProfile`, etc.
- `ChatWebSocket` class: connect/disconnect, send, onMessage, onStateChange, auto-reconnect
- Env: `EXPO_PUBLIC_INSFORGE_URL`, `EXPO_PUBLIC_INSFORGE_ANON_KEY`

---

## Known Observations (No Action Needed)
1. **Activity feed** on Dashboard renders `ActivityItem` but no `useActivity` hook exists — UI component present, data source stub
2. **OAuth stubs** in login/register are marked as production-ready comments — Google/Apple OAuth needs `expo-auth-session` config for production
3. **Provisioning `STATUS_TO_STEP`**: maps generic status strings to step indices — aligned with actual `DeploymentStatus` values from shared types

---

## Env Vars (Confirmed Set)
```
EXPO_PUBLIC_INSFORGE_URL=https://tq33kiup.ap-southeast.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=ik_ac021317adcb7995b6f8e53075757fc1
```

---

## Next Steps (Out of Phase 1 Scope)
- Push notifications via `expo-notifications`
- RevenueCat billing integration
- Deploy tier selector with real pricing tiers
- Activity feed data source

👾
