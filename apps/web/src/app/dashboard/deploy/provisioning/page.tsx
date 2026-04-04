'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { useDeployment } from '@danclaw/api';
import type { Deployment, DeploymentStatus } from '@danclaw/shared';

interface ProvStep {
  key: string;
  label: string;
  icon: string;
  deployStatus: DeploymentStatus[];
}

const PROV_STEPS: ProvStep[] = [
  { key: 'auth', label: 'Authentication verified', icon: '🔐', deployStatus: ['provisioning'] },
  { key: 'container', label: 'Container created', icon: '📦', deployStatus: ['provisioning'] },
  { key: 'swarmclaw', label: 'SwarmClaw initialized', icon: '🤖', deployStatus: ['provisioning', 'starting'] },
  { key: 'models', label: 'AI models connected', icon: '🧠', deployStatus: ['starting', 'running'] },
  { key: 'healthcheck', label: 'Health check passed', icon: '✅', deployStatus: ['running'] },
];

export default function ProvisioningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deploymentId = searchParams.get('id');

  const { data, isLoading, error } = useDeployment(deploymentId || '', {
    refetchInterval: (query) => {
      const dep = query.state.data?.data;
      if (!dep) return 5000;
      if (dep.status === 'running' || dep.status === 'stopped' || dep.status === 'error') return false;
      return 3000;
    },
  });

  const deployment = data?.data;
  const status = deployment?.status;

  // Auto-navigate to chat when deployment is running
  useEffect(() => {
    if (status === 'running') {
      router.push('/dashboard/chat');
    }
  }, [status, router]);

  const { currentStepIndex, progress, complete, failed } = useMemo(() => {
    if (!status) return { currentStepIndex: 0, progress: 0, complete: false, failed: false };

    if (status === 'error') return { currentStepIndex: PROV_STEPS.length, progress: 100, complete: false, failed: true };

    if (status === 'running') {
      return { currentStepIndex: PROV_STEPS.length, progress: 100, complete: true, failed: false };
    }

    if (status === 'provisioning' || status === 'starting') {
      const idx = status === 'starting' ? 3 : Math.min(2, PROV_STEPS.length - 1);
      return {
        currentStepIndex: idx,
        progress: Math.round(((idx + 1) / PROV_STEPS.length) * 100),
        complete: false,
        failed: false,
      };
    }

    return { currentStepIndex: 0, progress: 0, complete: false, failed: false };
  }, [status]);

  const logs = useMemo(() => {
    if (!status) return [];
    const entries: { time: string; message: string; level: 'info' | 'success' }[] = [];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    if (status === 'provisioning') {
      entries.push(
        { time: timeStr, message: 'Starting deployment provisioning...', level: 'info' },
        { time: timeStr, message: 'Authentication verified', level: 'info' },
        { time: timeStr, message: 'Container created', level: 'info' },
        { time: timeStr, message: 'SwarmClaw service initializing...', level: 'info' },
      );
    } else if (status === 'starting') {
      entries.push(
        { time: timeStr, message: 'Authentication verified ✓', level: 'success' },
        { time: timeStr, message: 'Container created ✓', level: 'success' },
        { time: timeStr, message: 'SwarmClaw initialized ✓', level: 'success' },
        { time: timeStr, message: 'Connecting AI models...', level: 'info' },
      );
    } else if (status === 'running') {
      entries.push(
        { time: timeStr, message: 'Authentication verified ✓', level: 'success' },
        { time: timeStr, message: 'Container created ✓', level: 'success' },
        { time: timeStr, message: 'SwarmClaw initialized ✓', level: 'success' },
        { time: timeStr, message: 'AI models connected ✓', level: 'success' },
        { time: timeStr, message: 'Health check passed ✓', level: 'success' },
      );
    } else if (status === 'error') {
      entries.push({ time: timeStr, message: 'Deployment failed. Check logs.', level: 'info' });
    }

    return entries;
  }, [status]);

  if (!deploymentId) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center py-20">
        <p className="text-dark-400">No deployment ID provided.</p>
        <button onClick={() => router.push('/dashboard/deploy')} className="text-primary-400 hover:underline">
          ← Go to Deploy
        </button>
      </div>
    );
  }

  if (isLoading && !deployment) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">⚡ Deploying Your Agent</h1>
          <p className="text-dark-400">Loading deployment status...</p>
        </div>
        <div className="h-2 bg-dark-800 rounded-full animate-pulse" />
      </div>
    );
  }

  if (error || (!isLoading && !deployment)) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center py-20">
        <p className="text-red-400">Failed to load deployment status.</p>
        <button onClick={() => router.push('/dashboard/deploy')} className="text-primary-400 hover:underline">
          ← Go to Deploy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          {complete ? '🎉 Agent Deployed!' : failed ? '❌ Deployment Failed' : '⚡ Deploying Your Agent'}
        </h1>
        <p className="text-dark-400">
          {complete
            ? 'Your AI agent is ready to go'
            : failed
              ? 'Something went wrong. Please try again.'
              : 'Setting up your container and connecting services...'}
        </p>
      </div>

      {/* Progress */}
      <ProgressBar
        progress={progress}
        color={complete ? 'secondary' : failed ? 'accent' : 'primary'}
        size="lg"
      />

      {/* Steps */}
      <Card>
        <div className="space-y-4">
          {PROV_STEPS.map((s, i) => {
            const isDone = i < currentStepIndex;
            const isCurrent = i === currentStepIndex && !complete && !failed;
            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isDone ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0
                  ${isDone
                    ? 'bg-secondary-500/20 text-secondary-400'
                    : isCurrent
                      ? 'bg-primary-500/20 text-primary-400 animate-pulse'
                      : failed
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-dark-700/50 text-dark-500'
                  }
                `}>
                  {isDone ? '✓' : isCurrent ? '◌' : '○'}
                </div>
                <span className={`text-sm ${isDone ? 'text-dark-300' : isCurrent ? 'text-white font-medium' : 'text-dark-500'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Logs */}
      <Card>
        <h3 className="text-sm font-medium text-dark-400 mb-3">Logs</h3>
        <div className="font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-dark-500">[{log.time}]</span>
              <span className={log.level === 'success' ? 'text-secondary-400' : 'text-dark-300'}>
                {log.message}
              </span>
            </div>
          ))}
          {!complete && !failed && (
            <div className="flex gap-2">
              <span className="text-dark-500 animate-pulse">▌</span>
            </div>
          )}
        </div>
      </Card>

      {/* Deployment info */}
      {deployment && (
        <div className="text-center text-sm text-dark-500">
          {deployment.service_name} · {deployment.model} · {deployment.region}
        </div>
      )}

      {/* Complete actions */}
      {complete && (
        <div className="flex gap-3 justify-center animate-scale-in">
          <button
            onClick={() => router.push('/dashboard/chat')}
            className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all glow-primary"
          >
            💬 Start Chatting
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-medium border border-dark-700 transition-all"
          >
            View Dashboard
          </button>
        </div>
      )}

      {failed && (
        <div className="flex gap-3 justify-center animate-scale-in">
          <button
            onClick={() => router.push('/dashboard/deploy')}
            className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-medium border border-dark-700 transition-all"
          >
            View Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
