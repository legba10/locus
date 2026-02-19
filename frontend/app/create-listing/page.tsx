'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { CreateListingWizardTZ5 } from '@/domains/listings/CreateListingWizardTZ5'

/** ТЗ-5: Единая точка входа в мастер создания объявления. Не авторизован → логин → сюда. */
export default function CreateListingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/dashboard/listings/create')}`)
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Требуется авторизация</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent('/dashboard/listings/create')}`} className="text-[var(--accent)] font-medium">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] py-6 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <CreateListingWizardTZ5
          onSuccess={(listingId) => {
            router.push('/owner/dashboard?tab=listings')
          }}
          onCancel={() => router.push('/profile')}
          onLimitReached={() => router.push('/pricing?reason=limit')}
        />
      </div>
    </div>
  )
}
