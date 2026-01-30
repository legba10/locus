'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { AuthProvider } from '@/domains/auth/AuthProvider'

// DEBUG
console.log("[DEBUG] providers.tsx: module loaded");

export function Providers({ children }: { children: React.ReactNode }) {
  const safeMode = process.env.NEXT_PUBLIC_SAFE_MODE === 'true';
  console.log("[DEBUG] providers.tsx: Providers render, SAFE_MODE=", safeMode);
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5000,
        // Prevent hanging on failed requests
        networkMode: 'offlineFirst',
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {safeMode ? (
        // SAFE_MODE: skip auth provider entirely
        <>{children}</>
      ) : (
        <AuthProvider>
          {children}
        </AuthProvider>
      )}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

