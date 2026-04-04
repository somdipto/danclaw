/**
 * (tabs)/provisioning.tsx — Deployment Provisioning Screen
 * 
 * Polls deployment status every 5 seconds.
 * Shows progress steps: provisioning → building → deploying → running
 * Navigates to chat when status is 'running'.
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
  { key: 'provisioning', label: 'Provisioning infrastructure' },
  { key: 'building', label: 'Building container image' },
  { key: 'deploying', label: 'Deploying to region' },
  { key: 'running', label: 'Ready' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'provisioning': return 0;
    case 'building': return 1;
    case 'deploying': return 2;
    case 'running': return 3;
    case 'error': return -1;
    default: return 0;
  }
}

function StepItem({ step, currentStep, isComplete, isError }: {
  step: { key: string; label: string };
  currentStep: number;
  isComplete: boolean;
  isError: boolean;
}) {
  const isCurrent = PROVISIONING_STEPS[currentStep]?.key === step.key;
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepLeft}>
        <View style={[
          styles.stepCircle,
          isComplete && styles.stepCircleDone,
          isCurrent && styles.stepCircleActive,
          isError && styles.stepCircleError,
        ]}>
          {isComplete ? (
            <Text style={styles.stepCheck}>✓</Text>
          ) : isError ? (
            <Text style={styles.stepCheck}>✗</Text>
          ) : (
            <Text style={styles.stepNumber}>{PROVISIONING_STEPS.indexOf(step) + 1}</Text>
          )}
        </View>
        {PROVISIONING_STEPS.indexOf(step) < PROVISIONING_STEPS.length - 1 && (
          <View style={[styles.stepLine, isComplete && styles.stepLineDone]} />
        )}
      </View>
      <View style={styles.stepContent}>
        <Text style={[
          styles.stepLabel,
          isCurrent && styles.stepLabelCurrent,
          isComplete && styles.stepLabelDone,
          isError && styles.stepLabelError,
        ]}>
          {step.label}
        </Text>
        {isCurrent && !isError && (
          <Text style={styles.stepHint}>In progress...</Text>
        )}
      </View>
    </View>
  );
}

export default function ProvisioningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const hasNavigated = useRef(false);

  const { data, isLoading, isError: queryError } = useDeployment(id ?? '', {
    refetchInterval: 5000,
  });

  const deployment = data?.data;
  const status = deployment?.status ?? 'provisioning';
  const currentStep = getStepIndex(status);
  const isFailed = status === 'error';

  useEffect(() => {
    if (!id) return;
    if (status === 'running' && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace(`/(tabs)/chat/${id}`);
    }
  }, [status, id, router]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🦞</Text>
          <Text style={styles.title}>Setting Up Your Agent</Text>
          <Text style={styles.subtitle}>
            {isFailed
              ? 'Something went wrong during provisioning'
              : deployment?.service_name
                ? `Deploying ${deployment.service_name}...`
                : 'Deploying your agent...'}
          </Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {PROVISIONING_STEPS.map((step) => {
            const stepIdx = PROVISIONING_STEPS.indexOf(step);
            const isComplete = stepIdx < currentStep || (stepIdx === currentStep && status === 'running');
            const isCurrent = stepIdx === currentStep && !isFailed;
            return (
              <StepItem
                key={step.key}
                step={step}
                currentStep={currentStep}
                isComplete={isComplete}
                isError={false}
              />
            );
          })}

          {isFailed && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {deployment?.error_message ?? 'An error occurred. Please try again.'}
              </Text>
            </View>
          )}
        </View>

        {/* Spinner / Info */}
        <View style={styles.footer}>
          {!isFailed && !isLoading && (
            <ActivityIndicator size="small" color={Colors.primary} />
          )}
          <Text style={styles.footerText}>
            {isLoading && 'Loading...'}
            {!isLoading && !isFailed && 'This usually takes 1-2 minutes'}
            {isFailed && 'Tap to retry or contact support'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark950 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 48 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.dark400, textAlign: 'center' },
  stepsContainer: { flex: 1, paddingHorizontal: 16 },
  stepItem: { flexDirection: 'row', minHeight: 60 },
  stepLeft: { alignItems: 'center', width: 40 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark700,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark600,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleDone: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  stepCircleError: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  stepNumber: { fontSize: 14, fontWeight: '700', color: Colors.dark400 },
  stepCheck: { fontSize: 14, fontWeight: '700', color: Colors.white },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.dark700,
    marginVertical: 4,
  },
  stepLineDone: { backgroundColor: Colors.secondary },
  stepContent: { flex: 1, paddingLeft: 12, paddingTop: 4 },
  stepLabel: { fontSize: 15, color: Colors.dark400 },
  stepLabelCurrent: { color: Colors.white, fontWeight: '600' },
  stepLabelDone: { color: Colors.dark400 },
  stepLabelError: { color: Colors.error },
  stepHint: { fontSize: 12, color: Colors.dark500, marginTop: 2 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    marginTop: 16,
  },
  errorText: { fontSize: 14, color: Colors.error, textAlign: 'center' },
  footer: { alignItems: 'center', paddingBottom: 40, gap: 12 },
  footerText: { fontSize: 13, color: Colors.dark500, textAlign: 'center' },
});
