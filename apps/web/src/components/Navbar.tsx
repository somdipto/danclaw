'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="text-lg font-bold text-white">
              Dan<span className="text-primary-400">Claw</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-dark-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-dark-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="text-sm text-dark-400 hover:text-white transition-colors">
              How It Works
            </a>
            <Link href="/login" className="text-sm text-dark-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/login">
              <Button size="sm">Deploy My Agent</Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-dark-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-dark-800/50 bg-dark-950/95 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-dark-400 hover:text-white py-2">Features</a>
            <a href="#pricing" className="block text-sm text-dark-400 hover:text-white py-2">Pricing</a>
            <a href="#how-it-works" className="block text-sm text-dark-400 hover:text-white py-2">How It Works</a>
            <Link href="/login" className="block text-sm text-dark-400 hover:text-white py-2">Sign In</Link>
            <Link href="/login">
              <Button fullWidth>Deploy My Agent</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
