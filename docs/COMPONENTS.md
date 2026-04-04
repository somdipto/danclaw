# DanClaw UI Components

## Overview

Component library for DanClaw web app. All components are in `apps/web/src/components/ui/`.

---

## Badge

**File**: `Badge.tsx`

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `DeploymentStatus` | required | Current deployment status |
| `size` | `'sm' \| 'md'` | `'md'` | Badge size |

### Status Variants
```tsx
type DeploymentStatus = 
  | 'running'      // Green, pulsing dot
  | 'provisioning' // Indigo, pulsing dot
  | 'starting'     // Indigo, pulsing dot
  | 'stopping'     // Amber, pulsing dot
  | 'stopped'      // Gray, static dot
  | 'restarting'   // Indigo, pulsing dot
  | 'destroying'   // Red, pulsing dot
  | 'error'        // Red, pulsing dot
```

### Usage
```tsx
<Badge status="running" />           // Medium (default)
<Badge status="provisioning" size="sm" /> // Small
```

### Visual
- Rounded-full pill with status dot
- Background color matches status
- `animate-pulse` on active statuses

---

## Button

**File**: `Button.tsx`

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'outline'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show spinner |
| `icon` | `React.ReactNode` | - | Leading icon |
| `fullWidth` | `boolean` | `false` | Full width button |
| `disabled` | `boolean` | - | Disabled state |

### Variants

#### Primary (Default)
```tsx
<Button>Deploy Agent</Button>
```
- Background: `primary-500`
- Hover: `primary-600` + glow shadow
- Active: `scale-[0.98]`

#### Secondary
```tsx
<Button variant="secondary">Stop</Button>
```
- Background: `secondary-500`
- Use for: success actions, running state

#### Ghost
```tsx
<Button variant="ghost">Cancel</Button>
```
- Transparent background
- Hover: `dark-800` background

#### Danger
```tsx
<Button variant="danger">Delete</Button>
```
- Red tint background
- Border: red-500/20

#### Outline
```tsx
<Button variant="outline">View Details</Button>
```
- Transparent with border
- Hover: primary-500/50 border

### Sizes
| Size | Padding | Border Radius |
|------|---------|---------------|
| `sm` | `px-3 py-1.5` | `rounded-lg` (8px) |
| `md` | `px-5 py-2.5` | `rounded-xl` (12px) |
| `lg` | `px-6 py-3` | `rounded-xl` (12px) |
| `xl` | `px-8 py-4` | `rounded-2xl` (16px) |

### Loading State
```tsx
<Button loading={isDeploying}>Deploying...</Button>
```
- Shows spinner icon
- Disabled while loading

### With Icon
```tsx
<Button icon={<span>🚀</span>}>Deploy</Button>
```

---

## Card

**File**: `Card.tsx`

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Card content |
| `className` | `string` | `''` | Additional classes |
| `hover` | `boolean` | `false` | Enable hover effect |
| `glow` | `boolean` | `false` | Enable glow effect |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding size |
| `onClick` | `() => void` | - | Click handler |

### Padding Values
| Size | Value | Use Case |
|------|-------|----------|
| `none` | 0 | Custom padding |
| `sm` | `p-4` | Compact cards |
| `md` | `p-6` | Default (most common) |
| `lg` | `p-8` | Large content areas |

### Usage

#### Default Card
```tsx
<Card>
  <h3>Title</h3>
  <p>Content goes here</p>
</Card>
```

#### Hoverable Card
```tsx
<Card hover onClick={() => handleSelect(id)}>
  <p>Clickable with hover effect</p>
</Card>
```

#### No Padding
```tsx
<Card padding="none">
  <CustomComponent />
</Card>
```

### Base Styles
```tsx
rounded-2xl border border-dark-700/50
bg-dark-800/50 backdrop-blur-xl
```

### Hover Effect
```tsx
hover:bg-dark-800/70 hover:border-primary-500/30 
cursor-pointer transition-all duration-300 hover:-translate-y-0.5
```

---

## StatsCard

