# DanClaw - AI Agent Deployment Platform

## What is DanClaw?

DanClaw is a mobile-first AI agent deployment platform that enables users to deploy, manage, and chat with AI agents in under 60 seconds — with zero DevOps knowledge required.

## Key Features

- 🚀 **One-click deploy** - 60 seconds from tap to running agent
- 📱 **Mobile-first** - iOS + Android + Web (single codebase)
- 🤖 **Multi-agent** - SwarmClaw + Paperclip integration
- 💬 **Real-time chat** - WebSocket-based communication
- 💰 **Transparent pricing** - Free/Pro/Elite tiers

## Architecture

```
danclaw/
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # System architecture (InsForge.dev)
│   ├── PRD.md            # Product requirements
│   ├── UIUX.md           # UI/UX design
│   ├── ROADMAP.md        # Development roadmap
│   ├── API.md            # API specification
│   ├── SECURITY.md       # Security model
│   └── COMPETITORS.md    # Competitor analysis
├── apps/
│   ├── mobile/           # Expo SDK 52 (iOS/Android)
│   └── web/              # Next.js 14+ (Web)
├── packages/
│   ├── shared/           # Shared logic (80% of code)
│   ├── ui/               # Shared UI components
│   └── api/              # Backend (InsForge Functions)
├── infra/
│   ├── insforge/         # InsForge.dev configuration
│   └── docker/           # Docker configurations
└── .github/
    └── workflows/        # CI/CD pipelines
```

## Quick Start

```bash
# Clone
git clone https://github.com/somdipto/danclaw.git
cd danclaw

# Install
pnpm install

# Start mobile
cd apps/mobile && pnpm dev

# Start web
cd apps/web && pnpm dev
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo SDK 55 |
| Web | Next.js 14+ |
| Backend | InsForge.dev (DB + Auth + Storage + Functions + Deploy) |
| Agent Runtime | SwarmClaw + Paperclip |
| AI Models | OpenRouter |
| Billing | RevenueCat |

## Why InsForge.dev?

| Feature | Traditional Setup | InsForge.dev |
|---------|-------------------|--------------|
| DB | Separate service | ✅ Built-in |
| Auth | Separate service | ✅ Built-in |
| Storage | Separate service | ✅ Built-in |
| Functions | Separate service | ✅ Built-in |
| Realtime | Separate service | ✅ Built-in |
| Deployment | Separate service | ✅ Built-in |
| AI Integration | Manual setup | ✅ Built-in |
| MCP Support | Not available | ✅ Native |
| Cost | Multiple services | 1 service |
| Complexity | High | Low |

**DanClaw uses ONLY InsForge.dev** - no Supabase, no GCP, no Convex.

## License

MIT