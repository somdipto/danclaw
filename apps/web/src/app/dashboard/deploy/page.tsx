'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_MODELS, CHANNELS, PRICING_TIERS, REGIONS } from '@danclaw/shared';
import { useCreateDeployment } from '@danclaw/api';
import type { Tier, DeployConfig } from '@danclaw/shared';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const fadeIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
};

export default function DeployPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [config, setConfig] = useState<DeployConfig>({
    model: '',
    channel: '',
    tier: 'free',
    region: 'ap-south1',
  });

  const createMutation = useCreateDeployment({
    onSuccess: () => router.push('/dashboard'),
  });

  const handleDeploy = () => {
    createMutation.mutate({
      service_name: `agent-${Date.now()}`,
      model: config.model,
      channel: config.channel,
      tier: config.tier as Tier,
      region: config.region,
    });
  };

  const steps = ['Select Model', 'Select Channel', 'Configure'];

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Deploy New Agent
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Set up your AI agent in 3 simple steps
        </p>
      </motion.div>

      {/* Step Indicator */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-3 flex-1">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < step
                  ? 'bg-emerald-500 text-black'
                  : i === step
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </motion.div>
            <span
              className={`text-sm hidden sm:block ${
                i <= step ? 'text-zinc-400' : 'text-zinc-700'
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 0 - Model Selection */}
        {step === 0 && (
          <motion.div key="step0" {...fadeIn} className="space-y-4">
            <h2 className="text-lg font-medium text-white">Choose your model</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AI_MODELS.map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfig((c) => ({ ...c, model: model.id }))}
                  className={`text-left p-4 rounded-2xl border bg-zinc-900/40 backdrop-blur-sm transition-all ${
                    config.model === model.id
                      ? 'border-white/20 bg-zinc-800/60'
                      : 'border-zinc-800/60 hover:border-zinc-700/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{model.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{model.provider}</p>
                      <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!config.model}
                onClick={() => setStep(1)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  config.model
                    ? 'bg-white text-black hover:bg-zinc-100'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                Next →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 1 - Channel Selection */}
        {step === 1 && (
          <motion.div key="step1" {...fadeIn} className="space-y-4">
            <h2 className="text-lg font-medium text-white">Choose your channel</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CHANNELS.map((ch) => (
                <motion.button
                  key={ch.id}
                  whileHover={!ch.available ? undefined : { y: -2 }}
                  whileTap={!ch.available ? undefined : { scale: 0.98 }}
                  onClick={() => ch.available && setConfig((c) => ({ ...c, channel: ch.id }))}
                  disabled={!ch.available}
                  className={`text-left p-4 rounded-2xl border bg-zinc-900/40 backdrop-blur-sm transition-all ${
                    !ch.available ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    config.channel === ch.id
                      ? 'border-white/20 bg-zinc-800/60'
                      : 'border-zinc-800/60 hover:border-zinc-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ch.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{ch.name}</p>
                        {!ch.available && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-600 font-medium">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500">{ch.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!config.channel}
                onClick={() => setStep(2)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  config.channel
                    ? 'bg-white text-black hover:bg-zinc-100'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                Next →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2 - Configuration */}
        {step === 2 && (
          <motion.div key="step2" {...fadeIn} className="space-y-6">
            <h2 className="text-lg font-medium text-white">Configure deployment</h2>

            {/* Summary */}
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/60">
                <span className="text-sm text-zinc-500">Model</span>
                <span className="text-sm text-white font-medium">
                  {AI_MODELS.find((m) => m.id === config.model)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Channel</span>
                <span className="text-sm text-white font-medium">
                  {CHANNELS.find((ch) => ch.id === config.channel)?.name}
                </span>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="text-sm text-zinc-400 mb-3 block">Select plan</label>
              <div className="grid grid-cols-3 gap-3">
                {PRICING_TIERS.map((tier) => (
                  <motion.button
                    key={tier.tier}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfig((c) => ({ ...c, tier: tier.tier as Tier }))}
                    className={`relative p-4 rounded-xl border text-center transition-all ${
                      config.tier === tier.tier
                        ? 'border-white/30 bg-white/5'
                        : 'border-zinc-800/60 bg-zinc-900/20'
                    } ${tier.popular ? 'ring-1 ring-emerald-500/30' : ''}`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                    <p className="font-medium text-white capitalize">{tier.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{tier.priceLabel}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Region</label>
              <div className="grid grid-cols-3 gap-2">
                {REGIONS.map((region) => (
                  <motion.button
                    key={region.id}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfig((c) => ({ ...c, region: region.id }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      config.region === region.id
                        ? 'border-white/30 bg-white/5'
                        : 'border-zinc-800/60 bg-zinc-900/20'
                    }`}
                  >
                    <span className="text-lg">{region.flag}</span>
                    <p className="text-xs text-zinc-500 mt-1">{region.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-zinc-800/60">
              <button
                onClick={() => setStep(1)}
                 className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeploy}
                disabled={createMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white text-black hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Deploying...' : '🚀 Deploy Agent'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
