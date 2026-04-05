'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOAuth = async (provider: 'google' | 'apple' | 'github') => {
    // OAuth coming soon - show message
    setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is coming soon. Please use email sign-in.`);
    setLoading(null);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading('email');
    setError(null);

    const result = await login(email, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Sign-in failed. Please check your credentials.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary-500/5 rounded-full blur-[80px]" />

      <div className="relative w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white font-bold">DC</span>
            </div>
            <span className="text-2xl font-bold text-white">
              Dan<span className="text-primary-400">Claw</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-dark-400">Sign in to manage your AI agents</p>
        </div>

        {/* Auth card */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8 animate-slide-up space-y-4">
          {isEmailMode ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <Button type="submit" fullWidth size="lg" loading={loading === 'email'}>
                Sign In
              </Button>
              <button
                type="button"
                onClick={() => setIsEmailMode(false)}
                className="w-full text-sm text-dark-400 hover:text-primary-400 text-center"
              >
                ← Back to social login
              </button>
            </form>
          ) : (
            <>
              <div className="space-y-3">
                {/* Google */}
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  loading={loading === 'google'}
                  onClick={() => handleOAuth('google')}
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  }
                >
                  Continue with Google
                </Button>

                {/* Apple */}
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  loading={loading === 'apple'}
                  onClick={() => handleOAuth('apple')}
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  }
                >
                  Continue with Apple
                </Button>

                {/* GitHub */}
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  loading={loading === 'github'}
                  onClick={() => handleOAuth('github')}
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  }
                >
                  Continue with GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-dark-800/50 text-dark-500">Or</span>
                </div>
              </div>

              <Button variant="outline" fullWidth size="lg" onClick={() => setIsEmailMode(true)}>
                Sign in with Email
              </Button>
            </>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-dark-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary-400 hover:underline">Terms</a> and{' '}
              <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
