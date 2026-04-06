# RESEARCH: Convex.dev as Backend Alternative to InsForge

**Date:** 2026-04-07  
**Researcher:** DanLab Backend Architecture Researcher  
**Workspace:** `/home/workspace/danclaw/`

---

## Executive Summary

**TL;DR:** Convex.dev is a TypeScript-first reactive backend platform with excellent real-time capabilities, but it **cannot host Docker containers** for agent runtimes like OpenClaw/SwarmClaw. It is serverless functions only. For DanClaw's agent hosting needs, look at **Appwrite**, **Supabase self-hosted**, or **direct PostgreSQL on Fly.io/Koyeb**.

---

## 1. Convex.dev Deep Dive

### 1.1 Pricing Tiers (Official)

| Tier | Price | Developers | Key Limits |
|------|-------|-----------|------------|
| **Free & Starter** | $0/mo + pay-as-you-go | 1-6 | 40 deployments, 1K concurrent sessions, 16 concurrent queries, 64 concurrent actions |
| **Professional** | $25/dev/mo | 1-20 | 300 deployments, 10K sessions, 256 queries, 512 actions |
| **Business & Enterprise** | $2,500/mo minimum | 50+ | Unlimited deployments, custom SLAs, SAML/SSO, dedicated infra |

**Resource Pricing (Professional):**
- Function calls: 25M included, $2/M overage
- Action compute: 250 GB-hours included, $0.30/GB-hour overage
- Database storage: 50GB total, $0.20/GB/mo
- File storage: 100GB total, $0.03/GB/mo
- Database I/O: 50GB/mo, $0.20/GB
- Data egress: 50GB/mo, $0.12/GB[^1]

### 1.2 Real-time Capabilities

Convex's core differentiator is its **reactive database** with WebSocket-based sync:

- **Automatic change propagation**: When database data changes, Convex automatically pushes updates to all connected clients via persistent WebSocket connections
- **Query reactivity**: Queries re-run automatically when underlying data changes
- **Dependency tracking**: Convex tracks which queries depend on which data, only pushing relevant updates
- **Latency**: Sub-second typical; built on WebSocket connections maintained to Convex Cloud
- **Use cases**: Chat, collaborative editing, live dashboards, notifications[^2][^3]

### 1.3 Database Model

- **Document-relational hybrid**: Convex stores data as documents but supports relational-like queries with indexes
- **TypeScript-first**: Queries and mutations written in TypeScript, not SQL
- **Schema validation**: Schema defined in `schema.ts`, automatically generates TypeScript types
- **Transactions**: All transactions are serializable, ensuring strong consistency
- **Indexes**: Supports custom indexes for efficient querying[^2][^3]

### 1.4 TypeScript/Next.js Integration Quality

**Excellent DX:**
- End-to-end type safety from database to frontend
- `useQuery`, `useMutation` hooks for React/Next.js
- Auto-generated TypeScript types from schema
- Same import pattern whether in Next.js, Expo, or other frameworks
- TypeScript validation at compile time, not runtime[^2]

```typescript
// Example from Convex docs - query in Next.js
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";

const todos = useQuery(api.todos.getTodos);
```

### 1.5 Authentication System

- **Built-in Convex Auth**: Pre-built auth with 80+ OAuth integrations
- **Manual configuration required**: Unlike Firebase, no one-click auth setup
- **JWT-based**: JSON Web Token support for secure sign-ups/logins
- **Custom implementation**: Authorization logic written in TypeScript functions
- **SAML/SSO**: Available on Business/Enterprise tier only[^1][^4]

### 1.6 Edge Functions / Serverless Capabilities

- **Node.js actions**: Serverless functions written in TypeScript
- **Cron jobs**: Built-in scheduling for periodic tasks
- **HTTP endpoints**: Can expose API routes
- **AI workflow integration**: Built-in support for AI/LLM integrations
- **NOT edge-native**: Runs on Convex's serverless infrastructure, not at edge locations like Cloudflare Workers[^1]