**File**: `StatsCard.tsx`

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | required | Emoji icon |
| `label` | `string` | required | Stat label |
| `value` | `string \| number` | required | Stat value |
| `trend` | `string` | - | Trend indicator |
| `trendUp` | `boolean` | - | Is trend positive |
| `className` | `string` | `''` | Additional classes |

### Usage
```tsx
<StatsCard 
  icon="🟢" 
  label="Running Agents" 
  value={3}
  trend="+1 this week"
  trendUp
/>
```

### Layout
```
┌─────────────────────┐
│ 🤖           +12%  │  ← Icon + trend badge
│                     │
│   3                 │  ← Value (3xl bold)
│   Running Agents    │  ← Label (sm muted)
└─────────────────────┘
```

### Trend Colors
| trendUp | Color | Background |
|---------|-------|------------|
| `true` | `secondary-400` | `secondary-500/10` |
| `false` | `red-400` | `red-500/10` |

---

## ProgressBar

**File**: `ProgressBar.tsx`

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Progress 0-100 |
| `className` | `string` | `''` | Additional classes |
| `color` | `'primary' \| 'secondary' \| 'accent'` | `'primary'` | Bar color |

### Usage
```tsx
<ProgressBar value={65} />
<ProgressBar value={100} color="secondary" />
```

---

## Empty States

Empty states communicate that content is missing. Use clear messaging and a clear CTA.

### Pattern
```tsx
<div className="text-center py-12">
  <p className="text-4xl mb-4">💬</p>        {/* Contextual emoji */}
  <p className="text-white font-medium mb-2">No running agents</p>  {/* Title */}
  <p className="text-dark-400 text-sm mb-6">Deploy an agent to start chatting</p>  {/* Description */}
  <Button>Deploy Agent</Button>              {/* Primary CTA */}
</div>
```

### Dashboard Empty State
```tsx
<Card className="text-center py-12">
  <p className="text-4xl mb-4">🚀</p>
  <p className="text-white font-medium mb-2">No agents yet</p>
  <p className="text-dark-400 text-sm mb-6">Deploy your first AI agent in under 60 seconds</p>
  <Link href="/dashboard/deploy">
    <Button icon={<span>🚀</span>}>Deploy Your First Agent</Button>
  </Link>
</Card>
```

### Chat Empty State
```tsx
<div className="flex flex-col items-center justify-center h-full">
  <p className="text-4xl mb-4">💬</p>
  <p className="text-white font-medium mb-2">No running agents</p>
  <p className="text-dark-400 text-sm mb-6">Deploy an agent to start chatting</p>
  <a href="/dashboard/deploy" className="px-6 py-3 rounded-xl bg-primary-500...">
    🚀 Deploy Agent
  </a>
</div>
```

---

## Loading States

### Spinner
```tsx
// Default
<div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />

// Small
<div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
```

### Skeleton Loading
```tsx
// Card skeleton
<div className="h-32 bg-dark-800 rounded-2xl animate-pulse" />

// List item skeleton
<div className="h-20 bg-dark-800 rounded-xl animate-pulse" />

// Text skeleton
<div className="h-4 w-48 bg-dark-800 rounded animate-pulse" />
```

### Dashboard Skeleton
```tsx
<div className="space-y-8 animate-fade-in">
  <div className="h-8 w-48 bg-dark-800 rounded-xl animate-pulse" />
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-32 bg-dark-800 rounded-2xl animate-pulse" />
    ))}
  </div>
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse" />
    ))}
  </div>
</div>
```

### Chat Typing Indicator
```tsx
<div className="flex justify-start">
  <div className="bg-dark-800/70 border border-dark-700/50 rounded-2xl rounded-bl-md px-5 py-3.5">
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
</div>
```

---

## Common Patterns

### Glass Card Effect
```tsx
bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl
```

### Input Fields
```tsx
bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5
focus:border-primary-500 focus:outline-none
placeholder:text-dark-500
```

### Error Banner
```tsx
<div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-up">
  <p className="text-sm text-red-400">{errorMessage}</p>
  <button onClick={dismissError} className="text-red-400 hover:text-red-300 ml-4">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>
```
