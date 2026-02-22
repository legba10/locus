'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { ListingWizard } from '@/modules/listingForm'

/** ТЗ-5: Продолжить черновик /create-listing/draft/:id */
export default function CreateListingDraftPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const { isAuthenticated } = useAuthStore()
  const { data, isLoading, error } = useFetch<{ listing?: any; item?: any }>(
    ['listing-draft', id],
    `/api/listings/${id}`,
    { enabled: !!id && isAuthenticated() }
  )
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated() && !redirecting) {
      setRedirecting(true)
      router.replace(`/auth/login?redirect=${encodeURIComponent(`/create-listing/draft/${id}`)}`)
    }
  }, [isAuthenticated, router, id, redirecting])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Требуется авторизация</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent(`/create-listing/draft/${id}`)}`} className="text-[var(--accent)] font-medium">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  if (!id) {
    router.replace('/create-listing')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="h-10 w-48 rounded-[12px] bg-[var(--bg-input)] animate-pulse" />
      </div>
    )
  }

  const listing = data?.listing ?? data?.item
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Черновик не найден</p>
          <Link href="/create-listing" className="text-[var(--accent)] font-medium">
            Создать объявление
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] py-6 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <ListingWizard
          initialListing={listing}
          onSuccess={() => router.push('/owner/dashboard?tab=listings')}
          onCancel={() => router.push('/profile')}
          onLimitReached={() => router.push('/pricing?reason=limit')}
        />
      </div>
    </div>
  )
}
