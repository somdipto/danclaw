'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AI_MODELS, CHANNELS, PRICING_TIERS } from '@danclaw/shared';
import { useCreateDeployment } from '@danclaw/api';

type DeployStep = 'model' | 'channel' | 'config' | 'deploying';

export default function DeployPage() {
  const router = useRouter();
  const [step, setStep] = useState<DeployStep>('model');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'elite'>('free');
  const [selectedRegion, setSelectedRegion] = useState('us-central1');
  const [serviceName, setServiceName] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createDeployment = useCreateDeployment({
    onSuccess: (result) => {
      setErrorMessage(null);
      if (result.data?.deployment) {
        router.push(`/dashboard/deploy/provisioning?id=${result.data.deployment.id}`);
      }
    },
    onError: (err) => {
      setErrorMessage(err?.message || 'Failed to create deployment. Please try again.');
    },
  });

  const handleDeploy = async () => {
    if (!selectedModel || !selectedChannel || !serviceName) return;
    setErrorMessage(null);

    await createDeployment.mutateAsync({
      service_name: serviceName.toLowerCase().replace(/\s+/g, '-'),
      model: selectedModel,
      channel: selectedChannel,
      tier: selectedTier,
      region: selectedRegion,
      openrouter_token: apiToken || undefined,
    });
  };

  const dismissError = () => setErrorMessage(null);

  const stepNumber = { model: 1, channel: 2, config: 3, deploying: 4 };
  const steps = [
    { key: 'model', label: 'Select Model' },
    { key: 'channel', label: 'Select Channel' },
    { key: 'config', label: 'Configure' },
  ];

  const canProceed = {
    model: !!selectedModel,
    channel: !!selectedChannel,
    config: !!serviceName,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Deploy New Agent</h1>
        <p className="text-dark-400 text-sm mt-1">Set up your AI agent in 3 simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                transition-all duration-300
                ${stepNumber[step] > i + 1
                  ? 'bg-secondary-500 text-white'
                  : stepNumber[step] === i + 1
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-500 border border-dark-700'
                }
              `}
            >
              {stepNumber[step] > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${stepNumber[step] >= i + 1 ? 'text-white' : 'text-dark-500'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px ${stepNumber[step] > i + 1 ? 'bg-secondary-500' : 'bg-dark-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-up">
          <p className="text-sm text-red-400">{errorMessage}</p>
          <button onClick={dismissError} className="text-red-400 hover:text-red-300 ml-4 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Step 1: Select Model */}
      {step === 'model' && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-lg font-semibold text-white">Which AI model?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_MODELS.map((model) => (
              <Card
                key={model.id}
                hover
                onClick={() => setSelectedModel(model.id)}
                className={`cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'border-primary-500/50 bg-primary-500/5'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{model.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{model.name}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{model.provider}</p>
                    <p className="text-sm text-dark-400 mt-2">{model.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button disabled={!canProceed.model} onClick={() => setStep('channel')}>
              Next: Select Channel →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Channel */}
      {step === 'channel' && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-lg font-semibold text-white">Which channel?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHANNELS.map((channel) => (
              <Card
                key={channel.id}
                hover={channel.available}
                onClick={() => channel.available && setSelectedChannel(channel.id)}
                className={`
                  ${!channel.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${selectedChannel === channel.id ? 'border-primary-500/50 bg-primary-500/5' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{channel.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{channel.name}</p>
                      {!channel.available && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-400">Soon</span>
                      )}
                    </div>
                    <p className="text-sm text-dark-400">{channel.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep('model')}>← Back</Button>
            <Button disabled={!canProceed.channel} onClick={() => setStep('config')}>
              Next: Configure →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Configure */}
      {step === 'config' && (
        <div className="space-y-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-white">Configure your agent</h2>

          <Card>
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex items-center gap-6 pb-6 border-b border-dark-700/50">
                <div>
                  <p className="text-xs text-dark-400 mb-1">Model</p>
                  <p className="text-white font-medium">
                    {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-400 mb-1">Channel</p>
                  <p className="text-white font-medium">
                    {CHANNELS.find((c) => c.id === selectedChannel)?.name}
                  </p>
                </div>
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Agent Name</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="my-awesome-agent"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:border-primary-500 focus:outline-none"
                />
                <p className="text-xs text-dark-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>

              {/* Tier selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Select Plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {PRICING_TIERS.map((tier) => (
                    <button
                      key={tier.tier}
                      onClick={() => setSelectedTier(tier.tier)}
                      className={`
                        p-4 rounded-xl border text-center transition-all
                        ${selectedTier === tier.tier
                          ? 'border-primary-500/50 bg-primary-500/5'
                          : 'border-dark-700/50 bg-dark-800/30 hover:border-dark-600'
                        }
                      `}
                    >
                      <p className="font-semibold text-white">{tier.name}</p>
                      <p className="text-xs text-dark-400 mt-1">{tier.priceLabel}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="us-central1">🇺🇸 US Central (Iowa)</option>
                  <option value="eu-west1">🇪🇺 EU West (Belgium)</option>
                  <option value="ap-south1">🇮🇳 Asia Pacific (Mumbai)</option>
                </select>
              </div>

              {/* API Key (optional) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  OpenRouter API Key <span className="text-dark-500">(optional)</span>
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:border-primary-500 focus:outline-none"
                />
                <p className="text-xs text-dark-500 mt-1">Leave empty to use included credits</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep('channel')}>← Back</Button>
            <Button
              loading={createDeployment.isPending}
              disabled={!canProceed.config}
              onClick={handleDeploy}
            >
              🚀 Deploy Agent
            </Button>
          </div>
        </div>
      )}

      {/* Deploying state */}
      {createDeployment.isPending && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-white mb-2">Deploying your agent...</h2>
          <p className="text-dark-400">Spinning up container and connecting services</p>
        </div>
      )}
    </div>
  );
}
