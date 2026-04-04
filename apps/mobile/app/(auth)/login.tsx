/**
 * (auth)/login.tsx — Google OAuth + Email Login Screen
 * 
 * Wired to DanClawClient via useLogin from @danclaw/api.
 * Token stored in expo-secure-store.
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { Colors, Spacing } from '@/constants/theme';
import { useLogin } from '@danclaw/api';
import type { LoginRequest } from '@danclaw/shared';

const TOKEN_KEY = 'danclaw_auth_token';

async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const loginMutation = useLogin({
    onSuccess: async (result) => {
      if (result.data) {
        await saveToken(result.data.token);
        router.replace('/(tabs)');
      } else if (result.error) {
        Alert.alert('Login Failed', result.error.message);
        setLoading(false);
      }
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Something went wrong');
      setLoading(false);
    },
  });

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    const req: LoginRequest = { email: email.trim(), password: password.trim() };
    loginMutation.mutate(req);
  };

  const handleGoogleOAuth = async () => {
    setOauthLoading(true);
    try {
      // In production: use expo-auth-session with Google provider
      // For now, simulate OAuth by opening a mock flow
      Alert.alert(
        'Google OAuth',
        'Configure expo-auth-session with Google provider in production.',
        [{ text: 'OK' }]
      );
      // Simulated success — replace with real OAuth
      await SecureStore.setItemAsync(TOKEN_KEY, 'google_oauth_token');
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('OAuth Error', 'Google sign-in failed. Please try again.');
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>🦞</Text>
            <Text style={styles.logoText}>DanClaw</Text>
            <Text style={styles.tagline}>AI Agent Deployment Platform</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.dark500}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.dark500}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              disabled={loading}
              onPress={handleEmailLogin}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google OAuth */}
            <TouchableOpacity
              style={[styles.oauthButton, oauthLoading && styles.buttonDisabled]}
              disabled={oauthLoading}
              onPress={handleGoogleOAuth}
              activeOpacity={0.8}
            >
              {oauthLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.oauthIcon}>🌐</Text>
                  <Text style={styles.oauthButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple OAuth */}
            <TouchableOpacity
              style={[styles.oauthButton, { marginTop: 12 }]}
              onPress={() => Alert.alert('Coming Soon', 'Apple Sign-In will be available soon.')}
              activeOpacity={0.8}
            >
              <Text style={styles.oauthIcon}>🍎</Text>
              <Text style={styles.oauthButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Sign up free</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark950,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.dark400,
    marginTop: 4,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: Colors.dark800,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark700,
  },
  dividerText: {
    color: Colors.dark500,
    fontSize: 13,
    marginHorizontal: 16,
  },
  oauthButton: {
    backgroundColor: Colors.dark800,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  oauthIcon: {
    fontSize: 20,
  },
  oauthButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: Colors.dark400,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
