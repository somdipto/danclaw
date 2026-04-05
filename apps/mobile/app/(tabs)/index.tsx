/**
 * (tabs)/index.tsx — Home / Dashboard Screen
 * 
 * - Welcome header with user name
 * - Active deployments list
 * - Quick stats row
 * - Recent activity feed
 * - FAB for quick deploy
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useDeployments, useUserProfile } from '@danclaw/api';
import { formatUptime, formatCurrency } from '@danclaw/shared';
import type { Deployment, Activity } from '@danclaw/shared';

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'running' ? Colors.secondary :
    status === 'stopped' ? Colors.dark500 :
    status === 'error' ? Colors.error : Colors.primary;
  return <View style={[styles.statusDot, { backgroundColor: color }]} />;
}

function DeploymentCard({ deployment }: { deployment: Deployment }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.deploymentCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/(tabs)/chat/${deployment.id}`)}
    >
      <View style={styles.deployRow}>
        <View style={styles.deployIconWrap}>
          <Text style={styles.deployIcon}>
            {deployment.channel === 'telegram' ? '✈️' :
             deployment.channel === 'discord' ? '🎮' :
             deployment.channel === 'whatsapp' ? '💬' :
             deployment.channel === 'slack' ? '💼' : '🌐'}
          </Text>
        </View>
        <View style={styles.deployInfo}>
          <View style={styles.deployTitleRow}>
            <Text style={styles.deployName}>{deployment.service_name}</Text>
            <StatusDot status={deployment.status} />
          </View>
          <Text style={styles.deployMeta}>
            {deployment.model} · {deployment.channel} · {deployment.region}
          </Text>
        </View>
      </View>
      {deployment.status === 'running' && (
        <View style={styles.deployStats}>
          <View style={styles.deployStatItem}>
            <Text style={styles.deployStatValue}>
              {deployment.requests_today?.toLocaleString()}
            </Text>
            <Text style={styles.deployStatLabel}>Requests</Text>
          </View>
          <View style={styles.deployStatItem}>
            <Text style={styles.deployStatValue}>{deployment.memory_usage}GB</Text>
            <Text style={styles.deployStatLabel}>Memory</Text>
          </View>
          <View style={styles.deployStatItem}>
            <Text style={styles.deployStatValue}>{formatUptime(deployment.uptime ?? 0)}</Text>
            <Text style={styles.deployStatLabel}>Uptime</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

function ActivityItem({ item }: { item: Activity }) {
  return (
    <View style={styles.activityItem}>
      <Text style={styles.activityIcon}>{item.icon}</Text>
      <View style={styles.activityContent}>
        <Text style={styles.activityAction}>{item.action}</Text>
        <Text style={styles.activityTime}>{item.timestamp}</Text>
      </View>
    </View>
  );
}

function StatsCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsIcon}>{icon}</Text>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const router = useRouter();
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const { data: deploymentsData, isLoading, isError, error: deploymentsError } = useDeployments();

  const deployments = deploymentsData?.data?.deployments ?? [];
  const user = profileData?.data?.user;
  const running = deployments.filter(d => d.status === 'running').length;
  const totalCost = deployments.reduce((a, d) => a + (d.cost_this_month ?? 0), 0);
  const totalRequests = deployments.reduce((a, d) => a + (d.requests_today ?? 0), 0);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header skeleton */}
            <View style={styles.header}>
              <View>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: 160, height: 28, marginTop: 4 }]} />
              </View>
              <View style={styles.skeletonAvatar} />
            </View>
            {/* Stats skeleton */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
            >
              {[1,2,3,4].map(i => <View key={i} style={styles.statsCard}><View style={styles.skeletonLine} /><View style={[styles.skeletonLine, { height: 24, marginTop: 8 }]} /><View style={[styles.skeletonLine, { width: 60, height: 12, marginTop: 4 }]} /></View>)}
            </ScrollView>
            {/* Section header skeleton */}
            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
              <View style={[styles.skeletonLine, { width: 100, height: 18 }]} />
            </View>
            {/* Deployment card skeletons */}
            {[1,2,3].map(i => <View key={i} style={styles.deploymentCard}><View style={styles.deployRow}><View style={styles.deployIconWrap} /><View style={styles.deployInfo}><View style={[styles.skeletonLine, { width: 120, height: 16 }]} /><View style={[styles.skeletonLine, { width: 180, height: 12, marginTop: 6 }]} /></View></View></View>)}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Failed to load deployments</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.emptyButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.title}>
                {profileLoading ? '...' : user?.name ?? 'Dashboard'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() ?? 'D'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <StatsCard icon="🟢" value={String(running)} label="Running" />
            <StatsCard icon="📨" value={totalRequests.toLocaleString()} label="Requests" />
            <StatsCard icon="💰" value={`$${totalCost.toFixed(0)}`} label="Cost" />
            <StatsCard icon="⏱️" value="99.9%" label="Uptime" />
          </ScrollView>

          {/* Active Agents */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Agents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/deploy')}>
              <Text style={styles.seeAll}>+ Deploy</Text>
            </TouchableOpacity>
          </View>
          {deployments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No agents yet</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/deploy')}
              >
                <Text style={styles.emptyButtonText}>Deploy your first agent</Text>
              </TouchableOpacity>
            </View>
          ) : (
            deployments.map(dep => (
              <DeploymentCard key={dep.id} deployment={dep} />
            ))
          )}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/deploy')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark950,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.dark300,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  greeting: {
    fontSize: 14,
    color: Colors.dark400,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    gap: 12,
    paddingBottom: Spacing.three,
  },
  statsCard: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    padding: 16,
    width: 120,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  statsIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.dark400,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.three,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark400,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  deploymentCard: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  deployRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deployIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.dark700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deployIcon: {
    fontSize: 22,
  },
  deployInfo: {
    flex: 1,
  },
  deployTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deployName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deployMeta: {
    fontSize: 12,
    color: Colors.dark400,
    marginTop: 4,
  },
  deployStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark700,
  },
  deployStatItem: {
    alignItems: 'center',
  },
  deployStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  deployStatLabel: {
    fontSize: 11,
    color: Colors.dark400,
    marginTop: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark800,
  },
  activityIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: Colors.dark200,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.dark500,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 90 : 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
  // Skeleton / loading styles
  skeletonLine: {
    backgroundColor: Colors.dark700,
    borderRadius: 6,
    height: 14,
    width: 100,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark700,
  },
});
