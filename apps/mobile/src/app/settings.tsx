import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing, BottomTabInset } from '@/constants/theme';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState({
    deployComplete: true,
    chatResponse: true,
    costAlerts: true,
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.title}>Settings</Text>

          {/* Profile */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>D</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Dan</Text>
              <Text style={styles.profileEmail}>dan@danglasses.ai</Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Pro</Text>
            </View>
          </View>

          {/* Account */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.section}>
            {[
              { icon: '👤', label: 'Edit Profile' },
              { icon: '💳', label: 'Billing & Plans' },
              { icon: '🔑', label: 'API Keys' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.row, i > 0 && styles.rowBorder]}
                activeOpacity={0.7}
              >
                <Text style={styles.rowIcon}>{item.icon}</Text>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Config */}
          <Text style={styles.sectionTitle}>AI Configuration</Text>
          <View style={styles.section}>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={styles.rowIcon}>🤖</Text>
              <Text style={styles.rowLabel}>Default Model</Text>
              <Text style={styles.rowValue}>Claude 3.5</Text>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.row, styles.rowBorder]} activeOpacity={0.7}>
              <Text style={styles.rowIcon}>🌡️</Text>
              <Text style={styles.rowLabel}>Temperature</Text>
              <Text style={styles.rowValue}>0.7</Text>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.row, styles.rowBorder]} activeOpacity={0.7}>
              <Text style={styles.rowIcon}>📊</Text>
              <Text style={styles.rowLabel}>Max Tokens</Text>
              <Text style={styles.rowValue}>4096</Text>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.section}>
            {[
              { key: 'deployComplete', label: 'Deploy complete', icon: '🚀' },
              { key: 'chatResponse', label: 'Chat response', icon: '💬' },
              { key: 'costAlerts', label: 'Cost alerts', icon: '💰' },
            ].map((item, i) => (
              <View key={item.key} style={[styles.row, i > 0 && styles.rowBorder]}>
                <Text style={styles.rowIcon}>{item.icon}</Text>
                <Text style={[styles.rowLabel, { flex: 1 }]}>{item.label}</Text>
                <Switch
                  value={notifications[item.key as keyof typeof notifications]}
                  onValueChange={(val) =>
                    setNotifications(prev => ({ ...prev, [item.key]: val }))
                  }
                  trackColor={{ false: Colors.dark700, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            ))}
          </View>

          {/* Support */}
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.section}>
            {[
              { icon: '📖', label: 'Help Center' },
              { icon: '🐛', label: 'Report Bug' },
              { icon: '📄', label: 'Terms of Service' },
              { icon: '🔒', label: 'Privacy Policy' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.row, i > 0 && styles.rowBorder]}
                activeOpacity={0.7}
              >
                <Text style={styles.rowIcon}>{item.icon}</Text>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            style={styles.signOutButton}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive' },
            ])}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>DanClaw v1.0.0 · Expo SDK 55</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark950 },
  safeArea: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: Spacing.four },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  profileCard: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark700,
    marginBottom: Spacing.four,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '600', color: Colors.white },
  profileEmail: { fontSize: 13, color: Colors.dark400, marginTop: 2 },
  planBadge: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  planBadgeText: { color: Colors.primaryLight, fontSize: 12, fontWeight: '600' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: Spacing.three,
  },
  section: {
    backgroundColor: Colors.dark800,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark700,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.dark700 },
  rowIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  rowLabel: { fontSize: 15, color: Colors.white },
  rowValue: { fontSize: 14, color: Colors.dark400, marginLeft: 'auto' },
  rowChevron: { fontSize: 20, color: Colors.dark500, marginLeft: 'auto' },
  signOutButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  signOutText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.dark500,
    marginTop: Spacing.three,
  },
});
