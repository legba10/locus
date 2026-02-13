'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'

/**
 * TZ-3/TZ-8: защищённый маршрут — редирект на /auth/login только при отсутствии user.
 * Не редиректить с публичных страниц (login/register), чтобы не было зацикливания.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const isLoading = useAuthStore((s) => s.isLoading)

  const loading = !isInitialized || isLoading
  const isPublicAuth = pathname === '/auth/login' || pathname === '/auth/register' || pathname?.startsWith('/auth/telegram')

  useEffect(() => {
    if (loading || isPublicAuth) return
    if (!user) {
      router.replace('/auth/login')
    }
  }, [loading, user, router, isPublicAuth])

  if (loading) return null
  if (!user && !isPublicAuth) return null

  return <>{children}</>
}
