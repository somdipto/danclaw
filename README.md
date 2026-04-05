# DanClaw — Next-Generation AI Agent Platform

DanClaw is a premium, monorepo-based platform for effortlessly provisioning, managing, and interacting with AI agents across various cloud providers (utilizing OpenRouter) and communication channels.

Inspired by elegant interfaces like OpenRouter Spawn and Vercel, DanClaw provides a 60-second wizard to take an agent from idea to production-ready deployment.

## Architecture

This project is structured as a `pnpm` workspace monorepo:

### Apps
- **`apps/web`**: The main Next.js 14 Web Application. A stunning, dark-mode heavy dashboard.
- **`apps/mobile`**: The React Native application built with Expo SDK 55 & Expo Router.

### Packages
- **`packages/shared`**: The canonical source of truth for TypeScript types, enums, mock data, and pure utilities.
- **`packages/api`**: A universal fetch-based API client integrating with `@insforge/sdk` for cross-platform data fetching, real-time WebSockets, and database persistence.

## Technologies Used

- **Framework**: Next.js 14 App Router, Expo SDK 55
- **Language**: TypeScript throughout
- **Styling**: TailwindCSS (v3.4), Framer Motion, Tabler Icons
- **Backend & DB**: InsForge.dev (Auth, Postgres, Realtime, Edge Functions)
- **Tooling**: pnpm workspaces, Turborepo

## Local Development

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Web: Configure `apps/web/.env.local`
Mobile: Configure `apps/mobile/.env`

Provide your InsForge Project URL and Anon Key:
```
NEXT_PUBLIC_INSFORGE_URL=https://...
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_...
```

### 3. Run Development Servers
```bash
# Start the web app (localhost:3000)
pnpm --filter apps/web dev

# Start the mobile app (Expo Go / Web)
pnpm --filter apps/mobile start
```

## Setup Backend (InsForge)
The backend requires tables for `users`, `deployments`, `messages`, and `activity`.
To recreate the environment, use the InsForge CLI:
```bash
npm install -g @insforge/cli
npx @insforge/cli login
npx @insforge/cli link --project-id <your-id>
npx @insforge/cli db import docs/SCHEMA.sql
```Model: Qwen 3.6 Plus (Free only ✅)
OpenRouter key saved ✅
