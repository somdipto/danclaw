import type { DeploymentStatus } from '@/types';

interface BadgeProps {
  status: DeploymentStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<DeploymentStatus, { label: string; color: string; dot: string }> = {
  running: {
    label: 'Running',
    color: 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20',
    dot: 'bg-secondary-500 animate-pulse-slow',
  },
  provisioning: {
    label: 'Provisioning',
    color: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    dot: 'bg-primary-500 animate-pulse',
  },
  starting: {
    label: 'Starting',
    color: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    dot: 'bg-primary-500 animate-pulse',
  },
  stopping: {
    label: 'Stopping',
    color: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
    dot: 'bg-accent-500 animate-pulse',
  },
  stopped: {
    label: 'Stopped',
    color: 'bg-dark-700/50 text-dark-400 border-dark-600/50',
    dot: 'bg-dark-500',
  },
  restarting: {
    label: 'Restarting',
    color: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    dot: 'bg-primary-500 animate-pulse',
  },
  destroying: {
    label: 'Destroying',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-500 animate-pulse',
  },
  error: {
    label: 'Error',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-500 animate-pulse',
  },
};

export default function Badge({ status, size = 'md' }: BadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${config.color}
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
