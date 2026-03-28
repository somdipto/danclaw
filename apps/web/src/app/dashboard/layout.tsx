'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/deploy', label: 'Deploy', icon: '🚀' },
  { href: '/dashboard/chat', label: 'Chat', icon: '💬' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
];

const bottomItems = [
  { href: '#', label: 'Docs', icon: '📚' },
  { href: '#', label: 'Support', icon: '🆘' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Server-side middleware handles redirects, but add client-side guard as defense-in-depth
  if (!isLoading && !isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.replace('/');
  };

  const tierLabel = user?.tier === 'pro' ? 'Pro Plan' : user?.tier === 'elite' ? 'Elite Plan' : 'Free Plan';
  const initials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-dark-800/50 bg-dark-900/50 backdrop-blur-xl shrink-0">
        {/* Logo */}
        <div className="px-6 h-16 flex items-center border-b border-dark-800/50">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="text-lg font-bold text-white">
              Dan<span className="text-primary-400">Claw</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-dark-800/50 space-y-1">
          {bottomItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </a>
          ))}
          <div className="mt-2 px-3 py-3 rounded-xl bg-dark-800/50 border border-dark-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-dark-400 capitalize">{tierLabel}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-dark-500 hover:text-red-400 transition-colors text-xs shrink-0"
                title="Sign out"
              >
                {loggingOut ? '...' : '↩'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 h-full bg-dark-900 border-r border-dark-800/50 flex flex-col animate-slide-up">
            <div className="px-6 h-16 flex items-center justify-between border-b border-dark-800/50">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DC</span>
                </div>
                <span className="text-lg font-bold text-white">DanClaw</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-dark-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-dark-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/50 border border-dark-700/50 text-sm text-dark-400 w-72">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search...
            <span className="ml-auto text-xs text-dark-600 border border-dark-700 rounded px-1.5 py-0.5">⌘K</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-dark-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
