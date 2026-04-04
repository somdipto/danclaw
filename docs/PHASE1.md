# DanClaw Phase 1 — Build Plan

## Org Structure

- **CEO**: Som (Human) — Strategic decisions, vision
- **CTO**: Dan — Architecture, coordination
  - **Backend Dev** — InsForge Functions, API, WebSocket
  - **Frontend Dev (Web)** — Next.js 14 dashboard
  - **Expo Dev** — Mobile app (iOS + Android)
  - **UI/UX Designer** — Design system, components
  - **Database Dev** — Schema, migrations, queries
  - **Cloud/DevOps** — InsForge deployment, CI/CD

## Agent Runtime Pipeline

```
PHASE 1 (MVP — NOW):
├── OpenClaw — Base agent anyone deploys first
│   • Connects to Telegram, Discord, WhatsApp
│   • Self-installing tools, skill system (ClawHub)
│   • Built with Node.js — runs on your own server
│
└── Hermes — Personal agent (that's Dan!)
    • Three-level memory (session, persistent, skill)
    • ReAct loop implementation
    • Self-improving — creates skills after complex tasks
    • 40+ bundled skills (MLOps, GitHub, research, etc.)

PHASE 2:
├── SwarmClaw — Multi-agent orchestration layer
│   • Coordinates multiple OpenClaw/Hermes instances
│   • Inter-agent communication
│
└── Hermes (additional instances)

PHASE 3:
├── Paperclip — Company/team management
│   • Team workspaces, per-agent permissions
│   • Usage analytics, billing
│
└── SwarmClaw + Paperclip combo
```

## Phase 1 Deliverables (6 weeks)

**Goal**: Anyone can fork/spin up DanClaw and deploy their first AI agent.

### Week 1-2: Foundation
- [ ] InsForge project setup + schema (DB Dev)
- [ ] Auth flow — Google OAuth (Backend Dev)
- [ ] API skeleton — Deploy, Chat, User endpoints (Backend Dev)
- [ ] CI/CD pipeline (DevOps)
- [ ] Design system docs (UI/UX)

### Week 3-4: Core Features
- [ ] Real deploy flow — container provisioning
- [ ] WebSocket chat — real-time messaging
- [ ] Web dashboard — wired to real API
- [ ] Mobile app — wired to real API

### Week 5-6: Polish
- [ ] Provisioning flow with status updates
- [ ] Settings screen with API key management
- [ ] Error handling + loading states
- [ ] Documentation

## Agent Cron Schedule

Each agent runs every 2 hours with staggered starts:

| Time | Agent | Task |
|------|-------|------|
| Every 2h (at :00) | CTO Dan | Coordinate, report to CEO |
| Every 2h (at :15) | Backend Dev | API, DB, auth wiring |
| Every 2h (at :30) | Frontend Dev (Web) | UI wiring |
| Every 2h (at :45) | UI/UX, DB Dev, DevOps, Expo | Design, schema, CI/CD, mobile |

## What's Already Done

- [x] Complete database schema (SCHEMA.sql with RLS, indexes, triggers, seed data)
- [x] All TypeScript types (packages/shared/src/types/)
- [x] All constants (AI_MODELS, PRICING_TIERS, CHANNELS, etc.)
- [x] DanClawClient + TanStack Query hooks
- [x] InsForge server wrapper (auth, DB, session cookies)
- [x] API routes skeleton (auth, deployments, user)
- [x] Web app pages (dashboard, deploy wizard, chat, settings)
- [x] Mobile app pages (auth screens, tab nav, deploy, chat, settings)
- [x] Validators (Zod schemas) — 259 lines

## What's Missing

### Backend
- [ ] Wire API routes to real InsForge client
- [ ] Create deployment start/stop/restart/delete routes
- [ ] Create user profile/usage routes
- [ ] Wire chat WebSocket

### Frontend Web
- [ ] Verify dashboard data flow
- [ ] Create provisioning page with polling
- [ ] Wire chat to WebSocket
- [ ] Wire settings to real API
- [ ] Auth flow end-to-end

### Frontend Mobile
- [ ] Wire all screens to real API
- [ ] Create provisioning screen
- [ ] Auth flow

### DevOps
- [ ] GitHub Actions CI workflow
- [ ] Dockerfile for OpenClaw runtime
- [ ] Deployment guide
- [ ] Env var audit

### UI/UX
- [ ] DESIGN.md
- [ ] COMPONENTS.md
- [ ] UX review of deploy + chat flows
