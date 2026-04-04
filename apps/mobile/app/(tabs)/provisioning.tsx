/**
 * (tabs)/provisioning.tsx — Deployment Provisioning Screen
 *
 * Polls deployment status every 5 seconds while provisioning.
 * Navigates to chat when status becomes 'running'.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useDeployment } from '@danclaw/api';
import type { Deployment } from '@danclaw/shared';

const POLL_INTERVAL_MS = 5000;

const STEPS = [
  { key: 'pending', label: 'Initializing', icon: '⚙️' },
  { key: 'building', label: 'Building image', icon: '📦' },
  { key: 'deploying', label: 'Deploying', icon: '🚀' },
  { key: 'running', label: 'Ready', icon: '✅' },
];

function getStepIndex(status: string): number {
  if (status === 'error') return -1;
  if (status === 'pending') return 0;
  if (status === 'building') return 1;
  if (status === 'deploying') return 2;
  if (status === 'running') return 3;
  return 0;
}

export default function ProvisioningScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigatedRef = useRef(false);

  const { data, isLoading, isError, refetch } = useDeployment(id ?? '', {
    refetchInterval: POLL_INTERVAL_MS,
  });

  const deployment: Deployment | undefined = data?.data;
  const status = deployment?.status ?? 'pending';
  const stepIndex = getStepIndex(status);
  const isTerminal = status === 'running' || status === 'error';
  const isRunning = status === 'running';

  useEffect(() => {
    if (isRunning && !navigatedRef.current) {
      navigatedRef.current = true;
      router.replace(`/(tabs)/chat/${id}`);
    }
  }, [isRunning, id, router]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          {/* Header */}
          <Text style={styles.title}>Deploying Agent</Text>
          <Text style={styles.subtitle}>
            {isRunning
              ? 'Your agent is ready!'
              : 'Setting up your AI agent, this usually takes 1–2 minutes.'}
          </Text>

          {/* Status indicator */}
          <View style={styles.statusCard}>
            {isLoading && (
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={{ marginBottom: 16 }}
              />
            )}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isRunning
                    ? 'rgba(34,197,94,0.15)'
                    : isError
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(99,102,241,0.15)',
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {isRunning ? 'RUNNING' : status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.serviceName}>
              {deployment?.service_name ?? 'Agent'}
            </Text>
          </View>

          {/* Progress Steps */}
          <View style={styles.stepsCard}>
            {STEPS.map((step, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              const failed = status === 'error' && i === stepIndex;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepIcon,
                      done && styles.stepDone,
                      active && styles.stepActive,
                      failed && styles.stepError,
                    ]}
                  >
                    <Text style={styles.stepIconText}>
                      {done ? '✓' : step.icon}
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        (done || active) && styles.stepLabelActive,
                        failed && styles.stepLabelError,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {active && !isRunning && !failed && (
                      <ActivityIndicator
                        size="small"
                        color={Colors.primary}
                        style={{ alignSelf: 'flex-start', marginTop: 4 }}
                      />
                    )}
                  </View>
                  {i < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        done && styles.stepLineDone,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Error state */}
          {status === 'error' && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                {deployment?.error_message ?? 'Deployment failed. Please try again.'}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.replace('/(tabs)/deploy')}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Running: Go to chat */}
          {isRunning && (
            <TouchableOpacity
              style={styles.chatButton}
              activeOpacity={0.8}
              onPress={() => router.replace(`/(tabs)/chat/${id}`)}
            >
              <Text style={styles.chatButtonText}>💬 Start Chatting</Text>
            </TouchableOpacity>
          )}

          {/* Cancel */}
          {!isTerminal && (
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark950 },
  safeArea: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark400,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: Colors.dark800,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark700,
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.white,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  stepsCard: {
    backgroundColor: Colors.dark800,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 56,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark700,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepActive: {
    backgroundColor: Colors.primary,
  },
  stepDone: {
    backgroundColor: Colors.secondary,
  },
  stepError: {
    backgroundColor: Colors.error,
  },
  stepIconText: {
    fontSize: 18,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 14,
    paddingTop: 8,
    paddingBottom: 20,
  },
  stepLabel: {
    fontSize: 15,
    color: Colors.dark400,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  stepLabelError: {
    color: Colors.error,
  },
  stepLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 28,
    backgroundColor: Colors.dark700,
    zIndex: 0,
  },
  stepLineDone: {
    backgroundColor: Colors.secondary,
  },
  errorCard: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    marginTop: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  chatButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  chatButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 17,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: Colors.dark400,
    fontSize: 15,
  },
});
