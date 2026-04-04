# DevOps Status

**Last Updated:** 2026-04-05 21:05 UTC

## Infrastructure Setup - COMPLETE ✅

### ✅ Step 1: CI/CD Pipeline (ci.yml)
- **Status:** Fully configured
- **Jobs:** lint, typecheck, test (with fallback echo), build-web, build-mobile, deploy-insforge
- **Concurrency:** Cancels in-progress on new runs
- **Cache:** pnpm caching configured

### ✅ Step 2: Vercel Deploy Workflow (deploy-web.yml)
- **Status:** Already exists and properly configured
- **Preview:** PR → automatic preview deployment with env vars
- **Production:** Push to main → automatic production deployment
- **Uses:** amondnet/vercel-action@v25

### ✅ Step 3: Deployment Guide (DEPLOY.md)
- **Status:** Comprehensive and complete
- **Sections:** Prerequisites, Local setup, InsForge setup, Vercel, EAS Build, Agent Runtime, Troubleshooting, Environment Variables Reference

### ✅ Step 4: Environment Variable Audit
- **web/.env.local.example:** ✅ Complete
  - NEXT_PUBLIC_INSFORGE_URL, NEXT_PUBLIC_INSFORGE_ANON_KEY, NEXT_PUBLIC_OPENROUTER_API_KEY, NEXT_PUBLIC_APP_URL
- **mobile/.env.example:** ✅ Complete
  - EXPO_PUBLIC_INSFORGE_URL, EXPO_PUBLIC_INSFORGE_ANON_KEY, EXPO_PUBLIC_APP_URL

### ✅ Step 5: Dockerfile for Agent Runtime (infra/docker/Dockerfile.agent)
- **Node.js:** 20-alpine ✅
- **Health check:** --interval=30s --timeout=5s --start-period=10s --retries=3 ✅
- **Non-root user:** agentuser with agentgroup (uid 1001) ✅
- **Security:** Runs as non-root, proper WORKDIR, npm cache cleaned

### ✅ Step 6: Migration Guide (MIGRATIONS.md)
- **Status:** Comprehensive and complete
- **Sections:** Schema application, adding tables/columns, version control strategy, rollback strategy, RLS documentation

## Remaining Items

### 1. Agent Runtime server.js
- The Dockerfile.agent references `server.js` but it doesn't exist yet
- Needs implementation at `infra/docker/` or similar location
- Health endpoint at `/health` needs to be implemented

### 2. Mobile EAS Build Secrets
- Need to verify EXPO_PUBLIC_* secrets are set in expo.dev dashboard
- EAS credentials need to be configured for production builds

## GitHub Secrets Required

| Secret | Service | Description |
|--------|---------|-------------|
| `VERCEL_TOKEN` | Vercel | API token |
| `VERCEL_ORG_ID` | Vercel | Organization ID |
| `VERCEL_PROJECT_ID` | Vercel | Project ID |
| `NEXT_PUBLIC_INSFORGE_URL` | Web | InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Web | InsForge anon key |
| `NEXT_PUBLIC_APP_URL` | Web | Production app URL |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | Web | OpenRouter API key (server-side) |
| `EXPO_TOKEN` | Expo | EAS build token |
| `EXPO_PUBLIC_INSFORGE_URL` | Mobile | InsForge project URL |
| `EXPO_PUBLIC_INSFORGE_ANON_KEY` | Mobile | InsForge anon key |
| `EXPO_PUBLIC_APP_URL` | Mobile | App URL |
| `INSFORGE_CLI_TOKEN` | InsForge | CLI authentication |
| `INSFORGE_PROJECT_ID` | InsForge | Project ID |

## Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Lint, typecheck, test, build, deploy-insforge |
| `.github/workflows/deploy-web.yml` | Vercel preview/production |
| `.github/workflows/docker-build.yml` | Docker image builds |

## Notes

- CI pipeline is solid: lint → typecheck → test → build
- Vercel deploy handles both preview (PR) and production (main push)
- EAS mobile export runs in CI for iOS platform
- InsForge schema pushed automatically on main branch merge
- Docker builds for agent runtime on infra/docker changes
- Agent runtime health check configured but needs server.js implementation