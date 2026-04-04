/**
 * @danclaw/shared — Utility Functions
 *
 * Pure, platform-agnostic utilities used by both web and mobile apps.
 * No React, no RN, no DOM — just plain TypeScript.
 */

import type { DeploymentStatus } from '../types';

/**
 * Converts uptime in seconds to a human-readable string.
 * @example formatUptime(234832) → "2d 17h"
 * @example formatUptime(3600)   → "1h 0m"
 * @example formatUptime(45)     → "0m 45s"
 */
export function formatUptime(seconds: number): string {
  if (seconds <= 0) return '0m';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
}

/**
 * Formats a number as USD currency.
 * @example formatCurrency(12.5)  → "$12.50"
 * @example formatCurrency(0)     → "$0.00"
 * @example formatCurrency(1234)  → "$1,234.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const STATUS_COLORS: Record<DeploymentStatus, string> = {
  provisioning: '#FFB020',
  starting: '#3B82F6',
  running: '#22C55E',
  stopping: '#F97316',
  stopped: '#6B7280',
  restarting: '#3B82F6',
  destroying: '#EF4444',
  error: '#EF4444',
};

const STATUS_LABELS: Record<DeploymentStatus, string> = {
  provisioning: 'Provisioning',
  starting: 'Starting',
  running: 'Running',
  stopping: 'Stopping',
  stopped: 'Stopped',
  restarting: 'Restarting',
  destroying: 'Destroying',
  error: 'Error',
};

/**
 * Returns the hex color for a deployment status.
 * @example getStatusColor('running') → "#22c55e"
 */
export function getStatusColor(status: DeploymentStatus): string {
  return STATUS_COLORS[status] ?? '#6b7280';
}

/**
 * Returns the human-readable label for a deployment status.
 * @example getStatusLabel('provisioning') → "Provisioning"
 */
export function getStatusLabel(status: DeploymentStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Formats an ISO timestamp as a relative time string.
 * @example formatRelativeTime('2026-03-27T10:00:00Z') → "5 min ago"
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(isoTimestamp).toLocaleDateString();
}

/**
 * Formats an ISO timestamp to a localized time string (HH:MM AM/PM).
 * @example formatTime('2026-03-27T10:30:00Z') → "10:30 AM"
 */
export function formatTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncates a string to a maximum length, appending "..." if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
