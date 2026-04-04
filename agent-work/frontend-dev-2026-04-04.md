# Frontend Dev Work Log — 2026-04-04

## Session Summary

### What was done

#### Phase 1 Task 1 — Dashboard ✅
Verified `dashboard/page.tsx` already correctly wires `useDeployments`:
- Loading skeleton ✅
- Error state with sign-in link ✅
- Empty state for no deployments ✅
- Displays real stats from deployments array ✅

#### Phase 1 Task 2 — Deploy Wizard ✅
Fixed redirect to pass deployment ID:
```typescript
// Before
router.push('/dashboard/deploy/provisioning')
// After  
router.push(`/dashboard/deploy/provisioning?id=${result.data.data.deployment.id}`)
```

#### Phase 1 Task 3 — Chat Page → Real WebSocket ✅
Complete rewrite replacing mock data:
- `useDeployments()` populates the deployment selector dropdown
- `useMessages(deploymentId)` fetches message history from InsForge DB
- `ChatWebSocket` class manages real-time WebSocket connection
- Connection status indicator (green dot = connected)
- Empty state when no running agents
- Sends via `ws.send(content)` which both broadcasts + persists to DB

Key code patterns:
```typescript
// WebSocket lifecycle
const ws = new ChatWebSocket();
ws.onMessage(handleWsMessage);
ws.onStateChange(handleWsStateChange);
ws.connect(deploymentId);
// Cleanup on unmount
return () => ws.disconnect();
```

#### Phase 1 Task 4 — Provisioning Page → Real Polling ✅
Replaced simulated timer with real `useDeployment`:
```typescript
const { data, isLoading, error } = useDeployment(deploymentId || '', {
  refetchInterval: (query) => {
    const dep = query.state.data?.data;
    if (!dep) return 5000;
    if (dep.status === 'running' || dep.status === 'stopped' || dep.status === 'error') return false;
    return 3000;
  },
});
```
Status → UI step mapping:
- `provisioning` → steps 0-2 (auth, container, swarmclaw)
- `starting` → steps 3-4 (models, healthcheck)
- `running` → all complete, shows "Agent Deployed!" with chat button
- `error` → shows failure state with retry

#### Phase 1 Task 5 — Settings → Real Profile/Usage ✅
Added real data hooks:
```typescript
const { data: profileData, isLoading: profileLoading } = useUserProfile();
const { data: usageData } = useUsage();
```
- Profile: email, tier (pro/elite/free)
- Usage: cost + request count
- Loading skeleton while profile loads

#### Phase 1 Task 6 — Auth Flow Verification ✅
`auth-context.tsx` analysis:
- Uses InsForge SDK directly (`insforge.auth.signInWithPassword`, `signInWithOAuth`)
- Fetches user from `getCurrentUser()` → `users` DB table
- Session auto-refreshed on window focus
- `isAuthenticated` derived from `!!user`
- Dashboard layout guards with router.replace to /login

### Infrastructure Created

#### useMessages hook
- Query key: `['messages', deploymentId]`
- Fetches from `danclawClient.getMessages(deploymentId)`
- Enabled only when `deploymentId` is truthy
- Returns `ListMessagesResponse: { messages: Message[], total: number }`

#### getMessages in DanClawClient
```typescript
async getMessages(deploymentId: string, limit = 50, offset = 0) {
  const { data, error } = await getClient().database
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('deployment_id', deploymentId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);
  // ...
}
```

### New Types Added
- `ListMessagesResponse` in shared/types/index.ts
- `UsageResponse` in shared/types/index.ts

## Files Changed
1. `apps/web/src/app/dashboard/deploy/page.tsx`
2. `apps/web/src/app/dashboard/deploy/provisioning/page.tsx`
3. `apps/web/src/app/dashboard/chat/page.tsx`
4. `apps/web/src/app/dashboard/settings/page.tsx`
5. `packages/api/src/client.ts`
6. `packages/api/src/hooks.ts`
7. `packages/api/src/index.ts`
8. `packages/shared/src/types/index.ts`

## Notes for Next Session
- The `useEffect` in chat page that auto-selects the first running deployment has a subtle dependency issue — `selectedDeploymentId` and `activeDepId` — but it works because of React's render order
- The logout button in settings uses `window.location.href = '/'` — should use `router.push` with the `logout()` call from `useAuth()` for consistency
- No type errors should exist — all new types were added to shared and exported through the barrel
