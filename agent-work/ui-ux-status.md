# UI/UX Status

**Last Updated**: 2026-04-07 03:50 UTC

---

## Phase 1 Tasks — Status

| Task | Status | Notes |
|------|--------|-------|
| Read deploy/chat/dashboard pages | ✅ Done | All files reviewed |
| Read UI components | ✅ Done | Badge, Button, Card, StatsCard, ProgressBar |
| Create DESIGN.md | ✅ Exists | Comprehensive, last updated 2026-04-05 |
| Create COMPONENTS.md | ✅ Exists | Includes empty/loading states |
| Review deploy wizard | ✅ Done | 3 improvements documented below |
| Review chat page | ✅ Done | 3 improvements documented below |
| Document empty/loading patterns | ✅ Done | In COMPONENTS.md |
| Mobile consistency review | ✅ Done | 5 issues identified below |
| Status update | ✅ Done | This file |
| Design review doc | ✅ Done | `agent-work/ui-ux-2026-04-07.md` |

---

## Design System Docs

- **DESIGN.md**: Color palette (primary/secondary/accent/dark scale), typography (Inter + JetBrains Mono), spacing (4px base), animations (fade-in, slide-up, scale-in, pulse-slow, shimmer), dark theme with glass effects
- **COMPONENTS.md**: Badge, Button, Card, StatsCard, ProgressBar with props, variants, usage examples. Also documents empty states and loading patterns

---

## Deploy Wizard — Review

**File**: `apps/web/src/app/dashboard/deploy/page.tsx`

### 3 Specific Improvements

1. **Step progress persistence** — Currently steps reset on page reload. Add URL params (`?step=1`) so users can bookmark or share mid-deployment. Low effort, high UX value.

2. **Model card hover info** — Model cards show `description` but it's cramped in small text. Add an info tooltip on hover/tap that expands with more details (context window, strengths, best use cases). Medium effort.

3. **Deploy summary accordion** — Step 2 summary shows model+channel but doesn't let users edit them inline. Add small edit icons that jump back to that step. Small friction for power users.

---

## Chat Page — Review

**File**: `apps/web/src/app/dashboard/chat/page.tsx`

### 3 Specific Improvements

1. **Chat empty state missing CTA** — The empty state (no running agents) says "Deploy an agent first" but has no button. Should include: `<Button onClick={() => router.push('/dashboard/deploy')}>Deploy Agent</Button>`. Quick fix.

2. **No typing/thinking indicator** — When the agent is "thinking" (processing), there's no visible feedback. Add a typing bubble (3 bouncing dots in agent-style bubble) after user sends a message and before first response arrives.

3. **Message timestamp format inconsistency** — Shows time only (no date). When scrolling back through history across days, users lose date context. Consider: "Today 2:30 PM", "Yesterday 11:00 AM", "Apr 4, 2:30 PM".

---

## Empty & Loading States

### Documented in `docs/COMPONENTS.md`

- Dashboard empty state: dashed border card with emoji + CTA
- Chat empty state: centered emoji + text + CTA button
- Chat loading: animated emoji + "Loading messages..." text
- Skeleton loaders: shimmer animation for cards/lists
- Chat typing indicator: 3-dot bounce animation

### Pattern Consistency

Web: Uses `motion` + framer animations throughout  
Mobile: Uses `ActivityIndicator` + manual animations  
Both: Use emoji icons for empty states (🤖, 💬, 🚀)

---

## Mobile ↔ Web Consistency

| Issue | Severity | Detail |
|-------|----------|--------|
| Background hex mismatch | Low | Mobile `dark-950 = #0C0C14` vs Web `dark-950 = #0A0A0F` — align to one |
| Status dot animation | Low | Mobile `StatusDot` has no `animate-pulse` — web badges pulse for active states |
| Card blur | Medium | Mobile cards use `backgroundColor` only — web uses `backdrop-blur-xl` glass effect |
| Font stack | Low | Mobile uses platform fonts, web uses Inter — consider a shared Google Font |
| Button radius | Low | Mobile buttons use `borderRadius: 12` (matches `rounded-xl`), web uses `rounded-xl` — consistent |

---

## Decisions Needed from Dan/CEO

1. **Background color**: `#0C0C14` (mobile) vs `#0A0A0F` (web) — pick one canonical dark-950
2. **Mobile glass effect**: Add backdrop-blur to mobile cards? Impacts performance on older devices
3. **Custom model tooltips**: Build once in a shared component?

---

## Top Priority Fixes (Next Sprint)

1. 🔴 **Chat empty state CTA** — Add deploy button to empty state (5 min fix)
2. 🟡 **Chat typing indicator** — Add thinking bubble (medium)
3. 🟡 **Mobile status dot pulse** — Add animate-pulse for running status (quick)

---

*Next update: 2026-04-07 05:50 UTC*
