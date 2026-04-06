/**
 * (tabs)/provisioning.tsx — Deployment Provisioning Screen
 * 
 * Polls deployment status every 5 seconds during provisioning.
 * Shows progress steps. Navigates to chat when status is 'running'.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useDeployment } from '@danclaw/api';

const PROVISIONING_STEPS = [
  { label: 'Initializing', key: 'initializing' },
  { label: 'Provisioning infrastructure', key: 'provisioning' },
  { label: 'Setting up model', key: 'setting_up_model' },
  { label: 'Configuring channel', key: 'configuring' },
  { label: 'Starting agent', key: 'starting' },
];

const STEP_STATUS_MAP: Record<string, number> = {
  pending: 0,
  initializing: 1,
  provisioning: 2,
  setting_up_model: 3,
  configuring: 4,
  starting: 5,
};

export default function ProvisioningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigateRef = useRef(false);

  const { data, isLoading, isError } = useDeployment(id ?? '', {
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      // Stop polling once running or failed
      if (status === 'running' || status === 'stopped' || status === 'error') {
        return false;
      }
      return 5000; // poll every 5s
    },
  });

  const deployment = data?.data;
  const status = deployment?.status ?? 'provisioning';
  const currentStep = STEP_STATUS_MAP[status] ?? 0;

  // Navigate to chat when running
  useEffect(() => {
    if (status === 'running' && !navigateRef.current && id) {
      navigateRef.current = true;
      router.replace(`/(tabs)/chat/${id}`);
    }
  }, [status, id, router]);

  if (isLoading || !id) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isError || !deployment) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <Text style={styles.errorEmoji}>❌</Text>
            <Text style={styles.errorTitle}>Failed to load deployment</Text>
            <Text style={styles.errorSubtitle}>Please try again later</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>
              {status === 'running' ? '✅' : status === 'error' ? '❌' : '🚀'}
            </Text>
            <Text style={styles.title}>
              {status === 'running'
                ? 'Agent Ready!'
                : status === 'error'
                  ? 'Deployment Failed'
                  : 'Provisioning Agent'}
            </Text>
            <Text style={styles.serviceName}>{deployment.service_name}</Text>
          </View>

          {/* Progress Steps */}
          {status !== 'running' && status !== 'error' && (
            <View style={styles.stepsContainer}>
              {PROVISIONING_STEPS.map((step, index) => {
                const isDone = index < currentStep;
                const isActive = index === currentStep;
                return (
                  <View key={step.key} style={styles.stepRow}>
                    <View style={styles.stepIndicator}>
                      <View
                        style={[
                          styles.stepCircle,
                          isDone && styles.stepCircleDone,
                          isActive && styles.stepCircleActive,
                        ]}
                      >
                        <Text style={styles.stepCheck}>
                          {isDone ? '✓' : isActive ? '●' : '○'}
                        </Text>
                      </View>
                      {index < PROVISIONING_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            isDone && styles.stepLineDone,
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isDone && styles.stepLabelDone,
                        isActive && styles.stepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Status Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text
                style={[
                  styles.summaryValue,
                  status === 'running' && { color: Colors.secondary },
                  status === 'error' && { color: Colors.error },
                ]}
              >
                {status}
              </Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: Colors.dark700 }]}>
              <Text style={styles.summaryLabel}>Model</Text>
              <Text style={styles.summaryValue}>{deployment.model}</Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: Colors.dark700 }]}>
              <Text style={styles.summaryLabel}>Channel</Text>
              <Text style={styles.summaryValue}>{deployment.channel}</Text>
            </View>
          </View>

          {status === 'running' && (
            <View style={styles.readyCard}>
              <Text style={styles.readyText}>
                Your agent is up and running! Redirecting to chat...
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark950 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 16, color: Colors.dark400, marginTop: 16 },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  serviceName: { fontSize: 16, color: Colors.dark400, marginTop: 8 },
  stepsContainer: { marginBottom: 32 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  stepIndicator: { alignItems: 'center', width: 32, marginRight: 12 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: Colors.secondary },
  stepCircleActive: { backgroundColor: Colors.primary },
  stepCheck: { fontSize: 14, color: Colors.white, fontWeight: '700' },
  stepLine: { width: 2, height: 32, backgroundColor: Colors.dark700, marginTop: 2 },
  stepLineDone: { backgroundColor: Colors.secondary },
  stepLabel: { fontSize: 16, color: Colors.dark500, marginTop: 4 },
  stepLabelDone: { color: Colors.secondary },
  stepLabelActive: { color: Colors.white, fontWeight: '600' },
  summaryCard: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark700,
    overflow: 'hidden',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  summaryLabel: { fontSize: 14, color: Colors.dark400 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: Colors.white },
  readyCard: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  readyText: { fontSize: 14, color: Colors.secondary, textAlign: 'center' },
  errorEmoji: { fontSize: 64 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  errorSubtitle: { fontSize: 14, color: Colors.dark400 },
});
