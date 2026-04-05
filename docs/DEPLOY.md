# Deploy Guide — Zero Secrets in Code

## Architecture

```
[User] → https://danclaw.vercel.app
                    ↓
              Vercel (Frontend - Next.js)
                    ↓
          InsForge (Backend - Auth + DB + Realtime)
                    ↓
              OpenRouter (AI Models)
```

## Secrets — NEVER in Code

All secrets are set via:
1. **Vercel Dashboard** (Frontend secrets)
2. **InsForge Dashboard** (Backend config)
3. **Oracle Cloud** (Agent runtime)

### Vercel Environment Variables
Go to https://vercel.com/som/danclaw/settings/environment-variables
Add these:

```
NEXT_PUBLIC_INSFORGE_URL      → Your InsForge URL
NEXT_PUBLIC_INSFORGE_ANON_KEY → Your InsForge anon key
NEXT_PUBLIC_OPENROUTER_KEY    → Your OpenRouter key (optional - users bring their own)
```

### InsForge Setup
Already done. Your project has:
- Users table (with RLS)
- Deployments table 
- Messages table
- Activity table
- All indexes + triggers

### Oracle Cloud (Agent Runtime)
1. Sign up at https://www.oracle.com/cloud/free/
2. Create VM.Standard.A1.Flex shape (4 ARM CPUs, 24GB RAM — Always Free)
3. SSH in and run:
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   
   # Deploy OpenClaw
   docker run -d --name openclaw \
     -p 3000:3000 \
     -e OPENROUTER_KEY=$OPENROUTER_KEY \
     -e TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN \
     ghcr.io/openclaw/openclaw:latest
   ```

## Manual Deploy to Vercel (No CLI Token Needed)

Since we're not storing the Vercel token:

1. Push to GitHub: `git push origin main` (done ✅)
2. Go to https://vercel.com/new
3. Import repository: `somdipto/danclaw`
4. Set framework preset: **Next.js**
5. Root directory: **apps/web**
6. Add environment variables (from above)
7. Click **Deploy**

That's it. Vercel auto-detects the monorepo structure and builds.

## CI/CD (GitHub Actions)

The workflow at `.github/workflows/deploy-vercel.yml` triggers on push to main.
It uses `vercel deploy` command — but you need to add the VERCEL_TOKEN secret to your GitHub repo:
https://github.com/somdipto/danclaw/settings/secrets/actions

Or skip CI and just deploy manually — same result.
