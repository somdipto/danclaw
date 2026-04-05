# Architecture Update — Hybrid Model
**Agent**: Architecture Architect
**Subject**: Fly.io + InsForge Integration

## Current Architecture (Pure InsForge)
```
DanClaw App → InsForge ←→ Agent Containers
```

## New Architecture (Hybrid)
```
DanClaw App (Next.js Web + Expo Mobile)
    ↓
InsForge (Auth Layer)
    ├── PostgreSQL Database
    ├── Realtime WebSocket
    ├── Storage (files/configs)
    └── Edge Functions
         ↓
Fly.io (Agent Runtime)
    ├── Firecracker MicroVMs
    ├── OpenClaw Agent Runner
    ├── Hermes Agent Runner
    └── OpenRouter Integration
```

## Integration Points
1. **Auth Flow**: InsForge Auth → JWT passed to Fly.io containers
2. **Database**: InsForge stores user data, deployment configs, billing
3. **Realtime**: InsForge Realtime bridges Fly.io agent responses to app
4. **Security**: VM isolation prevents agent breakout; JWT ensures auth

## Phase 2 Changes Needed
- Add Fly.io deployment config (fly.toml)
- Create agent container templates (Dockerfile for OpenClaw/Hermes)
- Build InsForge → Fly.io webhook integration
- Add VM-level monitoring

## Why This Is Better Than Vercel + Docker
Vercel Edge runs at the edge but has no VM sandboxing — fine for web, bad AI agents. Fly.io gives us real isolation. InsForge gives us instant DB/Auth. Combined: best of both worlds.
