'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'

/**
 * TZ-3: защищённый маршрут — при отсутствии user редирект на /auth/login.
 * Без window.location, только router.replace.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const isLoading = useAuthStore((s) => s.isLoading)

  const loading = !isInitialized || isLoading

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/auth/login')
    }
  }, [loading, user, router])

  if (loading) return null
  if (!user) return null

  return <>{children}</>
}