### 1.7 Deployment Model

- **Managed cloud**: Convex Cloud handles infrastructure, scaling, maintenance
- **Self-hosted option**: Open-source backend available via Docker (Apache 2.0 license)
- **Preview deployments**: Automatic staging environments for testing
- **No bare metal/VMs**: Pure serverless model unless self-hosted[^1][^5]

### 1.8 Docker Container Support — CRITICAL QUESTION

**❌ NO, Convex cannot host Docker containers for agent runtimes.**

Convex's self-hosted option is a **Docker Compose setup for the Convex backend itself** — it does NOT provide general-purpose container hosting.

What Convex provides:
- TypeScript functions (serverless)
- Scheduled cron jobs
- Background actions

What Convex does NOT provide:
- General-purpose Docker/container hosting
- VM instances
- Long-running processes
- Custom binary execution environments

**You cannot run OpenClaw, SwarmClaw, or Paperclip agents inside Convex.** These need full runtime environments with persistent processes, not serverless function execution.[^5][^6]

### 1.9 File Storage Capabilities

- **S3-compatible**: Built-in file storage using S3-compatible backends
- **CDN delivery**: Public CDN links for high-speed content delivery
- **Image transformations**: Built-in image resizing/processing
- **Storage limits**: 1GB (Free) to 100GB+ (Pro) included storage[^1]

### 1.10 Rate Limits and API Quotas

| Resource | Free/Starter | Professional |
|----------|--------------|--------------|
| Deployments | 40 | 300 |
| Concurrent sessions | 1,000 | 10,000 |
| Concurrent queries | 16 | 256 |
| Concurrent actions | 64 | 512 |
| Function calls | 1M/mo (free) / 25M/mo (pro) | 25M included |
| Database I/O | 1GB/mo | 50GB/mo |

---

## 2. InsForge vs Convex Comparison

### 2.1 Cost at Scale

| Users | InsForge (Pro) | Convex (Professional) |
|-------|----------------|----------------------|
| **100 users** | $20/mo + overages | ~$50-100/mo (2-4 devs × $25) |
| **1,000 users** | $20/mo + significant overages | ~$150-300/mo |
| **10,000 users** | $20/mo + large overages | ~$500-1,500/mo+ |

**InsForge**: Flat $20/mo for Pro is attractive, but AI credits ($0.1/credit), bandwidth ($0.09/GB), storage ($0.021/GB) add up at scale.

**Convex**: Per-developer pricing ($25/dev/mo) scales with team size, not user count. Usage overages apply but can be predictable.

**Winner for small teams**: InsForge (simpler pricing)  
**Winner for large teams**: Convex (predictable per-seat model)

### 2.2 Developer Experience (TypeScript SDK, DX)

| Aspect | InsForge | Convex |
|--------|----------|--------|
| TypeScript-first | ✅ Yes | ✅ Yes |
| Auto-generated types | ✅ Via schema | ✅ From schema.ts |
| Real-time hooks | ⚠️ Limited | ✅ Excellent |
| MCP server | ✅ Built-in (AI agent optimized) | ❌ No |
| CLI tools | ✅ insforge CLI | ✅ Convex CLI |
| Learning curve | Low (AI-centric) | Medium (reactive paradigm) |

**InsForge wins for AI coding agents** due to MCP server integration. Convex wins for human developer experience with reactive data binding.[^7][^8]

### 2.3 Real-time Chat Support for DanClaw

| Feature | InsForge | Convex |
|---------|----------|--------|
| WebSocket support | ✅ Yes | ✅ Yes (built-in) |
| Real-time subscriptions | ✅ Yes | ✅ Yes (automatic) |
| Message persistence | ✅ PostgreSQL | ✅ Convex DB |
| React integration | ✅ Yes | ✅ Excellent |
| Scalability | Medium | High |

