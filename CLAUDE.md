# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DanClaw is a mobile-first AI agent deployment platform (Expo SDK 55 + Next.js 14) using pnpm workspaces + Turborepo. Backend is InsForge.dev (Auth, PostgreSQL, Realtime, Functions, Storage).

## Repository Structure

```
apps/
  web/              # Next.js 14 web app (app router, tailwind, shadcn/ui)
  mobile/           # Expo SDK 55 mobile app (expo router, tailwind)
packages/
  shared/           # Types, constants, validators, mock data, utils
  api/              # DanClawClient, TanStack Query hooks, WebSocket manager
docs/               # ARCHITECTURE.md, API.md, SCHEMA.sql, SECURITY.md, etc.
```

## Development Commands

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start all apps
pnpm --filter @danclaw/web dev     # Web only (localhost:3000)
pnpm --filter @danclaw/mobile start # Mobile only (Expo)
pnpm build / pnpm lint / pnpm typecheck
```

## Key Architecture Decisions

**Shared package is the single source of truth.** All types (`User`, `Deployment`, `Message`), constants (`AI_MODELS`, `PRICING_TIERS`), and Zod validators live in `packages/shared`. Never define duplicate types in apps.

**API package wraps InsForge SDK.** Use `DanClawClient`, `ChatWebSocket`, and TanStack Query hooks from `@danclaw/api` instead of raw SDK calls.

**Database schema sync.** When modifying `docs/SCHEMA.sql`, also update `@danclaw/shared/src/types/` and `@danclaw/shared/src/validators/`.

## Design System

Web: TailwindCSS v3.4 with custom dark theme (`indigo` primary, `emerald` secondary, `amber` accent). Mobile: `theme.ts` constants. Both use consistent `DEPLOYMENT_STATUS_COLORS`.

## API Patterns

All responses wrapped in `ApiResponse<T>` envelope. TanStack Query v5 with centralized `queryKeys`. WebSocket via InsForge Realtime broadcast channels.

## Environment Variables

```bash
# Web
NEXT_PUBLIC_INSFORGE_URL=...
NEXT_PUBLIC_INSFORGE_ANON_KEY=...

# Mobile
EXPO_PUBLIC_INSFORGE_URL=...
EXPO_PUBLIC_INSFORGE_ANON_KEY=...
```

## Platform-Specific Code

Mobile uses `.web.tsx` suffix for web-only components (e.g. `animated-icon.tsx` vs `animated-icon.web.tsx`).

## Documentation

See `docs/` for ARCHITECTURE.md, API.md, SCHEMA.sql, SECURITY.md, PRD.md, ROADMAP.md.
