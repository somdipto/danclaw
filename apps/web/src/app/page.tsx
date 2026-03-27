import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { pricingTiers } from '@/lib/mockData';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
            <span className="text-sm text-primary-300">500+ AI Models Available</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
            Your AI Agent
            <br />
            <span className="gradient-text">in 60 Seconds</span>
          </h1>

          <p className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Deploy, manage, and chat with AI agents — with zero DevOps.
            One click. Any model. Any channel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/login">
              <Button size="xl" className="glow-primary">
                🚀 Deploy My Agent
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="xl">
                Watch Demo →
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">60s</p>
              <p className="text-sm text-dark-400">Deploy Time</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-dark-400">AI Models</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-dark-400">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Three simple steps to your own AI agent. No SSH, no Docker, no configuration files.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🔐',
                title: 'Sign In',
                description: 'One-click authentication with Google or Apple. No passwords to remember.',
              },
              {
                step: '02',
                icon: '⚡',
                title: 'Deploy',
                description: 'Choose your AI model and channel. We handle everything — containers, networking, scaling.',
              },
              {
                step: '03',
                icon: '💬',
                title: 'Chat',
                description: 'Start chatting instantly. Real-time WebSocket connection with your personal AI agent.',
              },
            ].map((item, i) => (
              <Card key={i} hover className="relative overflow-hidden group">
                <div className="absolute top-4 right-4 text-6xl font-bold text-dark-800/50 group-hover:text-primary-500/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative">
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-dark-400 leading-relaxed">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-primary-950/5 to-dark-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built Different
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              The only mobile-first, multi-agent platform in the market.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🚀',
                title: 'One-Click Deploy',
                description: 'Deploy AI agents in under 60 seconds. No CLI, no SSH, no Docker.',
                color: 'from-primary-500/20 to-primary-500/5',
              },
              {
                icon: '📱',
                title: 'Mobile-First',
                description: 'Native iOS + Android + Web. Single codebase, everywhere.',
                color: 'from-secondary-500/20 to-secondary-500/5',
              },
              {
                icon: '🤖',
                title: 'Multi-Agent',
                description: 'SwarmClaw orchestration. Run multiple agents working together.',
                color: 'from-accent-500/20 to-accent-500/5',
              },
              {
                icon: '💰',
                title: 'Transparent Pricing',
                description: 'Free tier included. No hidden costs. Pay only for what you use.',
                color: 'from-purple-500/20 to-purple-500/5',
              },
            ].map((feature, i) => (
              <Card key={i} hover>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison ─── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Traditional Method vs DanClaw
            </h2>
            <p className="text-dark-400">
              Skip the complexity. Get straight to building.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional */}
            <Card className="border-red-500/20">
              <h3 className="text-lg font-semibold text-red-400 mb-6">Traditional Setup</h3>
              <ul className="space-y-3">
                {[
                  { task: 'Purchasing VPS', time: '15 min' },
                  { task: 'Creating SSH keys', time: '10 min' },
                  { task: 'Connecting via SSH', time: '5 min' },
                  { task: 'Installing Node.js', time: '5 min' },
                  { task: 'Installing framework', time: '7 min' },
                  { task: 'Configuration', time: '10 min' },
                  { task: 'Connecting AI provider', time: '4 min' },
                  { task: 'Pairing channel', time: '4 min' },
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <span className="text-dark-400">{item.task}</span>
                    <span className="text-dark-500 font-mono">{item.time}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-dark-700/50 flex justify-between">
                <span className="text-dark-400 font-medium">Total</span>
                <span className="text-red-400 font-bold font-mono">60+ min</span>
              </div>
            </Card>

            {/* DanClaw */}
            <Card className="border-secondary-500/20 glow-secondary">
              <h3 className="text-lg font-semibold text-secondary-400 mb-6">DanClaw</h3>
              <div className="flex flex-col items-center justify-center h-[280px]">
                <div className="text-7xl font-bold gradient-text mb-2">&lt;1</div>
                <div className="text-2xl font-bold text-white mb-4">minute</div>
                <p className="text-dark-400 text-center text-sm">
                  Pick a model, connect a channel, deploy — done.
                  <br />
                  Servers, containers, and configs are
                  <br />
                  already set up for you.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-dark-700/50 flex justify-between">
                <span className="text-dark-400 font-medium">Total</span>
                <span className="text-secondary-400 font-bold font-mono">&lt;1 min</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-primary-950/5 to-dark-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-dark-400">Start free. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.tier}
                className={`relative ${
                  tier.popular
                    ? 'border-primary-500/50 glow-primary scale-[1.02]'
                    : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${tier.price === 0 ? '0' : tier.price}
                    </span>
                    <span className="text-dark-400">/mo</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-dark-300">
                      <svg className="w-4 h-4 text-secondary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/login">
                  <Button
                    variant={tier.popular ? 'primary' : 'outline'}
                    fullWidth
                  >
                    {tier.price === 0 ? 'Start Free' : 'Get Started'}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="py-16 px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Deploy?
              </h2>
              <p className="text-dark-400 max-w-lg mx-auto mb-8">
                Join thousands of users who deploy AI agents without touching a terminal. Start free today.
              </p>
              <Link href="/login">
                <Button size="xl" className="glow-primary">
                  🚀 Deploy My Agent — Free
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
