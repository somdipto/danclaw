# DanClaw — Setup Guide

## Prerequisites
- Node.js 18+
- pnpm 8+
- InsForge account (insforge.dev)
- OpenRouter account (openrouter.ai) — optional for free tier

## Step 1: Create InsForge Project
1. Go to https://insforge.dev and create a free account
2. Click "Create New Project" → your backend is ready in ~3 seconds
3. Copy the Project ID from the URL: `https://insforge.dev/dashboard/project/<YOUR_PROJECT_ID>`
4. Go to Settings → API Keys → copy the **Anon Key**

## Step 2: Push Database Schema
```bash
cd danclaw
npx @insforge/cli login
npx @insforge/cli link --project-id <YOUR_PROJECT_ID>
npx @insforge/cli db import docs/SCHEMA.sql
```

## Step 3: Install Dependencies
```bash
pnpm install
```

## Step 4: Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your InsForge URL and Anon Key
```

## Step 5: Run Development Servers
```bash
# Web (localhost:3000)
pnpm --filter @danclaw/web dev

# Mobile (Expo)
pnpm --filter @danclaw/mobile start
```

## Step 6: Open in Browser
Navigate to http://localhost:3000 and test:
- Register / Login
- Deploy an agent
- Chat with your agent

## Troubleshooting

**"Missing InsForge configuration" error**
→ Check that `.env.local` has the correct `NEXT_PUBLIC_INSFORGE_URL` and `NEXT_PUBLIC_INSFORGE_ANON_KEY`

**Database tables not found (42501 error)**
→ Make sure you ran `npx @insforge/cli db import docs/SCHEMA.sql`

**WebSocket connection failed**
→ Check that InsForge Realtime is enabled in your project settings
