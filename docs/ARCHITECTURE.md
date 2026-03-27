# DanClaw - System Architecture

## Overview

DanClaw is a mobile-first AI agent deployment platform. Users deploy AI agents with one click, manage them via mobile app or web dashboard, and chat in real-time.

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
│                      API GATEWAY                            │
│                  (REST + WebSocket)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Auth        │    │ Deploy      │    │ Chat            │ │
│  │ Service     │    │ Service     │    │ Service         │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      INFRASTRUCTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Supabase    │    │ GCP Cloud   │    │ OpenRouter      │ │
│  │ (Auth+DB)   │    │ Run         │    │ (AI Models)     │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ RevenueCat  │    │ SwarmClaw   │    │ Paperclip       │ │
│  │ (Billing)   │    │ (Agents)    │    │ (Orchestration) │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Deploy Flow (60 seconds)
```
1. User taps "Deploy" (App)
2. OAuth → Supabase Auth
3. API → GCP Cloud Run (create container)
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
2. WebSocket → API Gateway
3. API → GCP Cloud Run container
4. Container → SwarmClaw
5. SwarmClaw → OpenRouter
6. Response → API Gateway
7. WebSocket → User
```

## Components

### 1. Mobile App (Expo SDK 52)
- iOS + Android native apps
- Zustand state management
- TanStack Query for server state
- React Navigation for routing

### 2. Web App (Next.js 14+)
- Server-side rendering
- SEO optimization
- Same business logic as mobile

### 3. Shared Packages
- API client
- UI components
- Types and constants

### 4. API Gateway
- REST endpoints
- WebSocket connections
- Authentication
- Rate limiting

### 5. Deploy Service
- GCP Cloud Run API
- Container lifecycle
- Health checks

### 6. Chat Service
- WebSocket server
- Message routing
- Real-time updates

## Database Schema

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

## API Endpoints

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
- Google OAuth via Supabase
- Apple Sign In (iOS)
- JWT tokens

### Authorization
- Row Level Security (RLS) in Supabase
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