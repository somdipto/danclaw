import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { configureTokenStorage } from '@danclaw/api';

const TOKEN_KEY = 'danclaw_auth_token';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const DanClawTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.dark950,
    card: Colors.dark900,
    text: Colors.white,
    border: Colors.dark700,
    notification: Colors.error,
  },
};

// Configure DanClawClient to use expo-secure-store on mobile
configureTokenStorage({
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  saveToken: (token) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clearToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),
});

export default function RootLayout() {
  const [authChecked, setAuthChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        setHasToken(!!token);
      } catch {
        setHasToken(false);
      } finally {
        setAuthChecked(true);
      }
    };
    checkToken();
  }, []);

  if (!authChecked) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const initialRoute = hasToken ? '(tabs)' : '(auth)/login';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DanClawTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.dark950 },
            animation: 'slide_from_right',
          }}
          initialRouteName={initialRoute}
        >
          <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
          <Stack.Screen name="(auth)/register" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(tabs)/chat/[id]"
            options={{
              headerShown: true,
              headerTitle: '',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: Colors.dark950 },
              headerTintColor: Colors.white,
            }}
          />
          <Stack.Screen
            name="(tabs)/provisioning"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.dark950,
    alignItems: 'center',
    justifyContent: 'center',
  },
});