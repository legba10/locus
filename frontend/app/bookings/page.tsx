'use client'

import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetch } from '@/shared/utils/apiFetch'
import { BookingCard, formatBookingDates, type BookingCardData } from '@/components/booking/BookingCard'
import { BookingsEmptyState } from '@/components/booking/EmptyState'

function toCardData(item: any): BookingCardData {
  const checkIn = item.checkIn != null ? String(item.checkIn) : ''
  const checkOut = item.checkOut != null ? String(item.checkOut) : ''
  return {
    id: item.id,
    listingId: item.listingId,
    listingTitle: item.listing?.title ?? 'Без названия',
    listingPhoto: item.listing?.photos?.[0]?.url ?? null,
    date: formatBookingDates(checkIn, checkOut),
    status: item.status ?? 'PENDING',
  }
}

export default function BookingsPage() {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const { data, isLoading } = useFetch<{ items: any[] }>(
    ['bookings-my'],
    '/api/bookings',
    { enabled: isAuthenticated() }
  )

  const items = data?.items ?? []

  const handleCancel = async (id: string) => {
    if (!confirm('Отменить бронирование?')) return
    try {
      await apiFetch(`/api/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST' })
      await queryClient.invalidateQueries({ queryKey: ['bookings-my'] })
    } catch (e) {
      console.error(e)
    }
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-[14px] text-[var(--accent)] hover:underline">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-[24px] font-bold text-[var(--text-primary)] mb-6">Бронирования</h1>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[140px] bg-[var(--bg-input)] rounded-[16px] animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <BookingsEmptyState />
        )}

        {!isLoading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item: any) => (
              <BookingCard
                key={item.id}
                booking={toCardData(item)}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
