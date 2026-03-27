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
│   ├── ARCHITECTURE.md    # System architecture
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
│   └── api/              # Backend (GCP Cloud Run)
├── infra/
│   ├── gcp/              # GCP infrastructure
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
| Mobile | Expo SDK 52 |
| Web | Next.js 14+ |
| Auth | Supabase |
| Database | Supabase PostgreSQL |
| Backend | GCP Cloud Run |
| Agent Runtime | SwarmClaw + Paperclip |
| AI Models | OpenRouter |
| Billing | RevenueCat |

## License

MIT