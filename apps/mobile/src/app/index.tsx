import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing, BottomTabInset } from '@/constants/theme';
import { mockDeployments, formatUptime } from '@/constants/mockData';

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

export default function DashboardScreen() {
  const running = mockDeployments.filter(d => d.status === 'running').length;
  const totalCost = mockDeployments.reduce((a, d) => a + d.cost_this_month, 0);

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
              <Text style={styles.greeting}>Good evening 👋</Text>
              <Text style={styles.title}>Dashboard</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>D</Text>
            </View>
          </View>

          {/* Stats Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <StatsCard icon="🟢" value={String(running)} label="Running" />
            <StatsCard icon="📨" value="2,079" label="Requests" />
            <StatsCard icon="💰" value={`$${totalCost.toFixed(0)}`} label="Cost" />
            <StatsCard icon="⏱️" value="99.9%" label="Uptime" />
          </ScrollView>

          {/* Your Agents */}
          <Text style={styles.sectionTitle}>Your Agents</Text>
          {mockDeployments.map(dep => (
            <TouchableOpacity key={dep.id} style={styles.deploymentCard} activeOpacity={0.7}>
              <View style={styles.deployRow}>
                <View style={styles.deployIconWrap}>
                  <Text style={styles.deployIcon}>
                    {dep.channel === 'Telegram' ? '✈️' : dep.channel === 'Discord' ? '🎮' : '🌐'}
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
                    <Text style={styles.deployStatValue}>{dep.requests_today.toLocaleString()}</Text>
                    <Text style={styles.deployStatLabel}>Requests</Text>
                  </View>
                  <View style={styles.deployStatItem}>
                    <Text style={styles.deployStatValue}>{dep.memory_usage}GB</Text>
                    <Text style={styles.deployStatLabel}>Memory</Text>
                  </View>
                  <View style={styles.deployStatItem}>
                    <Text style={styles.deployStatValue}>{formatUptime(dep.uptime ?? 0)}</Text>
                    <Text style={styles.deployStatLabel}>Uptime</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {[
              { icon: '📧', label: 'Triage Email' },
              { icon: '📅', label: 'Schedule' },
              { icon: '🔍', label: 'Research' },
              { icon: '📝', label: 'Write' },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={styles.quickAction} activeOpacity={0.7}>
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
});
