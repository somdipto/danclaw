import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'DanClaw — Your AI Agent in 60 Seconds',
  description:
    'Deploy, manage, and chat with AI agents in under 60 seconds. No DevOps required. Mobile-first, multi-agent, 500+ AI models.',
  keywords: ['AI agent', 'deployment', 'OpenClaw', 'SwarmClaw', 'AI assistant', 'no-code', 'mobile'],
  openGraph: {
    title: 'DanClaw — Your AI Agent in 60 Seconds',
    description: 'Deploy, manage, and chat with AI agents in under 60 seconds. No DevOps required.',
    type: 'website',
    url: 'https://danglasses.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DanClaw — Your AI Agent in 60 Seconds',
    description: 'Deploy, manage, and chat with AI agents in under 60 seconds. No DevOps required.',
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
