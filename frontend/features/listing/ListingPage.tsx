'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFetch } from '@/shared/hooks/useFetch'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetchJson } from '@/shared/utils/apiFetch'
import { addPendingReminder } from '@/shared/reviews/reviewReminderStorage'
import { useAuthStore, usePermissions } from '@/domains/auth'
import { amenitiesToLabels, amenityKeysFromApi } from '@/core/i18n/ru'
import { ListingBooking } from '@/components/listing'
import type { ListingItem } from './listing.types'
import styles from './listing.module.css'
import ListingGallery from './ListingGallery'
import ListingHeader from './ListingHeader'
import ListingDetails from './ListingDetails'
import ListingOwnerPanel from './ListingOwnerPanel'
import ListingUserActions from './ListingUserActions'

interface ListingPageProps {
  id: string
  initialListing?: { listing?: unknown; item?: unknown } | null
}

interface ListingApiResponse {
  listing?: RawListing
  item?: RawListing
}

interface RawListing {
  id: string
  title?: string
  description?: string
  city?: string
  addressLine?: string
  district?: string
  lat?: number
  lng?: number
  bedrooms?: number
  area?: number
  pricePerNight?: number
  basePrice?: number
  images?: Array<{ url: string; alt?: string }>
  photos?: Array<{ url: string; alt?: string }>
  amenities?: unknown
  owner?: { id: string; name: string; avatar: string | null; rating?: number | null; listingsCount?: number }
  ownerId?: string
  status?: string
  statusCanonical?: string
  capacityGuests?: number
  maxGuests?: number
}

function normalizeListing(raw: RawListing | null | undefined): ListingItem | null {
  if (!raw?.id) return null
  const photos = (raw.images || raw.photos || []).map((p) => ({ url: p?.url ?? '', alt: (p as { alt?: string })?.alt ?? raw.title ?? '' }))
  const pricePerNight = Number(raw.pricePerNight ?? raw.basePrice ?? 0)
  const amenities = amenitiesToLabels(amenityKeysFromApi(raw.amenities))
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    city: raw.city ?? '',
    addressLine: raw.addressLine,
    district: raw.district,
    bedrooms: raw.bedrooms,
    area: raw.area,
    lat: raw.lat,
    lng: raw.lng,
    pricePerNight,
    photos,
    amenities,
    status: raw.status,
    statusCanonical: raw.statusCanonical,
    owner: raw.owner
      ? {
          id: raw.owner.id,
          name: raw.owner.name,
          avatar: raw.owner.avatar ?? null,
          rating: raw.owner.rating ?? null,
          reviewsCount: undefined,
          listingsCount: raw.owner.listingsCount,
        }
      : undefined,
  }
}

function getIsPendingModeration(raw: RawListing | null | undefined): boolean {
  if (!raw) return false
  const s = String(raw.statusCanonical ?? raw.status ?? '').toUpperCase()
  return s === 'MODERATION' || s === 'PENDING_REVIEW' || s === 'AWAITING_PAYMENT'
}

