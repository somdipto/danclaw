# DanClaw Deployment Guide

Complete deployment guide for DanClaw AI agent deployment platform.

## Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **pnpm**: 9+ (package manager)
- **Git**: latest version
- **Accounts**:
  - [InsForge.dev](https://insforge.dev) - Backend & database
  - [Vercel](https://vercel.com) - Web hosting
  - [Expo](https://expo.dev) - Mobile builds
  - [OpenRouter](https://openrouter.ai) - AI models (optional for free tier)

---

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/danlab-ai/danclaw.git
cd danclaw
pnpm install
```

### 2. InsForge Project Setup

1. Go to [insforge.dev](https://insforge.dev) → Create account
2. Create New Project → Wait ~3 seconds for provisioning
3. Copy Project ID from URL: `https://insforge.dev/dashboard/project/<PROJECT_ID>`
4. Go to Settings → API Keys → Copy **Anon Key**

### 3. Configure Environment Variables

**Web app** (`apps/web/.env.local`):
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_INSFORGE_URL=https://<PROJECT_ID>.insforge.dev
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Mobile app** (`apps/mobile/.env.local`):
```bash
cp apps/mobile/.env.example apps/mobile/.env.local
```

Edit `apps/mobile/.env.local`:
```env
EXPO_PUBLIC_INSFORGE_URL=https://<PROJECT_ID>.insforge.dev
EXPO_PUBLIC_INSFORGE_ANON_KEY=ik_your_anon_key_here
EXPO_PUBLIC_APP_URL=https://danclaw.app
```

### 4. Apply Database Schema

```bash
cd danclaw
npx @insforge/cli login
npx @insforge/cli link --project-id <YOUR_PROJECT_ID>
npx @insforge/cli db push --project-id <YOUR_PROJECT_ID> --schema-path docs/SCHEMA.sql
```

### 5. Run Development Servers

```bash
# Web (Next.js on localhost:3000)
pnpm --filter @danclaw/web dev

# Mobile (Expo)
pnpm --filter @danclaw/mobile start
```

---

## Vercel Web Deployment

### Required GitHub Secrets

Add these in GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Description | Where to get |
|--------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel API token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `vercel whoami --token <token>` |
| `VERCEL_PROJECT_ID` | Vercel project ID | Project settings in Vercel dashboard |
| `NEXT_PUBLIC_INSFORGE_URL` | InsForge project URL | Your InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anon key | Project Settings → API Keys |
| `NEXT_PUBLIC_APP_URL` | Production app URL | Your Vercel deployment URL |
| `INSFORGE_CLI_TOKEN` | InsForge CLI token | InsForge dashboard |
| `INSFORGE_PROJECT_ID` | InsForge project ID | From project URL |
| `EXPO_TOKEN` | Expo token for EAS | `eas credentials --platform ios` |

### Deploy Flow

1. **PR Preview**: Merging a PR → automatic preview deployment
2. **Production**: Push to `main` → automatic production deployment

The workflow is in `.github/workflows/deploy-web.yml`.

### Manual Vercel Deploy

```bash
cd apps/web
vercel --prod
```

---

## EAS Build for Mobile

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Configure EAS

```bash
cd apps/mobile
eas build:configure
```

### 3. Create EAS Secrets

Add in [expo.dev](https://expo.dev) → Your project → Secrets:

| Secret | Description |
|--------|-------------|
| `EXPO_PUBLIC_INSFORGE_URL` | InsForge project URL |
| `EXPO_PUBLIC_INSFORGE_ANON_KEY` | InsForge anon key |
| `EXPO_PUBLIC_APP_URL` | Production app URL |

### 4. Build Commands

```bash
# Development build (local)
eas build --platform ios --profile development --local

# Development build (cloud)
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 5. EAS Build JSON Configuration

The `apps/mobile/eas.json` is preconfigured:

```json
{
  "cli": {
    "version": ">= 9.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path-to-service-account.json"
      }
    }
  }
}
```

---

## Agent Runtime (Docker)

### Dockerfile Locations

- **Web app**: `Dockerfile` (root)
- **Agent runtime**: `infra/docker/Dockerfile.agent`

### Build and Run Agent

```bash
# Build image
docker build -f infra/docker/Dockerfile.agent -t danclaw/agent:latest .

# Run container
docker run -d \
  --name danclaw-agent \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e OPENCLAW_API_KEY=your_key \
  -e OPENROUTER_API_KEY=your_key \
  -e INSFORGE_URL=https://your-project.insforge.dev \
  -e INSFORGE_ANON_KEY=ik_your_key \
  danclaw/agent:latest

# Verify health
curl http://localhost:8080/health
```

### Health Check

The agent runtime exposes `/health` returning:
```json
{"status":"ok","uptime":12345}
```

---

## Environment Variables Reference

### Web App (`apps/web`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_INSFORGE_URL` | Yes | InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Yes | InsForge anonymous API key |
| `NEXT_PUBLIC_APP_URL` | Yes | Production app URL for OAuth |
| `INSFORGE_SERVICE_KEY` | No | Service role key (server-side only) |

### Mobile App (`apps/mobile`)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_INSFORGE_URL` | Yes | InsForge project URL |
| `EXPO_PUBLIC_INSFORGE_ANON_KEY` | Yes | InsForge anonymous API key |
| `EXPO_PUBLIC_APP_URL` | Yes | App URL for deep links |

### Agent Runtime

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Server port (default: 8080) |
| `OPENCLAW_API_KEY` | Yes | OpenClaw API key |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key |
| `INSFORGE_URL` | Yes | InsForge backend URL |
| `INSFORGE_ANON_KEY` | Yes | InsForge anonymous key |

---

## GitHub Actions CI/CD

### Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Lint, typecheck, test, build |
| `.github/workflows/deploy-web.yml` | Vercel preview/production deploy |
| `.github/workflows/docker-build.yml` | Docker image builds for agents |

### CI Pipeline Stages

1. **Lint** - ESLint checks
2. **Typecheck** - TypeScript compilation
3. **Test** - Jest/Vitest (placeholder, runs with echo fallback)
4. **Build Web** - Next.js production build
5. **Export Mobile** - Expo export for iOS
6. **Deploy InsForge** - Schema push to production (main branch only)

### Vercel Deploy Pipeline

1. **PR** → Preview deployment with env vars from secrets
2. **Push to main** → Production deployment

---

## Troubleshooting

### "Missing InsForge configuration"
→ Verify `.env.local` has correct `NEXT_PUBLIC_INSFORGE_URL` and `NEXT_PUBLIC_INSFORGE_ANON_KEY`

### Database tables not found (42501 error)
→ Run: `npx @insforge/cli db push --project-id <ID> --schema-path docs/SCHEMA.sql`

### Vercel deployment fails
→ Check GitHub Secrets are correctly set
→ Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct

### EAS build fails
→ Run `eas build:configure` again
→ Check Expo secrets are set in expo.dev dashboard

### Agent container health check fails
→ Check logs: `docker logs danclaw-agent`
→ Verify port 8080 is exposed
→ Ensure health endpoint is implemented in server.js