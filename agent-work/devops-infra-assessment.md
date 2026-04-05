# DevOps Infrastructure Assessment
**Agent**: DevOps Engineer
**Subject**: Fly.io + InsForge vs Pure InsForge

## User Concern
InsForge lacks virtual machine sandboxing for agent containers. Fly.io provides native sandboxing.

## Architecture Options

### Option A: Hybrid — Fly.io (Agents) + InsForge (DB/Auth)
**Pros:**
- ✅ Real VM isolation — user agents run in firecracker microVMs
- ✅ Security — if an agent goes rogue, it can't break out
- ✅ InsForge handles DB, Auth, Realtime beautifully
- ✅ Fly.io has native Postgres — could replace InsForge DB later

**Cons:**
- ❌ Two platforms to manage
- ❌ Fly.io costs money (min $5/mo per agent)
- ❌ No native MCP bridge between Fly and InsForge

### Option B: Fly.io + Convex
**Pros:**
- ✅ Convex has amazing DX
- ✅ Fly.io sandboxing

**Cons:**
- ❌ Convex doesn't do Auth natively (need Clerk/Clerk alternative)
- ❌ Convex is expensive for large datasets
- ❌ No container deployment built-in

### Option C: Pure InsForge + Docker Sandbox
**Pros:**
- ✅ One platform
- ✅ Free tier covers MVP
- ✅ Native MCP for AI integration

**Cons:**
- ❌ No VM sandboxing (container only)
- ❌ Security risk if running untrusted user code

## DevOps Recommendation
**Use Hybrid: Fly.io for Agent Containers + InsForge for DB/Auth**

Rationale:
1. AI agents run untrusted code — VM isolation is non-negotiable for production
2. InsForge excels at DB/Auth/Realtime but not container orchestration
3. Fly.io has a generous free allowance for testing
4. We can start with InsForge containers for MVP, migrate to Fly.io for launch

This is the most secure AND scalable architecture.

## Infrastructure Diagram (Recommended)
```
Users → DanClaw App (Next.js/Expo)
         ↓
    InsForge (Auth + DB + Realtime)
         ↓
    Fly.io (Agent Containers with Firecracker VMs)
         ↓
    OpenRouter (AI Models)
```

## Cost Estimate
- InsForge Free: $0 (DB + Auth)
- Fly.io Hobby: $5-10/mo for sandboxed agent runners
- OpenRouter: Free tier for MVP

Total MVP Cost: ~$5-10/mo — acceptable.
```
