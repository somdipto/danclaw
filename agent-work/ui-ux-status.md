# UI/UX Designer — Status & Blockers

**Last Updated**: 2026-04-04 23:37 IST

## BLOCKERS — Waiting on Som

### 1. Design System
- Any existing Figma/design files?
- Primary brand colors confirmed?
- Logo assets?

### 2. Mobile-First
- Any mobile wireframes?
- How does deploy wizard differ on mobile vs web?

## WORK DONE ✅
- Design system: dark theme (indigo primary, emerald secondary, amber accent)
- TailwindCSS v3.4 with custom color palette
- shadcn/ui-inspired component library (Card, Badge, Button, StatsCard)
- Responsive layouts across all pages
- Framer Motion animations (fade-in, slide-up)

## WORK QUEUED
- [ ] Create DESIGN_SYSTEM.md documenting all components + tokens
- [ ] Mobile-specific design review (touch targets, safe areas)
- [ ] Empty states for: no deployments, no messages, no activity
- [ ] Loading skeletons (not spinners)
- [ ] Error states design
- [ ] Onboarding flow design

## COMPONENT INVENTORY
✅ Badge — status indicator (8 states)
✅ Button — primary, ghost, destructive variants
✅ Card — hover, glow, padding variants
✅ StatsCard — icon, value, label, trend
✅ Progress steps (deploy wizard)
⬜ Input — form inputs not standardized
⬜ Modal — confirmation dialogs not created
⬜ Toast — notifications not created
⬜ Skeleton — loading states not created

## DESIGN TOKENS
Primary: indigo (#6366f1)
Secondary: emerald (#22c55e)
Accent: amber (#f59e0b)
Background: dark-900 (#09090b)
Surface: dark-800 (#111113)
Border: dark-700 (#27272a)
Text: white (#ffffff)
Muted: dark-400 (#71717a)
