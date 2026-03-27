# DanClaw - System Architecture (InsForge.dev)

## Overview

DanClaw is a mobile-first AI agent deployment platform. Users deploy AI agents with one click, manage them via mobile app or web dashboard, and chat in real-time.

**Backend: InsForge.dev** - One platform for everything (DB + Auth + Storage + Functions + Deploy)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      DANCLAW APP                            │
│               (Expo SDK 52 + Next.js 14+)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Mobile App  │    │ Web App     │    │ Landing Page    │ │
│  │ (Expo)      │    │ (Next.js)   │    │ (Marketing)     │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      INSFORGE.DEV                           │
│            (Everything in one platform)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ PostgreSQL  │    │ Auth (OAuth)│    │ Cloud Storage   │ │
│  │ Database    │    │             │    │                 │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Functions   │    │ Realtime    │    │ AI Integration  │ │
│  │ (Serverless)│    │             │    │                 │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐                       │
│  │ Deployment  │    │ MCP Support │                       │
│  │ (Containers)│    │ (Native)    │                       │
│  └─────────────┘    └─────────────┘                       │
├─────────────────────────────────────────────────────────────┤
│                      AGENT RUNTIME                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ SwarmClaw   │    │ Paperclip   │    │ OpenRouter      │ │
│  │ (Agents)    │    │ (Orchest.)  │    │ (AI Models)     │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Why InsForge.dev?

| Feature | Supabase + GCP | InsForge.dev |
|---------|----------------|--------------|
| DB | Supabase | ✅ Built-in |
| Auth | Supabase | ✅ Built-in |
| Storage | Supabase | ✅ Built-in |
| Functions | GCP Cloud Run | ✅ Built-in |
| Realtime | Supabase | ✅ Built-in |
| Deployment | GCP Cloud Run | ✅ Built-in |
| AI Integration | Manual | ✅ Built-in |
| MCP Support | ❌ | ✅ Native |
| Cost | 2 services | 1 service |
| Complexity | High | Low |

## Components

### 1. InsForge.dev (Everything)

```
InsForge.dev provides:
├── PostgreSQL Database (user data, deployments)
├── Auth (Google/Apple OAuth)
├── Cloud Storage (files, documents)
├── Functions (API endpoints, business logic)
├── Realtime (WebSocket, live updates)
├── AI Integration (model connections)
├── Deployment (container management)
└── MCP Support (native AI agent integration)
```

### 2. Mobile App (Expo SDK 52)
- iOS + Android native apps
- Zustand state management
- TanStack Query for server state
- React Navigation for routing

### 3. Web App (Next.js 14+)
- Server-side rendering
- SEO optimization
- Same business logic as mobile

### 4. Agent Runtime
- SwarmClaw (multi-agent)
- Paperclip (orchestration)
- OpenRouter (AI models)

## Data Flow

### Deploy Flow (60 seconds)
```
1. User taps "Deploy" (App)
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
1. User sends message (App)
2. WebSocket → InsForge Realtime
3. InsForge Functions → Container
4. Container → SwarmClaw
5. SwarmClaw → OpenRouter
6. Response → InsForge Realtime
7. WebSocket → User
```

## Database Schema (InsForge PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
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
- Encryption at rest
- Container isolation
- No API keys in app

## Monitoring

### Metrics
- Deploy time
- API latency
- Container health
- Error rates
- User activity

### Alerts
- High deploy time (>90s)
- Container errors (>5%)
- API latency (>500ms)
- Free tier abuse

## MCP Integration (Native)

InsForge.dev has native MCP support:
- AI agents can directly interact with database
- Real-time data synchronization
- Structured workflows
- Better performance (1.6x faster, 30% fewer tokens)

This is a HUGE advantage for DanClaw - our agents can work directly with the backend!