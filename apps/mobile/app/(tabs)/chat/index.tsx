/**
 * (tabs)/chat/index.tsx — Chat List Screen
 * 
 * Shows all user deployments as a list to select from.
 * Uses useDeployments from @danclaw/api.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useDeployments } from '@danclaw/api';
import type { Deployment } from '@danclaw/shared';

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'running' ? Colors.secondary :
    status === 'stopped' ? Colors.dark500 :
    status === 'error' ? Colors.error : Colors.primary;
  return <View style={[styles.statusDot, { backgroundColor: color }]} />;
}

export default function ChatListScreen() {
  const router = useRouter();
  const { data, isLoading } = useDeployments();

  const deployments = data?.data?.deployments ?? [];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat</Text>
        </View>
        {deployments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No agents yet</Text>
            <Text style={styles.emptySubtitle}>
              Deploy an agent to start chatting
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/deploy')}
            >
              <Text style={styles.emptyButtonText}>Deploy Agent</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={deployments}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chatCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
              >
                <View style={styles.chatIconWrap}>
                  <Text style={styles.chatIcon}>
                    {item.channel === 'telegram' ? '✈️' :
                     item.channel === 'discord' ? '🎮' :
                     item.channel === 'whatsapp' ? '💬' :
                     item.channel === 'slack' ? '💼' : '🌐'}
                  </Text>
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatTitleRow}>
                    <Text style={styles.chatName}>{item.service_name}</Text>
                    <StatusDot status={item.status} />
                  </View>
                  <Text style={styles.chatMeta}>
                    {item.model} · {item.channel}
                  </Text>
                </View>
                <Text style={styles.chatChevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark950 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two },
  title: { fontSize: 28, fontWeight: '700', color: Colors.white },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Spacing.four, paddingBottom: 100 },
  chatCard: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  chatIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.dark700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatIcon: { fontSize: 24 },
  chatInfo: { flex: 1 },
  chatTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatName: { fontSize: 16, fontWeight: '600', color: Colors.white },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  chatMeta: { fontSize: 12, color: Colors.dark400, marginTop: 4 },
  chatChevron: { fontSize: 22, color: Colors.dark500 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.dark400, marginBottom: 24, textAlign: 'center' },
  emptyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
