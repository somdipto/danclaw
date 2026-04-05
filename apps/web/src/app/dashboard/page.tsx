'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeployments, useUserProfile, useUsage } from '@danclaw/api';
import type { DeploymentStatus } from '@danclaw/shared';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const statusMeta: Record<DeploymentStatus, { label: string; color: string; dot: string }> = {
  provisioning: { label: 'Provisioning', color: 'bg-blue-500/15 text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  starting: { label: 'Starting', color: 'bg-blue-500/15 text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  running: { label: 'Running', color: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
  stopping: { label: 'Stopping', color: 'bg-amber-500/15 text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  stopped: { label: 'Stopped', color: 'text-zinc-500', dot: 'bg-zinc-600' },
  restarting: { label: 'Restarting', color: 'bg-blue-500/15 text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  destroying: { label: 'Destroying', color: 'bg-red-500/15 text-red-400', dot: 'bg-red-400 animate-pulse' },
  error: { label: 'Error', color: 'bg-red-500/15 text-red-400', dot: 'bg-red-500' },
};

function StatusBadge({ status, size = 'md' }: { status: DeploymentStatus; size?: 'sm' | 'md' }) {
  const config = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${config.color} ${
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
    } border-zinc-800/50`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function StatsCard({ icon, label, value, trend, trendUp }: {
  icon: string; label: string; value: string | number; trend?: string; trendUp?: boolean;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all hover:bg-zinc-900/60 hover:border-zinc-700/50"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <span className="text-2xl">{icon}</span>
          {trend && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trendUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight text-white mb-1">{value}</p>
        <p className="text-sm text-zinc-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: deploymentsData, isLoading: loadingDeployments } = useDeployments();
  const { data: profileData, isLoading: loadingProfile } = useUserProfile();
  const { data: usageData } = useUsage();

  const deployments = deploymentsData?.data?.deployments || [];
  const user = profileData?.data?.user;
  const totalCost = deployments.reduce((acc, d) => acc + (d.cost_this_month || 0), 0);
  const runningCount = deployments.filter((d) => d.status === 'running').length;
  const stoppedCount = deployments.filter((d) => d.status === 'stopped').length;

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {user ? `Welcome back, ${user.name}` : 'Monitor your AI agents at a glance'}
          </p>
        </div>
        <Link href="/dashboard/deploy">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-medium transition-all hover:bg-zinc-100 active:bg-zinc-200"
          >
            <span>🚀</span>
            Deploy New Agent
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon="🟢" label="Running Agents" value={runningCount} trend="+1 this week" trendUp />
        <StatsCard icon="⏸️" label="Stopped" value={stoppedCount} />
        <StatsCard icon="📨" label="Requests Today" value={
          deployments.reduce((a, d) => a + (d.requests_today || 0), 0).toLocaleString()
        } trend="+15%" trendUp />
        <StatsCard icon="💰" label="Monthly Cost" value={`$${totalCost.toFixed(2)}`} trend="-8%" trendUp />
      </motion.div>

      {/* Deployments */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Your Agents</h2>
          <Link href="/dashboard/deploy" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
            View all →
          </Link>
        </div>

        <motion.div className="space-y-3">
          <AnimatePresence>
            {loadingDeployments ? (
              Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-16 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 animate-shimmer"
                />
              ))
            ) : deployments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20"
              >
                <span className="text-4xl mb-3">🤖</span>
                <p className="text-zinc-500 text-sm">No agents deployed yet</p>
                <Link href="/dashboard/deploy">
                  <span className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer">
                    Deploy your first agent →
                  </span>
                </Link>
              </motion.div>
            ) : (
              deployments.slice(0, 5).map((deployment) => (
                <motion.div
                  key={deployment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  whileHover={{ y: -1 }}
                  className="group rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl transition-all hover:bg-zinc-900/60 hover:border-zinc-700/50"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                        {deployment.channel === 'telegram' ? '✈️' : deployment.channel === 'discord' ? '🎮' : '💬'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{deployment.service_name}</p>
                          <StatusBadge status={deployment.status as DeploymentStatus} size="sm" />
                        </div>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          {deployment.model} · {deployment.channel} · {deployment.region}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-6">
                      {deployment.status === 'running' && (
                        <>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">
                              {deployment.memory_usage}GB / {deployment.memory_limit}GB
                            </p>
                            <p className="text-xs text-zinc-500">Memory</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{deployment.requests_today?.toLocaleString()}</p>
                            <p className="text-xs text-zinc-500">Requests</p>
                          </div>
                        </>
                      )}
                      <Link href="/dashboard/chat">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                          Open →
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Activity + Quick Actions */}
      <motion.div variants={containerVariants} className="grid lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { icon: '🚀', action: 'Deployed agent on Telegram', time: '2 hours ago' },
              { icon: '⚡', action: 'Upgraded to Pro plan', time: '3 days ago' },
              { icon: '🔧', action: 'Changed model to Qwen 3.6 Plus', time: '5 days ago' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3"
              >
                <span className="text-lg mt-0.5">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-zinc-400">{item.action}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📧', label: 'Email', desc: 'Triage inbox' },
              { icon: '📅', label: 'Calendar', desc: 'Schedule meeting' },
              { icon: '🔍', label: 'Research', desc: 'Find information' },
              { icon: '📝', label: 'Write', desc: 'Draft content' },
              { icon: '🔀', label: 'Code Review', desc: 'Review PRs' },
              { icon: '📊', label: 'Analytics', desc: 'View reports' },
            ].map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -2, backgroundColor: 'rgba(39, 39, 42, 0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/40 text-left transition-all"
              >
                <span className="text-xl">{action.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{action.label}</p>
                  <p className="text-xs text-zinc-600">{action.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
