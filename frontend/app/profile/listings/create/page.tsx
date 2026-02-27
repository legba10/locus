'use client'

/** TZ-30 + TZ-52: Добавить объявление — Container, токены. */

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { ListingWizard } from '@/modules/listingForm'
import { Container } from '@/components/ui'

export default function ProfileCreateListingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isAuthenticated()) {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/profile/listings/create')}`)
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <Container className="text-center section">
          <p className="text-[var(--text-secondary)]">Требуется авторизация</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent('/profile/listings/create')}`} className="btn-primary inline-flex items-center justify-center px-5">
            Войти
          </Link>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-4">
      <ListingWizard
        onSuccess={() => router.push('/profile/listings')}
        onCancel={() => router.push('/profile')}
        onLimitReached={() => router.push('/pricing?reason=limit')}
      />
    </div>
  )
}
