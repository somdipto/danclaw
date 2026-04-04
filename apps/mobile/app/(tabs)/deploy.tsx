/**
 * (tabs)/deploy.tsx — Deploy Agent Screen
 * 
 * 3-step wizard: Model → Channel → Review & Deploy
 * Wired to useCreateDeployment from @danclaw/api
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing, BottomTabInset } from '@/constants/theme';
import { useCreateDeployment } from '@danclaw/api';
import { AI_MODELS, CHANNELS } from '@danclaw/shared';
import type { CreateDeploymentRequest } from '@danclaw/shared';

type Step = 'model' | 'channel' | 'review';

export default function DeployScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('model');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('us-central1');
  const [serviceName, setServiceName] = useState('');

  const createDeployment = useCreateDeployment({
    onSuccess: (result) => {
      if (result.data) {
        const depId = result.data.deployment?.id;
        if (depId) {
          router.replace(`/(tabs)/provisioning?id=${depId}`);
        } else {
          router.replace('/(tabs)');
        }
      } else if (result.error) {
        Alert.alert('Deployment Failed', result.error.message);
      }
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Something went wrong');
    },
  });

  const stepIndex = step === 'model' ? 0 : step === 'channel' ? 1 : 2;
  const stepLabels = ['Model', 'Channel', 'Review'];

  const handleDeploy = () => {
    if (!serviceName.trim()) {
      Alert.alert('Error', 'Please enter a service name');
      return;
    }
    const req: CreateDeploymentRequest = {
      service_name: serviceName.trim(),
      tier: 'free',
      region: selectedRegion,
      model: selectedModel,
      channel: selectedChannel,
    };
    createDeployment.mutate(req);
  };

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);
  const selectedChannelData = CHANNELS.find(c => c.id === selectedChannel);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.title}>Deploy Agent</Text>
          <Text style={styles.subtitle}>Set up your AI agent in 3 simple steps</Text>

          {/* Progress */}
          <View style={styles.progress}>
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                <View style={styles.stepContainer}>
                  <View
                    style={[
                      styles.stepCircle,
                      i < stepIndex
                        ? styles.stepDone
                        : i === stepIndex
                          ? styles.stepActive
                          : styles.stepPending,
                    ]}
                  >
                    <Text style={styles.stepText}>
                      {i < stepIndex ? '✓' : i + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      i <= stepIndex && { color: Colors.white },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
                {i < stepLabels.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      i < stepIndex && { backgroundColor: Colors.secondary },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Step 1: Models */}
          {step === 'model' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select a Model</Text>
              {AI_MODELS.map(model => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.card,
                    selectedModel === model.id && styles.cardSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedModel(model.id)}
                >
                  <Text style={styles.cardIcon}>🤖</Text>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{model.name}</Text>
                    <Text style={styles.cardSubtitle}>{model.provider}</Text>
                    <Text style={styles.cardDesc}>{model.description}</Text>
                  </View>
                  {selectedModel === model.id && (
                    <View style={styles.checkmark}>
                      <Text style={{ color: Colors.white, fontSize: 12 }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.nextButton, !selectedModel && styles.buttonDisabled]}
                disabled={!selectedModel}
                onPress={() => setStep('channel')}
              >
                <Text style={styles.nextButtonText}>Next: Channel →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Channels */}
          {step === 'channel' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select a Channel</Text>
              {CHANNELS.map(ch => (
                <TouchableOpacity
                  key={ch.id}
                  style={[
                    styles.card,
                    selectedChannel === ch.id && styles.cardSelected,
                    !ch.available && styles.cardDisabled,
                  ]}
                  activeOpacity={ch.available ? 0.7 : 1}
                  onPress={() => ch.available && setSelectedChannel(ch.id)}
                >
                  <Text style={styles.cardIcon}>💬</Text>
                  <View style={styles.cardContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.cardTitle}>{ch.name}</Text>
                      {!ch.available && (
                        <View style={styles.comingSoon}>
                          <Text style={styles.comingSoonText}>Soon</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardDesc}>{ch.description}</Text>
                  </View>
                  {selectedChannel === ch.id && (
                    <View style={styles.checkmark}>
                      <Text style={{ color: Colors.white, fontSize: 12 }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep('model')}>
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextButton, !selectedChannel && styles.buttonDisabled, { flex: 1 }]}
                  disabled={!selectedChannel}
                  onPress={() => setStep('review')}
                >
                  <Text style={styles.nextButtonText}>Next: Review →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Review & Deploy</Text>

              {/* Service Name */}
              <Text style={styles.fieldLabel}>Service Name</Text>
              <TouchableOpacity
                style={styles.nameInput}
                onPress={() => {
                  Alert.prompt(
                    'Service Name',
                    'Enter a name for your agent (e.g. my-agent-01)',
                    (name) => {
                      if (name?.trim()) setServiceName(name.trim());
                    },
                    'plain-text',
                    serviceName || 'my-agent'
                  );
                }}
              >
                <Text style={[styles.nameInputText, !serviceName && { color: Colors.dark500 }]}>
                  {serviceName || 'Tap to set service name'}
                </Text>
              </TouchableOpacity>

              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Model</Text>
                  <Text style={styles.reviewValue}>{selectedModelData?.name ?? '—'}</Text>
                </View>
                <View style={[styles.reviewRow, { borderTopWidth: 1, borderTopColor: Colors.dark700 }]}>
                  <Text style={styles.reviewLabel}>Channel</Text>
                  <Text style={styles.reviewValue}>{selectedChannelData?.name ?? '—'}</Text>
                </View>
                <View style={[styles.reviewRow, { borderTopWidth: 1, borderTopColor: Colors.dark700 }]}>
                  <Text style={styles.reviewLabel}>Plan</Text>
                  <Text style={styles.reviewValue}>Free</Text>
                </View>
                <View style={[styles.reviewRow, { borderTopWidth: 1, borderTopColor: Colors.dark700 }]}>
                  <Text style={styles.reviewLabel}>Region</Text>
                  <Text style={styles.reviewValue}>US Central</Text>
                </View>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep('channel')}>
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deployButton,
                    { flex: 1 },
                    createDeployment.isPending && styles.buttonDisabled,
                  ]}
                  disabled={createDeployment.isPending || !serviceName}
                  onPress={handleDeploy}
                >
                  {createDeployment.isPending ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.deployButtonText}>🚀 Deploy Agent</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark950 },
  safeArea: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: Spacing.four },
  title: { fontSize: 28, fontWeight: '700', color: Colors.white, marginTop: Spacing.three },
  subtitle: { fontSize: 14, color: Colors.dark400, marginTop: 4, marginBottom: Spacing.four },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  stepContainer: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: Colors.secondary },
  stepActive: { backgroundColor: Colors.primary },
  stepPending: { backgroundColor: Colors.dark700, borderWidth: 1, borderColor: Colors.dark600 },
  stepText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  stepLabel: { fontSize: 11, color: Colors.dark400 },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.dark700, marginHorizontal: 4, marginBottom: 18 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.white, marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.dark400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  nameInput: {
    backgroundColor: Colors.dark800,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.dark700,
    marginBottom: 12,
  },
  nameInputText: { fontSize: 16, color: Colors.white },
  card: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  cardSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(99,102,241,0.08)' },
  cardDisabled: { opacity: 0.5 },
  cardIcon: { fontSize: 28 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.white },
  cardSubtitle: { fontSize: 12, color: Colors.dark400, marginTop: 2 },
  cardDesc: { fontSize: 13, color: Colors.dark400, marginTop: 4 },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoon: {
    backgroundColor: Colors.dark700,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: { fontSize: 10, color: Colors.dark400 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.dark800,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  backButtonText: { color: Colors.dark300, fontWeight: '600', fontSize: 15 },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonText: { color: Colors.white, fontWeight: '600', fontSize: 15 },
  buttonDisabled: { opacity: 0.4 },
  deployButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  deployButtonText: { color: Colors.white, fontWeight: '600', fontSize: 16 },
  reviewCard: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark700,
    overflow: 'hidden',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  reviewLabel: { fontSize: 14, color: Colors.dark400 },
  reviewValue: { fontSize: 14, fontWeight: '600', color: Colors.white },
});
