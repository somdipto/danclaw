import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

const DanClawTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6366f1',
    background: '#0C0C14',
    card: '#111118',
    text: '#ffffff',
    border: '#2a2a3a',
    notification: '#ef4444',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DanClawTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
