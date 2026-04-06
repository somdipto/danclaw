# DanClaw Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      Vercel (Frontend)         │
              │      Next.js 14 App           │
              │      https://danclaw.app       │
              └──────────────┬──────────────────┘
                             │
              ┌──────────────▼──────────────────┐
              │       InsForge Backend          │
              │   (Auth + PostgreSQL + API)     │
              │   https://project.insforge.dev   │
              └──────────────┬──────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  OpenRouter   │   │    Oracle     │   │   Telegram/   │
│  (AI Models)  │   │   Cloud       │   │   Discord/    │
│               │   │  (Agent RT)   │   │   WhatsApp    │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | `>=20.0.0` | Use [nvm](https://github.com/nvm/nvm) for version management |
| pnpm | `>=9.0.0` | Install via `npm install -g pnpm` |
| Git | latest | For version control |
| Docker | `>=24.0` | For agent runtime |
| EAS CLI | latest | For mobile builds: `npm install -g eas-cli` |
| Vercel CLI | latest | Optional: `npm i -g vercel` |

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/somdipto/danclaw.git
cd danclaw
pnpm install
```

### 2. Environment Variables

Copy example files and fill in your values:

```bash
# Web app
cp apps/web/.env.local.example apps/web/.env.local

# Mobile app  
cp apps/mobile/.env.example apps/mobile/.env
```

### 3. Start Development Servers

```bash
# Start all services (web + mobile simultaneously)
pnpm dev

# Or start individually:
pnpm --filter @danclaw/web dev   # → http://localhost:3000
pnpm --filter @danclaw/mobile start # → Expo Go
```

## InsForge Backend Setup

DanClaw uses InsForge for authentication, PostgreSQL database, and serverless functions.

### 1. Create InsForge Project

1. Go to [insforge.dev](https://insforge.dev) and sign up
2. Create a new project: `danclaw`
3. Note your project URL and anon key from the dashboard

### 2. Apply Database Schema

```bash
cd danclaw

# Login to InsForge CLI
npx @insforge/cli login

# Push the schema (creates all tables, indexes, RLS policies)
npx @insforge/cli db push \
  --project-id YOUR_PROJECT_ID \
  --schema-path docs/SCHEMA.sql
```

### 3. Verify Schema Applied

```bash
# Check tables exist
npx @insforge/cli db query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" --project-id YOUR_PROJECT_ID
```

Expected tables: `users`, `deployments`, `messages`, `activity`, `subscriptions`, `payments`, `usage_records`, `agents`, `agent_deployments`, `agent_memory`, `provisioning_logs`, `webhook_events`

## Vercel Deployment

### Automatic via GitHub Actions

The repository includes:
- `.github/workflows/ci.yml` — Runs lint, typecheck, test, build for web/mobile
- `.github/workflows/deploy-web.yml` — Deploys to Vercel (preview for PRs, production on main)

### Required GitHub Secrets

Add these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `NEXT_PUBLIC_INSFORGE_URL` | Your InsForge URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Your InsForge anon key |
| `NEXT_PUBLIC_APP_URL` | `https://danclaw.app` |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | OpenRouter key (optional) |
| `INSFORGE_CLI_TOKEN` | InsForge CLI authentication |
| `INSFORGE_PROJECT_ID` | InsForge project ID |
| `EXPO_TOKEN` | Expo access token for EAS builds |

### Manual Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

## EAS Build for Mobile

DanClaw mobile app uses Expo with EAS Build for production builds.

### 1. Configure EAS

```bash
cd apps/mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS (accepts defaults or customize)
eas build:configure
```

### 2. Build for iOS (App Store)

```bash
# Create build credentials (first time)
eas credentials --platform ios

# Build for App Store
eas build --platform ios --profile production
```

### 3. Build for Android (Play Store)

```bash
# Build for Play Store
eas build --platform android --profile production
```

### 4. EAS Secrets

Add these in **Expo Dashboard → Secrets**:

| Secret | Description |
|--------|-------------|
| `EXPO_PUBLIC_INSFORGE_URL` | InsForge URL |
| `EXPO_PUBLIC_INSFORGE_ANON_KEY` | InsForge anon key |
| `EXPO_PUBLIC_APP_URL` | App URL for deep links |
| `EXPO_PUBLIC_OPENROUTER_API_KEY` | OpenRouter key (optional) |

## Agent Runtime (Docker)

The agent runtime runs on Oracle Cloud (or any Docker host) using the `Dockerfile`.

### Build and Run

```bash
# Build image
docker build -t danclaw-agent:latest .

# Run container
docker run -d \
  --name danclaw-agent \
  -p 8080:8080 \
  -e OPENROUTER_KEY=your-key \
  -e TELEGRAM_BOT_TOKEN=your-token \
  -e INSFORGE_URL=your-insforge-url \
  -e INSFORGE_ANON_KEY=your-anon-key \
  danclaw-agent:latest
```

### Health Check

The container exposes health endpoints:
- `http://localhost:8080/health`
- `http://localhost:8080/api/health`

```bash
# Check health
curl http://localhost:8080/health

# Should return: {"status":"ok"}
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: danclaw-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: danclaw-agent
  template:
    metadata:
      labels:
        app: danclaw-agent
    spec:
      containers:
      - name: agent
        image: ghcr.io/somdipto/danclaw/agent-runtime:latest
        ports:
        - containerPort: 8080
        env:
        - name: OPENROUTER_KEY
          valueFrom:
            secretKeyRef:
              name: danclaw-secrets
              key: openrouter-key
        - name: INSFORGE_URL
          value: "https://project.insforge.dev"
        - name: INSFORGE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: danclaw-secrets
              key: insforge-anon-key
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
```

## Environment Variables Reference

### Web App (`apps/web/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_INSFORGE_URL` | InsForge project URL | ✅ Yes |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anonymous auth key | ✅ Yes |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | OpenRouter API key for AI | ⚠️ Optional (users bring their own) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app | ✅ Yes |

### Mobile App (`apps/mobile/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_INSFORGE_URL` | InsForge project URL | ✅ Yes |
| `EXPO_PUBLIC_INSFORGE_ANON_KEY` | InsForge anonymous auth key | ✅ Yes |
| `EXPO_PUBLIC_APP_URL` | Public URL for deep links/OAuth | ✅ Yes |
| `EXPO_PUBLIC_OPENROUTER_API_KEY` | OpenRouter API key | ⚠️ Optional |

### Agent Container Runtime

| Variable | Description |
|----------|-------------|
| `OPENROUTER_KEY` | OpenRouter API key for AI models |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (if using Telegram) |
| `DISCORD_BOT_TOKEN` | Discord bot token (if using Discord) |
| `WHATSAPP_TOKEN` | WhatsApp bot token (if using WhatsApp) |
| `INSFORGE_URL` | InsForge project URL |
| `INSFORGE_ANON_KEY` | InsForge anonymous auth key |
| `PORT` | Agent runtime port (default: 8080) |

### GitHub Secrets (CI/CD)

| Secret | Used In | Description |
|--------|---------|-------------|
| `VERCEL_TOKEN` | deploy-web.yml | Vercel API authentication |
| `VERCEL_ORG_ID` | deploy-web.yml | Vercel organization ID |
| `VERCEL_PROJECT_ID` | deploy-web.yml | Vercel project ID |
| `NEXT_PUBLIC_INSFORGE_URL` | ci.yml, deploy-web.yml | InsForge URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | ci.yml, deploy-web.yml | InsForge anon key |
| `NEXT_PUBLIC_APP_URL` | ci.yml, deploy-web.yml | Application URL |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | ci.yml, deploy-web.yml | OpenRouter key |
| `EXPO_TOKEN` | ci.yml | Expo access token for EAS |
| `EXPO_PUBLIC_INSFORGE_URL` | ci.yml | Mobile InsForge URL |
| `EXPO_PUBLIC_INSFORGE_ANON_KEY` | ci.yml | Mobile InsForge anon key |
| `EXPO_PUBLIC_APP_URL` | ci.yml | Mobile app URL |
| `INSFORGE_CLI_TOKEN` | ci.yml | InsForge CLI authentication |
| `INSFORGE_PROJECT_ID` | ci.yml | InsForge project ID |

## Troubleshooting

### "Connection refused" to InsForge

1. Verify `NEXT_PUBLIC_INSFORGE_URL` is correct
2. Check InsForge project is active
3. Test: `curl https://your-project.insforge.app/rest/v1/`

### Mobile app can't connect

1. Verify `EXPO_PUBLIC_*` variables are set (not `NEXT_PUBLIC_*`)
2. Rebuild: `eas build --platform ios --clear-cache`

### Agent runtime not responding

1. Check logs: `docker logs danclaw-agent`
2. Verify port mapping: `docker port danclaw-agent`
3. Test health: `curl http://localhost:8080/health`