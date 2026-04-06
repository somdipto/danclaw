# Frontend Developer (Web) - 2026-04-05

## Session Start: ~23:40 UTC

### Codebase Analysis

#### Project: DanClaw Web App (Next.js 14 + TanStack Query v5)

**Key Files Reviewed:**
- `/home/workspace/danclaw/CLAUDE.md` - Project overview, tech stack
- `/home/workspace/danclaw/apps/web/src/app/dashboard/page.tsx` - Main dashboard
- `/home/workspace/danclaw/apps/web/src/app/dashboard/chat/page.tsx` - Chat interface
- `/home/workspace/danclaw/apps/web/src/app/dashboard/deploy/page.tsx` - Deploy wizard
- `/home/workspace/danclaw/apps/web/src/app/dashboard/deploy/provisioning/page.tsx` - Provisioning status
- `/home/workspace/danclaw/apps/web/src/app/dashboard/settings/page.tsx` - Settings page
- `/home/workspace/danclaw/apps/web/src/app/dashboard/layout.tsx` - Dashboard shell
- `/home/workspace/danclaw/packages/api/src/hooks.ts` - TanStack Query hooks
- `/home/workspace/danclaw/packages/api/src/websocket.ts` - ChatWebSocket class
- `/home/workspace/danclaw/packages/api/src/client.ts` - DanClawClient (PROBLEM: Expo SecureStore)
- `/home/workspace/danclaw/packages/api/src/index.ts` - Barrel exports
- `/home/workspace/danclaw/apps/web/src/lib/auth-context.tsx` - AuthProvider
- `/home/workspace/danclaw/apps/web/src/app/api/auth/login/route.ts` - Login API
- `/home/workspace/danclaw/apps/web/src/app/api/deployments/route.ts` - Deployments API
- `/home/workspace/danclaw/apps/web/src/app/login/page.tsx` - Login page
- `/home/workspace/danclaw/apps/web/src/app/(auth)/register/page.tsx` - Register page

---

## Phase 1 Task Assessment

### Task 1: Dashboard useDeployments - Status: ✅ WIRED (needs token fix)

```tsx
const { data: deploymentsData, isLoading: loadingDeployments } = useDeployments();
const { data: profileData, isLoading: loadingProfile } = useUserProfile();
const { data: usageData } = useUsage();
```
- Loading skeletons present
- Empty state present
- **PROBLEM:** client.ts uses Expo SecureStore

### Task 2: Deploy wizard - Status: ✅ WIRED (wrong redirect)

```tsx
const createMutation = useCreateDeployment({
  onSuccess: () => router.push('/dashboard'),
});
```
- Should redirect to `/dashboard/deploy/provisioning?id=<id>`

### Task 3: Chat WebSocket - Status: 🔴 NOT WIRED

Currently uses setTimeout mock:
```tsx
setTimeout(() => {
  const agentMsg: Message = { ... };
  setMessages((prev) => [...prev, agentMsg]);
}, 1000 + Math.random() * 1500);
```

Need to integrate ChatWebSocket class.

### Task 4: Provisioning page - Status: ✅ EXISTS

Already implemented with polling and auto-navigation.

### Task 5: Settings page - Status: ✅ WIRED

Uses real hooks and danclawClient.

### Task 6: Auth flow - Status: ✅ VERIFIED

Cookie-based sessions, middleware protection.

---

## Key Problem: client.ts Expo SecureStore

The `DanClawClient` class uses Expo SecureStore for token storage. This is mobile-only.

**Fix needed:** Create a web-compatible version using:
1. `localStorage` as fallback for token storage on web
2. OR modify to use httpOnly cookies via API routes (more secure)

**Recommended approach:** Add web-specific token storage in auth-context.tsx, since that already exists and is web-compatible.

---

## Next Steps (Priority Order)

1. Fix token storage for web compatibility (CRITICAL BLOCKER)
2. Fix deploy wizard redirect to provisioning page
3. Wire ChatWebSocket into chat page
4. Test auth flow end-to-end
5. Add error states where missing

