'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { AuthProvider } from '@/domains/auth/AuthProvider'
import { ModalProvider } from '@/shared/contexts/ModalContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const safeMode = process.env.NEXT_PUBLIC_SAFE_MODE === 'true';
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // TZ-2: не повторять запрос при 401 (auth)
        retry: (failureCount, error: unknown) => {
          const err = error as { status?: number };
          if (err?.status === 401) return false;
          return failureCount < 2;
        },
        staleTime: 60_000, // 1 min
        gcTime: 5 * 60_000, // 5 min
        refetchOnWindowFocus: false,
        networkMode: 'online',
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        {safeMode ? (
          <>{children}</>
        ) : (
          <AuthProvider>
            {children}
          </AuthProvider>
        )}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ModalProvider>
    </QueryClientProvider>
  )
}