**Convex wins for real-time chat** due to automatic reactivity — no manual WebSocket management needed. InsForge requires more manual implementation.[^2][^3]

### 2.4 Container/VM Hosting Capability (CRITICAL)

| Platform | Container Hosting | Agent Runtime Support |
|----------|------------------|----------------------|
| **InsForge** | ❌ No (managed BaaS) | ❌ No native agent hosting |
| **Convex** | ❌ No (serverless only) | ❌ No |
| **Appwrite** | ✅ Yes (Docker self-host) | ✅ Can host agents |
| **Supabase** | ⚠️ Self-hosted (Docker) | ⚠️ Limited (Edge Functions) |
| **Direct PostgreSQL + Fly.io** | ✅ Yes (Docker) | ✅ Full support |

**Neither InsForge nor Convex support container-based agent hosting.**

For OpenClaw/SwarmClaw/Paperclip agents, you need:
1. **Appwrite** (self-hosted Docker) — Most promising alternative
2. **Supabase self-hosted** — Docker Compose available
3. **Direct Fly.io/Koyeb deployment** — Full control[^5][^6]

### 2.5 Custom Deployment Support

| Platform | Self-Hosted | Cloud | Custom Infra |
|----------|-------------|-------|--------------|
| InsForge | ❌ No | ✅ Yes | ❌ No |
| Convex | ✅ Docker | ✅ Yes | ⚠️ Limited |
| Appwrite | ✅ Docker | ✅ Yes | ✅ Yes |
| Supabase | ✅ Docker | ✅ Yes | ✅ Yes |

### 2.6 Vendor Lock-in Risk

| Platform | Lock-in Level | Escape Hatch |
|----------|--------------|--------------|
| InsForge | **HIGH** — MCP-specific, managed | Poor (no export) |
| Convex | **MEDIUM** — TypeScript reactive model | Good (open-source, export schema) |
| Appwrite | **LOW** — Open-source Docker | Excellent |
| Supabase | **LOW** — Open-source, PostgreSQL | Excellent |

---

## 3. Alternative Backend Candidates

### 3.1 Appwrite (Open-Source, Docker-Based)

| Aspect | Details |
|--------|---------|
| **Self-hosting** | Full Docker deployment, same features as cloud |
| **Database** | Document-oriented, relational-like queries |
| **Auth** | Built-in OAuth, MFA, SAML (Enterprise) |
| **Real-time** | WebSocket across entire platform (auth, storage, messaging) |
| **Functions** | Serverless (multiple runtimes) |
| **Containers** | ❌ No general container hosting, but self-hostable |
| **Pricing** | Free tier: 75K MAU, 5GB bandwidth, 2GB storage |
| **MCP** | ✅ Yes (AI coding assistant integration) |

**Best for**: Teams needing full self-hosted control, Docker-based deployment, AI agent integration via MCP[^6][^9]

### 3.2 Supabase (PostgreSQL, Realtime, Edge Functions)

| Aspect | Details |
|--------|---------|
| **Database** | PostgreSQL (full SQL support) |
| **Auth** | Built-in with social providers, magic links |
| **Real-time** | WebSocket subscriptions |
| **Self-hosting** | Docker Compose available |
| **Edge Functions** | Deno-based serverless |
| **Storage** | S3-compatible |
| **Pricing** | Free: 50K MAU, 500MB DB, 1GB storage |

**Best for**: SQL-first teams, complex queries, PostgreSQL ecosystem[^10][^11]

### 3.3 Nhost (Hasura + PostgreSQL)

| Aspect | Details |
|--------|---------|
| **GraphQL** | Hasura-powered instant GraphQL API |
| **Database** | PostgreSQL |
| **Auth** | Built-in |
| **Real-time** | GraphQL subscriptions |
| **Self-hosting** | Docker-based |

**Best for**: GraphQL-native architectures, JAMstack[^12]

### 3.4 PocketBase (Go, SQLite, Single-File)

