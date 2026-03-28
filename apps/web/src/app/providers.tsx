'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Fragment, useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* @ts-expect-error — React 19 JSX types from @tanstack/react-query vs React 18 ReactNode */}
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
