'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface ProvStep {
  key: string;
  label: string;
  icon: string;
}

const provSteps: ProvStep[] = [
  { key: 'auth', label: 'Authentication verified', icon: '🔐' },
  { key: 'container', label: 'Container created', icon: '📦' },
  { key: 'swarmclaw', label: 'SwarmClaw initialized', icon: '🤖' },
  { key: 'models', label: 'AI models connected', icon: '🧠' },
  { key: 'healthcheck', label: 'Health check passed', icon: '✅' },
];

export default function ProvisioningPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{ time: string; message: string }[]>([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const stepDuration = 1200;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= provSteps.length) {
          clearInterval(interval);
          return prev;
        }
        const newStep = prev + 1;
        setProgress((newStep / provSteps.length) * 100);

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        if (newStep <= provSteps.length) {
          setLogs((prevLogs) => [
            ...prevLogs,
            { time: timeStr, message: `${provSteps[newStep - 1].label}` },
          ]);
        }

        if (newStep === provSteps.length) {
          setTimeout(() => setComplete(true), 500);
        }

        return newStep;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          {complete ? '🎉 Agent Deployed!' : '⚡ Deploying Your Agent'}
        </h1>
        <p className="text-dark-400">
          {complete
            ? 'Your AI agent is ready to go'
            : 'Setting up your container and connecting services...'}
        </p>
      </div>

      {/* Progress */}
      <ProgressBar
        progress={progress}
        color={complete ? 'secondary' : 'primary'}
        size="lg"
      />

      {/* Steps */}
      <Card>
        <div className="space-y-4">
          {provSteps.map((s, i) => {
            const isDone = i < currentStep;
            const isCurrent = i === currentStep && !complete;
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
              <span className="text-secondary-400">{log.message}</span>
            </div>
          ))}
          {!complete && currentStep < provSteps.length && (
            <div className="flex gap-2">
              <span className="text-dark-500 animate-pulse">▌</span>
            </div>
          )}
        </div>
      </Card>

      {/* Estimated time */}
      {!complete && (
        <p className="text-center text-sm text-dark-400">
          ⏱️ Estimated: {Math.max(0, (provSteps.length - currentStep) * 1.2).toFixed(0)}s remaining
        </p>
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
    </div>
  );
}