| Aspect | Details |
|--------|---------|
| **Language** | Go |
| **Database** | SQLite |
| **Size** | Single binary (~15MB) |
| **Auth** | Built-in |
| **Real-time** | WebSocket subscriptions |
| **Self-hosting** | Trivial (one binary) |

**Best for**: Solo devs, micro-SaaS, lightweight applications[^12]

### 3.5 Direct PostgreSQL + Prisma on Fly.io/Koyeb

| Aspect | Details |
|--------|---------|
| **Database** | PostgreSQL (your own) |
| **ORM** | Prisma |
| **Hosting** | Fly.io or Koyeb |
| **Containers** | ✅ Full Docker support |
| **Agents** | ✅ Full support for OpenClaw/SwarmClaw |
| **Cost** | ~$5-20/mo for small, scales with usage |

**Best for**: Full control, agent runtime hosting, production at scale[^13]

---

## 4. Recommendation

### For DanClaw's Agent Runtime Needs

**The critical requirement is Docker/container hosting for OpenClaw, SwarmClaw, and Paperclip agents.**

**Recommended Architecture:**

| Component | Recommended Platform | Reason |
|-----------|---------------------|--------|
| Agent Runtime | **Fly.io or Koyeb** (Docker) | Full container support, persistent processes |
| Backend API | **Appwrite** (self-hosted) or **Supabase** | MCP support, real-time, auth |
| Database | **PostgreSQL** (via Appwrite/Supabase or direct) | Relational, production-grade |
| Real-time Chat | **Appwrite** or **Convex** | WebSocket support |

### Platform Recommendations by Use Case

1. **If you prioritize AI agent integration**: InsForge or Appwrite (MCP support)
2. **If you prioritize real-time chat**: Convex or Appwrite
3. **If you need Docker for agents**: Appwrite (self-hosted) + Fly.io for agent containers
4. **If you want PostgreSQL**: Supabase or direct PostgreSQL on Fly.io

### Decision Matrix

| Priority | Best Choice |
|----------|-------------|
| Agent runtime (Docker) | Fly.io/Koyeb + Appwrite |
| AI agent context (MCP) | InsForge or Appwrite |
| Real-time reactivity | Convex |
| Open-source, self-host | Appwrite or Supabase |
| TypeScript-first DX | Convex |
| SQL/relational | Supabase or direct PostgreSQL |

---

## 5. Critical Finding: Convex Cannot Host Agents

**Convex.dev is NOT suitable for hosting DanClaw's agents (OpenClaw, SwarmClaw, Paperclip).**

**Why:**
1. Convex is a **serverless function platform** — no persistent container execution
2. Agents require **long-running processes** with persistent state
3. Agents need **Docker container hosting**, not serverless functions
4. Convex's "self-hosting" is for the Convex backend itself, not general workloads

**You must use a separate platform for agent hosting** (e.g., Fly.io, Koyeb, Railway, or direct VPS) and connect it to your backend via API.[^5][^6]

---

## Sources

[^1]: https://www.convex.dev/pricing
[^2]: https://www.convex.dev/
[^3]: https://stack.convex.dev/best-real-time-databases-compared
[^4]: https://senacor.blog/is-backend-as-a-service-baas-enterprise-ready-a-hands-on-review-of-convex-and-supabase/
[^5]: https://github.com/get-convex/convex-backend/blob/main/self-hosted/README.md
[^6]: https://docs.convex.dev/self-hosting
[^7]: https://insforge.dev/blog
[^8]: https://www.saasworthy.com/product/insforge-dev/pricing
[^9]: https://appwrite.io/docs/advanced/self-hosting
[^10]: https://supabase.com/pricing
[^11]: https://www.supadex.app/blog/how-to-self-host-supabase-(without-losing-your-mind)
[^12]: https://uibakery.io/blog/supabase-alternatives
[^13]: https://fly.io/docs/