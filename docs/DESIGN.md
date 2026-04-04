# DanClaw Design System

## Overview

DanClaw uses a **dark-first, glassy aesthetic** with layered transparency, backdrop blur, and subtle glows. The design language prioritizes depth and clarity in a dark environment.

---

## Color Palette

### Primary (Indigo)
| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#EEF2FF` | Lightest tint |
| `primary-100` | `#E0E7FF` | Subtle backgrounds |
| `primary-200` | `#C7D2FE` | Borders on light |
| `primary-300` | `#A5B4FC` | Accents |
| `primary-400` | `#818CF8` | Hover states |
| `primary-500` | `#6366F1` | **Default primary** |
| `primary-600` | `#4F46E5` | Hover/active |
| `primary-700` | `#4338CA` | Pressed state |
| `primary-800` | `#3730A3` | Dark accents |
| `primary-900` | `#312E81` | Darkest tint |
| `primary-950` | `#1E1B4B` | Deepest background |

### Secondary (Emerald)
| Token | Hex | Usage |
|-------|-----|-------|
| `secondary-500` | `#10B981` | **Default** - Success, running status |
| `secondary-400` | `#34D399` | Hover |
| `secondary-600` | `#059669` | Pressed |

### Accent (Amber)
| Token | Hex | Usage |
|-------|-----|-------|
| `accent-500` | `#F59E0B` | **Default** - Warnings, attention |
| `accent-400` | `#FBBF24` | Hover |
| `accent-600` | `#D97706` | Pressed |

### Dark Scale
| Token | Hex | Usage |
|-------|-----|-------|
| `dark-50` | `#F9FAFB` | Light text on dark |
| `dark-100` | `#F3F4F6` | Borders on dark |
| `dark-200` | `#E5E7EB` | Secondary text |
| `dark-300` | `#D1D5DB` | Muted text |
| `dark-400` | `#9CA3AF` | **Placeholder text** |
| `dark-500` | `#6B7280` | Disabled |
| `dark-600` | `#4B5563` | Subtle borders |
| `dark-700` | `#374151` | Card backgrounds |
| `dark-800` | `#1F2937` | **Default dark bg** |
| `dark-900` | `#111827` | Darker sections |
| `dark-950` | `#0A0A0F` | **Deepest background** |

### Semantic Colors
| Purpose | Color | Usage |
|---------|-------|-------|
| Success | `secondary-500` `#10B981` | Running, complete |
| Warning | `accent-500` `#F59E0B` | Stopping, caution |
| Error | `red-500` `#EF4444` | Error states, destroy |
| Info | `primary-500` `#6366F1` | Provisioning, info |

---

## Typography

### Font Stack
```
font-family: 'Inter', system-ui, -apple-system, sans-serif;
font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px / 2rem | 700 (bold) | 1.2 |
| H2 | 24px / 1.5rem | 600 (semibold) | 1.3 |
| H3 | 20px / 1.25rem | 600 (semibold) | 1.4 |
| Body | 16px / 1rem | 400 (normal) | 1.5 |
| Body Small | 14px / 0.875rem | 400 | 1.5 |
| Caption | 12px / 0.75rem | 400 | 1.4 |
| Button | 14px / 0.875rem | 500 (medium) | 1 |

---

## Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Icon gaps |
| `space-3` | 12px | Input padding |
| `space-4` | 16px | Card padding (sm) |
| `space-5` | 20px | Between elements |
| `space-6` | 24px | Card padding (md) |
| `space-8` | 32px | Section gaps |
| `space-12` | 48px | Large sections |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Cards, modals |
| `rounded-2xl` | 16px | Large cards |
| `rounded-full` | 9999px | Badges, pills |

---

## Animations

### Duration
| Token | Value | Usage |
|-------|-------|-------|
| `duration-100` | 100ms | Micro-interactions |
| `duration-200` | 200ms | Hover states |
| `duration-300` | 300ms | Transitions |
| `duration-500` | 500ms | Page transitions |

### Keyframe Animations
| Name | Description |
|------|-------------|
| `fade-in` | Opacity 0→1, 500ms ease-out |
| `slide-up` | translateY(20px)→0, 500ms ease-out |
| `slide-down` | translateY(-10px)→0, 300ms ease-out |
| `scale-in` | scale(0.95)→1, 300ms ease-out |
| `pulse-slow` | 3s pulse for status dots |
| `glow` | Box-shadow glow effect, 2s |
| `shimmer` | Loading shimmer effect |
| `spin-slow` | 3s continuous spin |
| `float` | 6s floating motion |

### Easing
```css
ease-out /* Default for most transitions */
ease-in-out /* Smooth oscillations */
cubic-bezier(0.4, 0, 0.6, 1) /* Pulse animation */
```

---

## Dark Theme

The entire app runs in dark mode by default.

### Background Layers
1. **Base**: `dark-950` (#0A0A0F)
2. **Card**: `dark-800/50` with backdrop blur
3. **Elevated**: `dark-800/70` for hover states
4. **Overlay**: `dark-700/50` for tooltips

### Glass Effect
```tsx
bg-dark-800/50 backdrop-blur-xl border border-dark-700/50
```

### Text Contrast
| Element | Color | Contrast |
|---------|-------|----------|
| Primary text | `white` / `#FFFFFF` | 15:1 |
| Secondary text | `dark-200` / `#E5E7EB` | 10:1 |
| Muted text | `dark-400` / `#9CA3AF` | 4.5:1 |
| Placeholder | `dark-500` / `#6B7280` | 3:1 |

---

## Shadows

### Default Shadow
```css
shadow-lg shadow-primary-500/25
```

### Hover Shadow
```css
hover:shadow-primary-500/40
```

---

## Z-Index Scale
| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default |
| Dropdown | 50 | Menus, selects |
| Sticky | 100 | Fixed headers |
| Modal | 200 | Modals, dialogs |
| Toast | 300 | Notifications |
| Tooltip | 400 | Tooltips |
