# DevOps Status

**Last Updated:** 2026-04-05 21:50 UTC

## Infrastructure Setup - COMPLETE

### ✅ Step 1: CI/CD Pipeline (ci.yml)
- **Status:** Already well-configured
- **Jobs:** lint, typecheck, test (with fallback), build-web, build-mobile, deploy-insforge
- **Improvement Needed:** Tests placeholder only (tests don't exist yet)

### ✅ Step 2: Vercel Deploy Workflow (deploy-web.yml)
- **Status:** Already exists and well-configured
- **Preview:** PR → automatic preview deployment
- **Production:** Push to main → automatic production deployment
- **Env vars:** All InsForge secrets passed via GitHub Actions secrets

### ✅ Step 3: Deployment Guide (DEPLOY.md)
- **Status:** Recreated and comprehensive
- **Sections:** Prerequisites, Local setup, InsForge setup, Vercel, EAS Build, Agent Runtime, Troubleshooting

### ✅ Step 4: Environment Variable Audit
- **web/.env.local.example:** ✅ Complete (NEXT_PUBLIC_INSFORGE_URL, NEXT_PUBLIC_INSFORGE_ANON_KEY, NEXT_PUBLIC_APP_URL)
- **mobile/.env.example:** ✅ Complete (EXPO_PUBLIC_INSFORGE_URL, EXPO_PUBLIC_INSFORGE_ANON_KEY, EXPO_PUBLIC_APP_URL)
- **Documented:** All secrets listed in DEPLOY.md with descriptions

### ✅ Step 5: Dockerfile for Agent Runtime (infra/docker/Dockerfile.agent)
- **Status:** Reviewed and improved
- **Node.js:** 20-alpine ✅
- **Health check:** Added with proper interval/timeout/retries ✅
- **Non-root user:** agentuser with agentgroup ✅
- **Security:** Runs as non-root, proper WORKDIR, no package manager cache
- **Note:** Agent runtime server.js doesn't exist yet - needs implementation

### ✅ Step 6: Migration Guide (MIGRATIONS.md)
- **Status:** Recreated and comprehensive
- **Sections:** Schema application, adding tables/columns, version control strategy, rollback strategy, RLS documentation

## GitHub Secrets Required

| Secret | Service | Description |
|--------|---------|-------------|
| `VERCEL_TOKEN` | Vercel | API token |
| `VERCEL_ORG_ID` | Vercel | Organization ID |
| `VERCEL_PROJECT_ID` | Vercel | Project ID |
| `NEXT_PUBLIC_INSFORGE_URL` | Web | InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Web | InsForge anon key |
| `NEXT_PUBLIC_APP_URL` | Web | Production app URL |
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

- CI already has typecheck, test, and build steps for both web and mobile
- EAS mobile export uses `--platform ios --output-dir dist` (correct for build pipeline)
- InsForge schema pushed automatically on main branch merge
- Docker builds for agent runtime on infra/docker changes
- Agent runtime needs `server.js` implementation for health endpoint to work