'use client'

import Link from 'next/link'
import { ListingCard, ListingCardSkeleton } from '@/components/listing'
import { useFetch } from '@/shared/hooks/useFetch'
import { useAuthStore } from '@/domains/auth'
interface FavoritesResponse {
  items: any[]
  total: number
}

export default function PageClient() {
  const { isAuthenticated } = useAuthStore()
  const { data, isLoading, error, refetch } = useFetch<FavoritesResponse>(
    ['favorites'],
    '/api/favorites',
    { enabled: isAuthenticated() }
  )

  if (!isAuthenticated()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Избранное</h1>
        <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
          <svg className="mx-auto h-16 w-16 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-text">Войдите, чтобы сохранять избранное</h2>
          <p className="mt-2 text-text-mut">Сохраняйте понравившиеся объявления и возвращайтесь к ним позже</p>
          <Link 
            href="/auth/login" 
            className="mt-4 inline-block rounded-xl px-6 py-2 font-medium text-white transition-[background] hover:opacity-95"
            style={{ background: 'var(--button-primary)' }}
          >
            Войти
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Избранное</h1>
          <p className="text-text-mut">
            {data?.total ? `${data.total} объявлений` : 'Ваши сохранённые объявления'}
          </p>
        </div>
        <Link 
          href="/search" 
          className="rounded-xl border border-border bg-surface-3 px-4 py-2 text-sm text-text-mut hover:bg-[var(--accent-soft)] hover:text-text transition"
        >
          Искать ещё
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">Не удалось загрузить избранное</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && (!data?.items || data.items.length === 0) && (
        <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
          <svg className="mx-auto h-16 w-16 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-text">Сохраняйте варианты</h2>
          <p className="mt-2 text-text-mut">Добавляйте объявления в избранное, чтобы вернуться к ним позже</p>
          <Link 
            href="/search" 
            className="mt-4 inline-block rounded-xl px-6 py-2 font-medium text-white transition-[background] hover:opacity-95"
            style={{ background: 'var(--button-primary)' }}
          >
            Найти жильё
          </Link>
        </div>
      )}

      {/* Listings grid */}
      {!isLoading && !error && data?.items && data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((listing: any) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              photo={listing.photos?.[0]?.url ?? listing.images?.[0]?.url ?? listing.imageUrl}
              photos={listing.photos}
              title={listing.title ?? 'Без названия'}
              price={listing.pricePerNight ?? listing.basePrice ?? 0}
              city={listing.city ?? ''}
              district={listing.district}
              owner={listing.owner ? { id: listing.owner.id, name: listing.owner.name ?? 'Владелец', avatar: listing.owner.avatar ?? null, rating: listing.owner.rating } : undefined}
              rating={listing.rating}
              isFavorite={true}
              onFavoriteToggle={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
