/**
 * (tabs)/provisioning.tsx — Deployment Provisioning Screen
 * 
 * Polls deployment status every 5 seconds while provisioning.
 * Navigates to chat when deployment is running.
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
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useDeployment } from '@danclaw/api';

const PROVISIONING_STEPS = [
  { id: 'queued',     label: 'Queued',         icon: '📋' },
  { id: 'building',   label: 'Building image', icon: '🔨' },
  { id: 'pulling',    label: 'Pulling image',   icon: '📦' },
  { id: 'starting',   label: 'Starting container', icon: '🚀' },
  { id: 'configuring',label: 'Configuring',     icon: '⚙️' },
  { id: 'running',    label: 'Ready',           icon: '✅' },
];

const STATUS_TO_STEP: Record<string, string> = {
  provisioning: 'queued',
  building: 'building',
  pulling: 'pulling',
  container_starting: 'starting',
  configuring: 'configuring',
  running: 'running',
  error: 'running',
  stopped: 'running',
};

export default function ProvisioningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, isLoading, isError } = useDeployment(id ?? '', {
    refetchInterval: 5000,
  });

  const deployment = data?.data;
  const status = deployment?.status ?? 'provisioning';
  const activeStepId = STATUS_TO_STEP[status] ?? 'queued';
  const activeStepIndex = PROVISIONING_STEPS.findIndex(s => s.id === activeStepId);

  useEffect(() => {
    if (status === 'running') {
      const timer = setTimeout(() => {
        router.replace(`/(tabs)/chat/${id}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, id, router]);

  useEffect(() => {
    if (isError) {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isError]);

  if (isLoading || !deployment) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centered}>
            <Text style={styles.errorEmoji}>❌</Text>
            <Text style={styles.errorTitle}>Deployment Failed</Text>
            <Text style={styles.errorText}>Could not load deployment status.</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.back()}
            >
              <Text style={styles.actionButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (status === 'running') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centered}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successTitle}>Agent Ready!</Text>
            <Text style={styles.successSubtitle}>Redirecting to chat...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centered}>
            <Text style={styles.errorEmoji}>❌</Text>
            <Text style={styles.errorTitle}>Deployment Error</Text>
            <Text style={styles.errorText}>
              Something went wrong during provisioning.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.replace('/(tabs)/deploy')}
            >
              <Text style={styles.actionButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Deploying Agent</Text>
          <Text style={styles.serviceName}>{deployment.service_name}</Text>

          {/* Progress */}
          <View style={styles.progressContainer}>
            {PROVISIONING_STEPS.slice(0, -1).map((step, i) => {
              const isDone = i < activeStepIndex;
              const isActive = i === activeStepIndex;
              return (
                <View key={step.id} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isDone && styles.stepCircleDone,
                      isActive && styles.stepCircleActive,
                    ]}
                  >
                    <Text style={styles.stepIcon}>{step.icon}</Text>
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
                  {i < PROVISIONING_STEPS.length - 2 && (
                    <View
                      style={[
                        styles.stepLine,
                        isDone && styles.stepLineDone,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.statusBadge}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.statusText}>
              {status.charAt(0).toUpperCase() + status.slice(1)}...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark950 },
  safeArea: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: Spacing.four,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    color: Colors.dark400,
    marginBottom: 48,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark800,
    borderWidth: 2,
    borderColor: Colors.dark700,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepCircleDone: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepIcon: { fontSize: 20 },
  stepLabel: {
    fontSize: 14,
    color: Colors.dark500,
    marginLeft: 16,
    flex: 1,
  },
  stepLabelDone: { color: Colors.secondary },
  stepLabelActive: { color: Colors.white, fontWeight: '600' },
  stepLine: {
    position: 'absolute',
    left: 22,
    top: 44,
    width: 2,
    height: 32,
    backgroundColor: Colors.dark700,
    zIndex: 0,
  },
  stepLineDone: { backgroundColor: Colors.secondary },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 48,
    backgroundColor: Colors.dark800,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.dark700,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 14,
    color: Colors.dark300,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.dark400,
    marginTop: 12,
  },
  successEmoji: { fontSize: 64 },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.dark400,
  },
  errorEmoji: { fontSize: 64 },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  errorText: {
    fontSize: 14,
    color: Colors.dark400,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
