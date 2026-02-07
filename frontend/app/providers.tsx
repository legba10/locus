'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { AuthProvider } from '@/domains/auth/AuthProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const safeMode = process.env.NEXT_PUBLIC_SAFE_MODE === 'true';
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        // Reduce duplicate refetches under load
        staleTime: 60_000, // 1 min
        gcTime: 5 * 60_000, // 5 min
        refetchOnWindowFocus: false,
        // Prevent hanging on failed requests
        networkMode: 'online',
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
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

