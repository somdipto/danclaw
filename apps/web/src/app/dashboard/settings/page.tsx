'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useUserProfile, useUsage, danclawClient } from '@danclaw/api';
import { useAuth } from '@/lib/auth-context';
import { AI_MODELS } from '@danclaw/shared';

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState('claude-3-sonnet');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    deployComplete: true,
    chatResponse: true,
    weeklySummary: false,
    costAlerts: true,
  });

  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const { data: usageData } = useUsage();
  const { logout } = useAuth();

  const user = profileData?.data?.user;
  const usage = usageData?.data?.usage;
  const tierLabel = user?.tier === 'pro' ? 'Pro Plan' : user?.tier === 'elite' ? 'Elite Plan' : 'Free Plan';

  const handleSaveApiKey = async () => {
    setIsSavingKey(true);
    setApiKeySaved(false);
    try {
      await danclawClient.updateProfile({ openrouter_token: apiKey || undefined });
      setApiKeySaved(true);
      setApiKey('');
      setTimeout(() => setApiKeySaved(false), 3000);
    } catch {
      // handle silently
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleSaveAiPrefs = async () => {
    setIsSavingPrefs(true);
    setPrefsSaved(false);
    try {
      // Persist AI preferences to localStorage (server-side storage TBD)
      localStorage.setItem('ai_prefs', JSON.stringify({
        model: selectedModel,
        temperature,
        max_tokens: maxTokens,
      }));
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 3000);
    } catch {
      // handle silently
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Load AI preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.model) setSelectedModel(prefs.model);
        if (typeof prefs.temperature === 'number') setTemperature(prefs.temperature);
        if (prefs.max_tokens) setMaxTokens(prefs.max_tokens);
      }
    } catch {
      // ignore
    }
  }, []);

  if (profileLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="h-8 w-48 bg-dark-800 rounded-xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-dark-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Account */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">Account</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-dark-700/30">
            <div>
              <p className="text-sm text-dark-400">Email</p>
              <p className="text-white">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-dark-700/30">
            <div>
              <p className="text-sm text-dark-400">Plan</p>
              <p className="text-white capitalize">{tierLabel}</p>
            </div>
            <Button variant="outline" size="sm">Manage Plan</Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-dark-400">Usage This Month</p>
              <p className="text-white">
                {usage
                  ? `$${usage.cost.toFixed(2)} · ${usage.total_requests.toLocaleString()} requests`
                  : 'Loading...'}
              </p>
            </div>
            <Button variant="ghost" size="sm">View Details</Button>
          </div>
        </div>
      </Card>

      {/* AI Settings */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">AI Configuration</h2>
        <div className="space-y-6">
          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Default Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary-500 focus:outline-none"
            >
              {AI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.icon} {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              OpenRouter API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:border-primary-500 focus:outline-none"
              />
              <Button
                size="sm"
                variant="outline"
                loading={isSavingKey}
                onClick={handleSaveApiKey}
              >
                {apiKeySaved ? '✓ Saved' : 'Save'}
              </Button>
            </div>
            {apiKeySaved && (
              <p className="text-xs text-secondary-400 mt-1">API key saved successfully.</p>
            )}
            <p className="text-xs text-dark-500 mt-1">
              Optional. Use your own key for higher rate limits.
            </p>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">Temperature</label>
              <span className="text-sm font-mono text-primary-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-2 bg-dark-700 rounded-full appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-dark-500 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Max Tokens</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Save AI prefs */}
          <div className="flex items-center gap-3 pt-2 border-t border-dark-700/30">
            <Button
              size="sm"
              variant="outline"
              loading={isSavingPrefs}
              onClick={handleSaveAiPrefs}
            >
              {prefsSaved ? '✓ Saved' : 'Save AI Preferences'}
            </Button>
            {prefsSaved && (
              <p className="text-xs text-secondary-400">AI preferences saved.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">Notifications</h2>
        <div className="space-y-4">
          {[
            { key: 'deployComplete', label: 'Deploy complete', desc: 'When an agent finishes deploying' },
            { key: 'chatResponse', label: 'Chat response', desc: 'When an agent responds to a message' },
            { key: 'weeklySummary', label: 'Weekly summary', desc: 'Weekly usage and activity digest' },
            { key: 'costAlerts', label: 'Cost alerts', desc: 'When spending exceeds threshold' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-dark-500">{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof prev],
                  }))
                }
                className={`
                  w-11 h-6 rounded-full transition-all duration-200 relative
                  ${notifications[item.key as keyof typeof notifications]
                    ? 'bg-primary-500'
                    : 'bg-dark-700'
                  }
                `}
              >
                <div
                  className={`
                    w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200
                    ${notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-1'}
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Support */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">Support</h2>
        <div className="space-y-1">
          {[
            { icon: '📖', label: 'Help Center', href: '#' },
            { icon: '💬', label: 'Contact Support', href: '#' },
            { icon: '🐛', label: 'Report Bug', href: '#' },
            { icon: '📄', label: 'Terms of Service', href: '#' },
            { icon: '🔒', label: 'Privacy Policy', href: '#' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-dark-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span className="text-sm text-dark-300">{item.label}</span>
              </div>
              <svg className="w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Sign Out</h2>
            <p className="text-sm text-dark-400">Sign out of your account on this device</p>
          </div>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
