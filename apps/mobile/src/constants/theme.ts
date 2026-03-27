/**
 * DanClaw Design System — Dark-mode-first theme matching the web app
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  // Brand
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  secondary: '#22c55e',
  secondaryLight: '#4ade80',
  accent: '#f59e0b',

  // Dark palette
  dark950: '#0C0C14',
  dark900: '#111118',
  dark800: '#1a1a24',
  dark700: '#2a2a3a',
  dark600: '#3a3a4e',
  dark500: '#5a5a72',
  dark400: '#8888a0',
  dark300: '#b0b0c4',
  dark200: '#d0d0de',

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#6366f1',

  white: '#ffffff',
  black: '#000000',

  // Theme mapping (dark-mode only for DanClaw)
  light: {
    text: '#ffffff',
    background: '#0C0C14',
    backgroundElement: '#1a1a24',
    backgroundSelected: '#2a2a3a',
    textSecondary: '#8888a0',
  },
  dark: {
    text: '#ffffff',
    background: '#0C0C14',
    backgroundElement: '#1a1a24',
    backgroundSelected: '#2a2a3a',
    textSecondary: '#8888a0',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
