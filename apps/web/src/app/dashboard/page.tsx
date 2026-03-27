import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatsCard from '@/components/ui/StatsCard';
import { mockDeployments, mockActivity } from '@/lib/mockData';

export default function DashboardPage() {
  const runningCount = mockDeployments.filter((d) => d.status === 'running').length;
  const stoppedCount = mockDeployments.filter((d) => d.status === 'stopped').length;
  const totalCost = mockDeployments.reduce((acc, d) => acc + (d.cost_this_month || 0), 0);

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
        <StatsCard icon="📨" label="Requests Today" value="2,079" trend="+15%" trendUp />
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
        <div className="space-y-3">
          {mockDeployments.map((deployment) => (
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
                      {deployment.model} · {deployment.channel} ·{' '}
                      {deployment.region}
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
                        <p className="text-xs text-dark-400">Memory</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{deployment.requests_today?.toLocaleString()}</p>
                        <p className="text-xs text-dark-400">Requests</p>
                      </div>
                    </>
                  )}
                  <Link href="/dashboard/chat">
                    <Button variant="ghost" size="sm">
                      Open →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {mockActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-dark-300">{activity.action}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{activity.timestamp}</p>
                </div>
              </div>
            ))}
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