export default function ListingPage({ id, initialListing }: ListingPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  const { data, isLoading, error } = useFetch<ListingApiResponse>(
    ['listing', id],
    `/api/listings/${id}`,
    initialListing != null ? { initialData: initialListing as ListingApiResponse } : {}
  )

  const raw = data?.listing ?? data?.item
  const listing = normalizeListing(raw)
  const ownerId = raw?.owner?.id ?? (raw as RawListing & { ownerId?: string })?.ownerId ?? ''
  const permissions = usePermissions({ listingOwnerId: ownerId || undefined })

  const [mapOpen, setMapOpen] = useState(false)
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)
  const [adminStatusLoading, setAdminStatusLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const isPendingModeration = getIsPendingModeration(raw)
  const pricePerNight = listing?.pricePerNight ?? 0
  const maxGuests = (raw as RawListing)?.capacityGuests ?? (raw as RawListing)?.maxGuests ?? 2

  useEffect(() => {
    if (!mapOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [mapOpen])

  const handleWrite = useCallback(async () => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/listing/${id}`)}`)
      return
    }
    setWriteLoading(true)
    try {
      const conv = await apiFetchJson<{ id: string }>(`/chats/by-listing/${listing?.id}`, { method: 'POST' })
      router.push(`/messages?chat=${conv.id}`)
    } catch {
      router.push(`/messages?listing=${listing?.id}`)
    } finally {
      setWriteLoading(false)
    }
  }, [isAuthenticated, router, id, listing?.id])

  const handleBookingConfirm = useCallback(
    async (data: { checkIn: Date; checkOut: Date; guests: number }) => {
      if (!isAuthenticated()) {
        router.push(`/auth/login?redirect=${encodeURIComponent(`/listing/${id}`)}`)
        return
      }
      try {
        const res = await apiFetchJson<{ item?: { id?: string; listingId?: string; checkOut?: string }; conversationId?: string | null }>('/bookings', {
          method: 'POST',
          body: JSON.stringify({
            listingId: listing?.id,
            checkIn: data.checkIn.toISOString(),
            checkOut: data.checkOut.toISOString(),
            guestsCount: data.guests,
          }),
        })
        const booking = res?.item
        if (booking?.id && booking?.listingId && booking?.checkOut) {
          addPendingReminder({
            bookingId: booking.id,
            listingId: booking.listingId,
            checkOut: typeof booking.checkOut === 'string' ? booking.checkOut : new Date(booking.checkOut).toISOString(),
          })
        }
        if (res?.conversationId) router.push(`/messages?chat=${res.conversationId}`)
        setBookingSheetOpen(false)
      } catch {
        // keep sheet open on error
      }
    },
    [isAuthenticated, router, id, listing?.id]
  )

  const handleAdminStatusChange = useCallback(
    async (status: 'published' | 'rejected' | 'archived') => {
      if (adminStatusLoading) return
      setAdminStatusLoading(true)
      try {
        await apiFetchJson(`/api/listings/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            moderation_note: status === 'rejected' ? 'Отклонено модератором' : undefined,
          }),
        })
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['listing', id] }),
          queryClient.invalidateQueries({ queryKey: ['profile-listings'] }),
        ])
      } finally {
        setAdminStatusLoading(false)
      }
    },
    [adminStatusLoading, id, queryClient]
  )

  const handleMobileBook = useCallback(() => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/listing/${id}`)}`)
      return
    }
    setBookingSheetOpen(true)
  }, [isAuthenticated, router, id])

  if (isLoading || !listing) {
    return (
      <div className={styles.container}>
        <div className={styles.leftCol}>
          <div className={styles.gallery}>
            <div className={styles.mainImagePlaceholder} />
          </div>
          <div className={styles.headerBlock}><h1>Загрузка…</h1></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className="text-[var(--text-secondary)]">Не удалось загрузить объявление.</p>
      </div>
    )
  }

  const showUserActions = permissions.role === 'user' || (permissions.isOwner && !permissions.isAdmin)
  const showOwnerPanel = permissions.isOwner
  const showAdminModeration = permissions.isAdmin && isPendingModeration
  const hasCoords = typeof listing.lat === 'number' && typeof listing.lng === 'number'

  return (
    <div className={`${styles.container} ${showUserActions ? styles.pbActionBar : ''}`}>
      <div className={styles.leftCol}>
        <ListingGallery listing={listing} />
        <ListingHeader listing={listing} />
        <ListingDetails listing={{ ...listing, capacityGuests: maxGuests } as ListingItem & { capacityGuests?: number }} />
        {listing.description ? (
          <div className={`${styles.card} ${styles.descriptionCard}`}>
            <h3>Описание</h3>
            <p>{listing.description}</p>
          </div>
        ) : null}
        {listing.amenities?.length ? (
          <div className={styles.card}>
            <h3>Удобства</h3>
            <ul className={styles.amenitiesList}>
              {listing.amenities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {hasCoords && (
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setMapOpen(true)}
          >
            Показать на карте
          </button>
        )}
      </div>

      <aside className={styles.rightCol}>
        <div className={styles.sidebarCard}>
          <div className={styles.price}>
            {pricePerNight > 0 ? `${pricePerNight.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
            <span className="text-[14px] font-normal text-[var(--text-secondary)]"> / ночь</span>
          </div>
          {showOwnerPanel && <ListingOwnerPanel listing={listing} />}
          {showUserActions && !showOwnerPanel && (
            <>
              <ListingBooking
                listingId={listing.id}
                pricePerNight={pricePerNight}
                maxGuests={maxGuests}
                onConfirm={handleBookingConfirm}
              />
              <div className="flex flex-col gap-2 mt-3">
                <button type="button" className={styles.primary} onClick={handleWrite} disabled={writeLoading}>
                  {writeLoading ? '…' : 'Написать'}
                </button>
                <button type="button" className={styles.secondary} onClick={() => setIsFavorite((f) => !f)}>
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
              </div>
            </>
          )}
          {showAdminModeration && (
            <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex flex-wrap gap-2">
              <button type="button" disabled={adminStatusLoading} className={styles.primary} onClick={() => handleAdminStatusChange('published')}>
                Одобрить
              </button>
              <button type="button" disabled={adminStatusLoading} className="border border-red-500/30 bg-red-500/10 text-red-600 rounded-xl px-4 py-2 text-sm font-semibold" onClick={() => handleAdminStatusChange('rejected')}>
                Отклонить
              </button>
              <button type="button" disabled={adminStatusLoading} className={styles.secondary} onClick={() => handleAdminStatusChange('archived')}>
                В архив
              </button>
            </div>
          )}
        </div>
      </aside>

      {showUserActions && !showOwnerPanel && (
        <ListingUserActions onWrite={handleWrite} onBook={handleMobileBook} />
      )}

      {bookingSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-t-2xl p-4 pb-[env(safe-area-inset-bottom)] max-h-[85vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Бронирование</h2>
              <button type="button" onClick={() => setBookingSheetOpen(false)} className="p-2 rounded-full hover:bg-[var(--bg-input)]">✕</button>
            </div>
            <ListingBooking listingId={listing.id} pricePerNight={pricePerNight} maxGuests={maxGuests} onConfirm={handleBookingConfirm} />
          </div>
        </div>
      )}

      {mapOpen && hasCoords && (
        <div className={styles.modalOverlay} onClick={() => setMapOpen(false)} role="dialog" aria-modal="true">
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>На карте</h3>
              <button type="button" className={styles.modalClose} onClick={() => setMapOpen(false)} aria-label="Закрыть">✕</button>
            </div>
            <iframe
              title="Карта"
              src={`https://yandex.ru/map-widget/v1/?ll=${listing.lng},${listing.lat}&z=15&pt=${listing.lng},${listing.lat}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
