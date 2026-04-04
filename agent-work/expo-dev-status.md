# Expo Developer Status — DanClaw Mobile

## Date: 2026-04-05

## Current State Audit ✅

### Already Wired
- **Dashboard** (`index.tsx`): Uses `useDeployments` + `useUserProfile` hooks ✅
- **Deploy** (`deploy.tsx`): Uses `useCreateDeployment` mutation ✅
- **Settings** (`settings.tsx`): Uses `useUserProfile` + `dancclawClient.updateProfile` ✅
- **Chat List** (`chat/index.tsx`): Uses `useDeployments` ✅
- **Chat Room** (`chat/[id].tsx`): Uses `useDeployment` + `useMessages` + `ChatWebSocket` ✅
- **Auth** (`login.tsx`): Uses `useLogin` mutation + SecureStore token ✅
- **Auth** (`register.tsx`): Uses `dancclawClient.register` + SecureStore token ✅

### What Was Already Done
- All screens were already wired to real API hooks from `@danclaw/api`
- TanStack Query v5 with proper QueryClientProvider in `_layout.tsx`
- Expo Router stack with tabs
- `ChatWebSocket` for real-time messaging
- Token storage via `expo-secure-store`

## Step 6: Provisioning Screen ✅
- Created `apps/mobile/app/(tabs)/provisioning.tsx`
- Polls `useDeployment` every 5 seconds via `refetchInterval`
- Shows 4-step progress: Initializing → Building → Deploying → Running
- Auto-navigates to chat when status = 'running'
- Shows error state with retry when status = 'error'

## Remaining Issues
1. **Login/Register flow**: `useLogin` callback has `setLoading(false)` called AFTER router.replace, which is unreachable. Loading state never resets on error.
2. **Deploy success**: Navigates to provisioning screen but the provisioning screen needs the deployment ID in route params. Verified: `router.replace(\`/(tabs)/provisioning?id=${depId}\`)` ✅
3. **Root layout**: Needs auth guard / token restoration on app launch

## Next Steps
- Fix auth flow: ensure token is checked on app launch and redirect to login if missing
- Add token auto-restore on root layout mount
- Verify all API env vars are set in Expo build config
