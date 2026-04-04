# DanClaw — Setup & Deployment Guide

## Current Status

**Backend: LIVE ✅**
- InsForge project: `tq33kiup.ap-southeast.insforge.app`
- Account: `som@danclaw.dev` (free tier)
- Database: 1 user, 2 deployments, schema active
- User: som@danclaw.dev | Tier: free
- Deployments: hermes-alpha (provisioning), openclaw-001 (running)

**Frontend: Ready to deploy ⚡**
- All code committed locally
- Just needs: GitHub push → Vercel deploy

---

## InsForge Credentials

```
Project URL: https://tq33kiup.ap-southeast.insforge.app
API Key: ik_ac021317adcb7995b6f8e53075757fc1
```

**REST API Pattern:**
- Auth: `POST /api/auth/users` (register), `POST /api/auth/sessions` (login)
- Database: `GET/POST /api/database/records/{table}`
- Auth header: `Authorization: Bearer {api_key}`

---

## What You Need to Do (5 minutes)

### Step 1: Push to GitHub

```bash
cd danclaw
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/somdipto/danclaw.git
git push origin main
```

Then go to **vercel.com** → Import → select danclaw repo → Deploy.

### Step 2: Add Environment Variables in Vercel

In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_INSFORGE_URL = https://tq33kiup.ap-southeast.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY = ik_ac021317adcb7995b6f8e53075757fc1
```

Redeploy. Done!

### Step 3: Test

Open your Vercel URL → Sign up → Deploy your first agent!

---

## Database Schema (Already Active)

Tables: users, deployments, messages, activity
All with proper indexes and RLS policies.

## OpenRouter

Get free key at: https://openrouter.ai/keys
Add to user profile after signup.
