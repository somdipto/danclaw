# DanClaw - Architecture v2.0 (InsForge.dev)

## Overview

DanClaw is a mobile-first AI agent deployment platform. Users deploy AI agents in 60 seconds with zero DevOps. One platform (InsForge.dev) handles everything.

## Why InsForge.dev?

| Feature | Traditional (Supabase + GCP) | InsForge.dev |
|---------|------------------------------|--------------|
| Database | Separate service | ✅ Built-in |
| Auth | Separate service | ✅ Built-in |
| Storage | Separate service | ✅ Built-in |
| Functions | Separate service | ✅ Built-in |
| Realtime | Separate service | ✅ Built-in |
| Deployment | Separate service | ✅ Built-in |
| MCP Support | Not available | ✅ Native |
| AI Optimization | Manual | ✅ Built-in |
| Cost | 2 services | 1 service |
| Complexity | High | Low |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DANCLAW APP                              │
│                   (Expo SDK 55 + Next.js 14)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Mobile App  │    │   Web App    │    │  Landing     │       │
│  │  (Expo 55)   │    │  (Next.js 14)│    │  Page        │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      INSFORGE.DEV                                │
│               (One Platform for Everything)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ PostgreSQL│  │   Auth   │  │ Storage  │  │  Realtime││   │
│  │  │ Database  │  │ (OAuth)  │  │ (Files)  │  │ (WebSocket)│   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Functions│  │ Deploy   │  │    MCP   │  │   AI     ││   │
│  │  │(Serverless)│ (Containers)│  │ Support  │  │Integration│   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      AGENT RUNTIME                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  SwarmClaw   │    │  Paperclip   │    │  OpenRouter  │       │
│  │  (Agents)    │    │  (Orchest.)  │    │  (AI Models) │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. InsForge.dev (Everything)

```
InsForge.dev provides:
├── PostgreSQL Database (user data, deployments)
├── Auth (Google/Apple/GitHub OAuth)
├── Cloud Storage (files, documents)
├── Functions (API endpoints, business logic)
├── Realtime (WebSocket, live updates)
├── AI Integration (model connections)
├── Deployment (container management)
└── MCP Support (native AI agent integration)
```

### 2. Mobile App (Expo SDK 55)

```
Features:
- Deploy screen (one-tap deploy)
- Dashboard (status, usage)
- Chat (real-time WebSocket)
- Settings (model, API keys)
- Billing (RevenueCat)
```

### 3. Web App (Next.js 14+)

```
Features:
- Landing page (marketing)
- Dashboard (management)
- Chat (real-time)
- Settings (configuration)
- Billing (Stripe)
```

### 4. Agent Runtime

```
Components:
- SwarmClaw (multi-agent orchestration)
- Paperclip (company management)
- OpenRouter (500+ AI models)
- WebSocket (real-time chat)
```

---

## Data Flow

### Deploy Flow (60 seconds)

```
1. User taps "Deploy" (Expo/Web)
2. OAuth → InsForge Auth
3. InsForge Functions → Create container
4. Container starts with SwarmClaw
5. OpenRouter token injected
6. Health check passes
7. Status → "running"
8. User receives notification
9. Chat ready
```

### Chat Flow

```
1. User sends message
2. WebSocket → InsForge Realtime
3. InsForge Functions → Container
4. Container → SwarmClaw
5. SwarmClaw → OpenRouter
6. Response → InsForge Realtime
7. WebSocket → User
```

---

## Database Schema (InsForge PostgreSQL)

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  tier TEXT DEFAULT 'free',
  openrouter_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Deployments Table

```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  service_name TEXT NOT NULL,
  status TEXT DEFAULT 'provisioning',
  tier TEXT NOT NULL,
  region TEXT DEFAULT 'us-central1',
  model TEXT NOT NULL,
  channel TEXT,
  memory_usage FLOAT,
  requests_today INT,
  cost_this_month FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID REFERENCES deployments(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints (InsForge Functions)

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout

### Deployments

- `POST /api/deployments` - Create deployment
- `GET /api/deployments/:id` - Get deployment
- `POST /api/deployments/:id/start` - Start
- `POST /api/deployments/:id/stop` - Stop
- `POST /api/deployments/:id/restart` - Restart
- `DELETE /api/deployments/:id` - Destroy

### Chat

- `WebSocket /ws/chat/:deploymentId` - Real-time chat

### User

- `GET /api/user/profile` - Get profile
- `GET /api/user/deployments` - List deployments
- `GET /api/user/usage` - Get usage

---

## Security

### Authentication

- Google OAuth via InsForge Auth
- Apple Sign In (iOS)
- JWT tokens

### Authorization

- Row Level Security (RLS) in InsForge PostgreSQL
- API key authentication for containers
- Rate limiting per tier

### Data Protection

- HTTPS everywhere
- WSS for WebSocket connections
- TLS 1.3 minimum
- Container isolation
- No API keys in app

---

## MCP Integration (Native)

InsForge.dev has native MCP support:

- AI agents can directly interact with database
- Real-time data synchronization
- Structured workflows
- Better performance (1.6x faster, 30% fewer tokens)

This is a HUGE advantage for DanClaw - our agents can work directly with the backend!

---

## Why This Architecture Beats KiloClaw

| Feature | KiloClaw | DanClaw |
|---------|----------|---------|
| Mobile | ❌ Web only | ✅ Expo + Web |
| Multi-agent | ❌ Single | ✅ SwarmClaw |
| Company | ❌ No | ✅ Paperclip |
| MCP | ❌ No | ✅ Native |
| All-in-one | ❌ Multiple | ✅ InsForge |
| Price | $9/month | Free/Pro/Elite |

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

- Set up InsForge.dev account
- Configure database schema
- Set up auth flow
- Create mobile + web apps

### Phase 2: Core Features (Week 3-4)

- Deploy flow (60s)
- Chat system
- WebSocket
- Real-time updates

### Phase 3: Advanced (Week 5-6)

- SwarmClaw integration
- Paperclip integration
- OpenRouter connection
- Multi-agent support

### Phase 4: Polish (Week 7-8)

- UI/UX improvements
- Performance optimization
- Security audit
- Testing

### Phase 5: Launch (Week 9)

- App Store submission
- Play Store submission
- Marketing launch
- Community building

---

## Conclusion

DanClaw with InsForge.dev is:
- Simpler (one platform)
- Faster (MCP support)
- Better (mobile-first)
- Cheaper (free tier available)

**Ready to build!** 🚀