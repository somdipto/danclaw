# DanClaw — Setup & Deployment Guide

## What's Done ✅

The backend is already connected and configured:
- **InsForge Project**: https://tq33kiup.ap-southeast.insforge.app
- **Database**: 4 tables (users, deployments, messages, activity) with full RLS
- **Schema**: Indexes, triggers, foreign keys all set up
- **OAuth**: GitHub + Google login enabled
- **AI Models**: Claude, GPT, Gemini, DeepSeek, Grok all available

---

## One-Time Setup (5 minutes)

### Option A: Vercel + GitHub (Recommended)

**Step 1:** Push to GitHub
```bash
cd danclaw
git remote set-url origin https://YOUR_GITHUB_PAT@github.com/somdipto/danclaw.git
git push origin main
```

**Step 2:** Import to Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Select `somdipto/danclaw`
4. Framework: Next.js
5. Root Directory: `apps/web`
6. Add Environment Variables:
   - `NEXT_PUBLIC_INSFORGE_URL` = `https://tq33kiup.ap-southeast.insforge.app`
   - `NEXT_PUBLIC_INSFORGE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzg5OTR9.QMg_q9OHAX4XP1i4QzlBc_EccJfSxa6BNXY9rdgEKhQ`
7. Deploy!

**Step 3:** Add GitHub Secrets for CI/CD
In GitHub repo Settings → Secrets → Actions:
- `INSFORGE_KEY` = `ik_ac021317adcb7995b6f8e53075757fc1`
- `VERCEL_TOKEN` = (from vercel.com/settings/tokens)
- `VERCEL_ORG_ID` = (from vercel.com/settings/general)
- `VERCEL_PROJECT_ID` = (from your project settings)

---

### Option B: Local Development

```bash
# Clone fresh
git clone https://github.com/somdipto/danclaw.git
cd danclaw

# Install dependencies
pnpm install

# Add credentials
cp apps/web/.env.local.example apps/web/.env.local
# Edit .env.local with:
# NEXT_PUBLIC_INSFORGE_URL=https://tq33kiup.ap-southeast.insforge.app
# NEXT_PUBLIC_INSFORGE_ANON_KEY=<get from InsForge dashboard>

# Run locally
pnpm dev
```

---

## InsForge MCP Connection (For AI Coding)

To connect InsForge MCP to Claude Code/Cursor/VS Code:
```bash
npx add-mcp https://mcp.insforge.dev/mcp
```

Or use the InsForge CLI:
```bash
npm install -g @insforge/cli
npx @insforge/cli link --project-id 41be1d6f-98c3-4e78-afad-65b6ed3bed91
```

---

## Project Structure

```
danclaw/
├── apps/
│   ├── web/              # Next.js 14 app
│   │   ├── src/app/     # App Router pages
│   │   │   ├── (auth)/  # Login, register
│   │   │   └── dashboard/  # Dashboard, deploy, chat
│   │   └── .env.local   # InsForge credentials
│   └── mobile/          # Expo SDK 55 (Phase 2)
├── packages/
│   ├── shared/          # Types, constants, validators, mock data
│   └── api/             # DanClawClient, hooks, WebSocket
└── docs/                # Architecture, schema, roadmap
```

---

## Phase 2: What's Next

- [ ] Edge functions for deployment lifecycle (start/stop/restart)
- [ ] Real-time chat via InsForge Realtime
- [ ] AI integration with OpenRouter
- [ ] Expo mobile app
- [ ] OpenClaw + SwarmClaw + Paperclip + Hermes agents

---

## Troubleshooting

### "Authentication not working"
- Make sure InsForge Auth is enabled in project settings
- Check OAuth providers (GitHub, Google) are configured

### "Database table not found"
- Tables should auto-exist. If not, run via InsForge dashboard SQL editor or CLI:
  ```bash
  npx @insforge/cli db push
  ```

### "CORS errors"
- Add your Vercel domain to InsForge allowed origins in project settings

### "MCP tools not working"
- Re-authenticate: `npx @insforge/cli auth`
