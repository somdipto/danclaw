'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PRICING_TIERS } from '@danclaw/shared';
import { useUserProfile, useUsage } from '@danclaw/api';

export default function BillingPage() {
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const { data: usageData } = useUsage();

  const user = profileData?.data?.user;
  const usage = usageData?.data?.usage;
  const currentPlan = PRICING_TIERS.find((t) => t.tier === user?.tier) ?? PRICING_TIERS[0];

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="h-8 w-48 bg-dark-800 rounded-xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-dark-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-dark-400 text-sm mt-1">Manage your subscription and view usage</p>
      </div>

      {/* Current Plan */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium border border-primary-500/20">
                Current Plan
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white capitalize">{currentPlan.name}</h2>
            <p className="text-dark-400 mt-1">{currentPlan.priceLabel} · Next billing: April 27, 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Change Plan</Button>
            <Button variant="ghost" size="sm">Cancel</Button>
          </div>
        </div>
      </Card>

      {/* Usage Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-dark-400 mb-1">Active Agents</p>
          <p className="text-3xl font-bold text-white">
            {usage ? (usage.total_requests / 10).toFixed(0) : '—'}
          </p>
          <p className="text-xs text-dark-500 mt-1">of {currentPlan.limits.agents} included</p>
        </Card>
        <Card>
          <p className="text-sm text-dark-400 mb-1">Requests This Month</p>
          <p className="text-3xl font-bold text-white">
            {usage ? usage.total_requests.toLocaleString() : '—'}
          </p>
          <p className="text-xs text-dark-500 mt-1">across all agents</p>
        </Card>
        <Card>
          <p className="text-sm text-dark-400 mb-1">Total Cost</p>
          <p className="text-3xl font-bold text-white">
            {usage ? `$${usage.cost.toFixed(2)}` : '$0.00'}
          </p>
          <p className="text-xs text-dark-500 mt-1">this billing period</p>
        </Card>
      </div>

      {/* Usage breakdown */}
      {usage?.models && usage.models.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Models Used</h3>
          <div className="flex flex-wrap gap-2">
            {usage.models.map((model) => (
              <span key={model} className="px-3 py-1 rounded-full bg-dark-800 border border-dark-700 text-sm text-dark-300">
                {model}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Plans comparison */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {PRICING_TIERS.map((tier) => {
            const isCurrent = tier.tier === user?.tier;
            return (
              <Card
                key={tier.tier}
                className={`${isCurrent ? 'border-primary-500/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">{tier.name}</h4>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mb-4">{tier.priceLabel}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-dark-300">
                      <svg className="w-3.5 h-3.5 text-secondary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? 'ghost' : 'primary'}
                  fullWidth
                  size="sm"
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="text-left py-3 px-2 text-dark-400 font-medium">Date</th>
                <th className="text-left py-3 px-2 text-dark-400 font-medium">Description</th>
                <th className="text-right py-3 px-2 text-dark-400 font-medium">Amount</th>
                <th className="text-right py-3 px-2 text-dark-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark-700/20">
                <td className="py-3 px-2 text-dark-300">—</td>
                <td className="py-3 px-2 text-white">Billing integration coming soon</td>
                <td className="py-3 px-2 text-right text-white">—</td>
                <td className="py-3 px-2 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-dark-700 text-dark-400 text-xs">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
