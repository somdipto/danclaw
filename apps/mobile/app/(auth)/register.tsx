/**
 * (auth)/register.tsx — Registration Screen
 * 
 * Wired to DanClawClient.register() directly.
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { Colors, Spacing } from '@/constants/theme';
import { danclawClient } from '@danclaw/api';
import type { RegisterRequest } from '@danclaw/shared';

const TOKEN_KEY = 'danclaw_auth_token';

async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const req: RegisterRequest = {
      email: email.trim(),
      password: password.trim(),
      name: name.trim(),
    };
    const result = await danclawClient.register(req);
    if (result.data) {
      await saveToken(result.data.token);
      router.replace('/(tabs)');
    } else {
      Alert.alert('Registration Failed', result.error?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setOauthLoading(true);
    try {
      Alert.alert(
        'Google OAuth',
        'Configure expo-auth-session with Google provider in production.',
        [{ text: 'OK' }]
      );
      await SecureStore.setItemAsync(TOKEN_KEY, 'google_oauth_token');
      router.replace('/(tabs)');
    } catch {
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
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.logo}>🦞</Text>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start deploying AI agents in minutes</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.dark500}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
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
                placeholder="Password (min 8 characters)"
                placeholderTextColor={Colors.dark500}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                disabled={loading}
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

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

              <Text style={styles.terms}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Login link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark950,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
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
  terms: {
    fontSize: 12,
    color: Colors.dark500,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  termsLink: {
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
