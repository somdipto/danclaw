# Frontend Dev (Web) — Status & Blockers

**Last Updated**: 2026-04-04 23:37 IST

## BLOCKERS — Waiting on Som

### 1. InsForge Credentials (CRITICAL)
- .env.local configured? Y/N
- Env vars needed: INSFORGE_URL, INSFORGE_ANON_KEY

### 2. Branding
- App name: DanClaw? Or something else?
- Primary color: indigo (#6366f1)? Something else?
- Logo exists? Y/N

## WORK DONE ✅
- Dashboard page: now uses useDeployments() hook (real data)
- Deploy page: wired to useCreateDeployment() mutation
- Chat page: ChatWebSocket connected to InsForge Realtime
- All UI components: Badge, Card, Button, StatsCard complete
- Mock data cleaned up (re-exports from @danclaw/shared)
- Providers (ReactQuery, ThemeProvider) done

## WORK QUEUED
- [ ] Settings page: model selection, API key input, tier management
- [ ] Provisioning page: real deployment status + progress UI
- [ ] Login/Register pages: wire to danclawClient
- [ ] Empty states: no deployments, no messages
- [ ] Real-time updates: deployment status polling
- [ ] Mobile responsiveness audit

## FILES WORKING ✅
✅ /app/dashboard/page.tsx — useDeployments hook
✅ /app/dashboard/deploy/page.tsx — useCreateDeployment mutation
✅ /app/dashboard/chat/page.tsx — ChatWebSocket + real deployments
✅ /lib/auth-context.tsx — needs review (may need update for new client)
✅ /lib/mockData.ts — clean re-export

## FILES NEEDING WORK ⬜
⬜ /app/dashboard/settings/page.tsx — not created
⬜ /app/dashboard/deploy/provisioning/page.tsx — not created
⬜ /app/login/page.tsx — needs wire
⬜ /app/register/page.tsx — needs wire
⬜ /app/providers.tsx — needs review for auth context
