'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatsCard from '@/components/ui/StatsCard';
import { useDeployments } from '@danclaw/api';

export default function DashboardPage() {
  const { data: deploymentsData, isLoading, error } = useDeployments();

  const deployments = deploymentsData?.data?.deployments ?? [];
  const runningCount = deployments.filter((d) => d.status === 'running').length;
  const stoppedCount = deployments.filter((d) => d.status === 'stopped').length;
  const totalCost = deployments.reduce((acc, d) => acc + (d.cost_this_month ?? 0), 0);
  const totalRequests = deployments.reduce((acc, d) => acc + (d.requests_today ?? 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-8 w-48 bg-dark-800 rounded-xl animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-dark-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !deploymentsData?.data) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-400 mb-4">Failed to load dashboard</p>
        <p className="text-sm text-dark-600">Make sure you're signed in to see your agents</p>
        <Link href="/login" className="mt-4 inline-block">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Monitor your AI agents at a glance</p>
        </div>
        <Link href="/dashboard/deploy">
          <Button icon={<span>🚀</span>}>Deploy New Agent</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon="🟢" label="Running Agents" value={runningCount} trend="+1 this week" trendUp />
        <StatsCard icon="⏸️" label="Stopped" value={stoppedCount} />
        <StatsCard icon="📨" label="Requests Today" value={totalRequests.toLocaleString()} trend="+15%" trendUp />
        <StatsCard icon="💰" label="Monthly Cost" value={`$${totalCost.toFixed(2)}`} trend="-8%" trendUp />
      </div>

      {/* Deployments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Agents</h2>
          <Link href="/dashboard/deploy" className="text-sm text-primary-400 hover:text-primary-300">
            View all →
          </Link>
        </div>
        {deployments.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-4xl mb-4">🚀</p>
            <p className="text-white font-medium mb-2">No agents yet</p>
            <p className="text-dark-400 text-sm mb-6">Deploy your first AI agent in under 60 seconds</p>
            <Link href="/dashboard/deploy">
              <Button icon={<span>🚀</span>}>Deploy Your First Agent</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {deployments.map((deployment) => (
              <Card key={deployment.id} hover padding="none">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-dark-700/50 flex items-center justify-center text-lg">
                      {deployment.channel === 'telegram' ? '✈️' : deployment.channel === 'discord' ? '🎮' : '💬'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{deployment.service_name}</p>
                        <Badge status={deployment.status} size="sm" />
                      </div>
                      <p className="text-sm text-dark-400 mt-0.5">
                        {deployment.model} · {deployment.channel} · {deployment.region}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-6">
                    {deployment.status === 'running' && (
                      <>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">
                            {deployment.memory_usage ?? 0}GB / {deployment.memory_limit ?? 0}GB
                          </p>
                          <p className="text-xs text-dark-400">Memory</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">
                            {(deployment.requests_today ?? 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-dark-400">Requests</p>
                        </div>
                      </>
                    )}
                    <Link href="/dashboard/chat">
                      <Button variant="ghost" size="sm">Open →</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <p className="text-dark-500 text-sm">Activity feed coming soon</p>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📧', label: 'Email', desc: 'Triage inbox' },
              { icon: '📅', label: 'Calendar', desc: 'Schedule meeting' },
              { icon: '🔍', label: 'Research', desc: 'Find information' },
              { icon: '📝', label: 'Write', desc: 'Draft content' },
              { icon: '🔀', label: 'Code Review', desc: 'Review PRs' },
              { icon: '📊', label: 'Analytics', desc: 'View reports' },
            ].map((action, i) => (
              <button
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30 hover:bg-dark-800/60 border border-dark-700/30 hover:border-primary-500/20 transition-all text-left"
              >
                <span className="text-xl">{action.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{action.label}</p>
                  <p className="text-xs text-dark-500">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
