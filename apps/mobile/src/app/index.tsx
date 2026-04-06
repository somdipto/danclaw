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

import { Colors, Spacing, BottomTabInset } from '@/constants/theme';
import { useDeployments, useUserProfile } from '@danclaw/api';
import { formatUptime } from '@danclaw/shared';

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'running' ? Colors.secondary :
    status === 'stopped' ? Colors.dark500 :
    status === 'error' ? Colors.error : Colors.primary;
  return <View style={[styles.statusDot, { backgroundColor: color }]} />;
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
  const { data: deploymentsData, isLoading, isError } = useDeployments();

  const deployments = deploymentsData?.data?.deployments ?? [];
  const user = profileData?.data?.user;
  const running = deployments.filter(d => d.status === 'running').length;
  const totalCost = deployments.reduce((a, d) => a + (d.cost_this_month ?? 0), 0);
  const totalRequests = deployments.reduce((a, d) => a + (d.requests_today ?? 0), 0);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: 160, height: 28, marginTop: 4 }]} />
              </View>
              <View style={styles.skeletonAvatar} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
              {[1,2,3,4].map(i => <View key={i} style={styles.statsCard}><View style={styles.skeletonLine} /><View style={[styles.skeletonLine, { height: 24, marginTop: 8 }]} /><View style={[styles.skeletonLine, { width: 60, height: 12, marginTop: 4 }]} /></View>)}
            </ScrollView>
            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
              <View style={[styles.skeletonLine, { width: 100, height: 18 }]} />
            </View>
            {[1,2,3].map(i => <View key={i} style={styles.deploymentCard}><View style={styles.deployRow}><View style={styles.deployIconWrap} /><View style={styles.deployInfo}><View style={[styles.skeletonLine, { width: 120, height: 16 }]} /><View style={[styles.skeletonLine, { width: 180, height: 12, marginTop: 6 }]} /></View></View></View>)}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
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
              onPress={() => router.push('/settings')}
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
            <TouchableOpacity onPress={() => router.push('/deploy')}>
              <Text style={styles.seeAll}>+ Deploy</Text>
            </TouchableOpacity>
          </View>
          {deployments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No agents yet</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/deploy')}
              >
                <Text style={styles.emptyButtonText}>Deploy your first agent</Text>
              </TouchableOpacity>
            </View>
          ) : (
            deployments.map(dep => (
              <TouchableOpacity
                key={dep.id}
                style={styles.deploymentCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/chat/${dep.id}`)}
              >
                <View style={styles.deployRow}>
                  <View style={styles.deployIconWrap}>
                    <Text style={styles.deployIcon}>
                      {dep.channel === 'telegram' ? '✈️' :
                       dep.channel === 'discord' ? '🎮' :
                       dep.channel === 'whatsapp' ? '💬' :
                       dep.channel === 'slack' ? '💼' : '🌐'}
                    </Text>
                  </View>
                  <View style={styles.deployInfo}>
                    <View style={styles.deployTitleRow}>
                      <Text style={styles.deployName}>{dep.service_name}</Text>
                      <StatusDot status={dep.status} />
                    </View>
                    <Text style={styles.deployMeta}>
                      {dep.model} · {dep.channel} · {dep.region}
                    </Text>
                  </View>
                </View>
                {dep.status === 'running' && (
                  <View style={styles.deployStats}>
                    <View style={styles.deployStatItem}>
                      <Text style={styles.deployStatValue}>
                        {(dep.requests_today ?? 0).toLocaleString()}
                      </Text>
                      <Text style={styles.deployStatLabel}>Requests</Text>
                    </View>
                    <View style={styles.deployStatItem}>
                      <Text style={styles.deployStatValue}>{dep.memory_usage ?? 0}GB</Text>
                      <Text style={styles.deployStatLabel}>Memory</Text>
                    </View>
                    <View style={styles.deployStatItem}>
                      <Text style={styles.deployStatValue}>{formatUptime(dep.uptime ?? 0)}</Text>
                      <Text style={styles.deployStatLabel}>Uptime</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
    paddingHorizontal: Spacing.four,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: Colors.dark800,
    borderRadius: 14,
    padding: 16,
    width: '47%' as any,
    borderWidth: 1,
    borderColor: Colors.dark700,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.four,
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
  errorText: {
    fontSize: 16,
    color: Colors.dark300,
    marginBottom: 16,
  },
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
