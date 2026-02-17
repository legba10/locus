'use client'

import Link from 'next/link'
import { ListingGallery } from '@/components/listing/ListingGallery'
import { ListingInfo } from '@/components/listing/ListingInfo'
import { ListingSpecs } from '@/components/listing/ListingSpecs'
import { ListingOwner } from '@/components/listing/ListingOwner'
import { ListingBooking } from '@/components/listing'
import { cn } from '@/shared/utils/cn'

export interface ListingLayoutTZ10Props {
  listingId: string
  title: string
  city: string
  district?: string | null
  price: number
  rooms: number | null
  area: number | null
  floor: number | null
  totalFloors: number | null
  description: string
  /** Строки для блока характеристик: «2 комнаты», «45 м²», «есть кухня» и т.д. */
  specItems: string[]
  photos: Array<{ url: string; alt?: string }>
  owner: {
    id: string
    name: string
    avatar: string | null
    rating?: number | null
    reviewsCount?: number | null
    listingsCount?: number | null
    lastSeen?: string | null
  }
  onWrite: () => void
  onBookingConfirm: (data: { checkIn: Date; checkOut: Date; guests: number }) => void
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)
}

/** ТЗ №10: детальная страница — галерея → цена → инфо → описание → характеристики → владелец → карта, sticky кнопка. */
export function ListingLayoutTZ10(props: ListingLayoutTZ10Props) {
  const {
    title,
    city,
    district,
    price,
    description,
    specItems,
    photos,
    owner,
    onWrite,
    onBookingConfirm,
  } = props

  const subtitle = [city, district].filter(Boolean).join(' • ') || city || ''

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="max-w-[720px] mx-auto px-4 py-4 md:py-6">
        {/* 1. Галерея — height 280, radius bottom 20 */}
        <div className="rounded-t-[18px] overflow-hidden -mx-4 md:mx-0">
          <ListingGallery
            photos={photos}
            title={title}
            variant="detail"
          />
        </div>

        <div className="px-0 md:px-0 mt-4 space-y-6">
          {/* 2. Цена — font-size 26, font-weight 700 */}
          <p className="text-[26px] font-bold text-[var(--text-primary)]">
            {formatPrice(price)} ₽ / мес
          </p>

          {/* 3. Основная инфо */}
          <ListingInfo title={title} subtitle={subtitle} />

          {/* 4. Блок бронирования — по клику «Забронировать» скролл сюда */}
          <div id="listing-booking">
            <ListingBooking
              listingId={props.listingId}
              pricePerNight={price}
              onConfirm={onBookingConfirm}
            />
          </div>

          {/* 5. Характеристики */}
          {specItems.length > 0 && (
            <section>
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-3">Характеристики</h2>
              <ListingSpecs items={specItems} />
            </section>
          )}

          {/* 6. Описание */}
          {description && (
            <section>
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">Описание</h2>
              <p className="text-[14px] text-[var(--text-secondary)] whitespace-pre-wrap">{description}</p>
            </section>
          )}

          {/* 7. Владелец */}
          <ListingOwner
            owner={owner}
            onWrite={onWrite}
            showRespondsFast={true}
          />

          {/* 8. Карта — mock */}
          {subtitle && (
            <section className="rounded-[18px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">Район</h2>
              <p className="text-[14px] text-[var(--text-secondary)]">{district || city || '—'}</p>
            </section>
          )}
        </div>
      </div>

      {/* Sticky кнопка снизу — ТЗ №10 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-[var(--bg-main)]/95 backdrop-blur border-t border-[var(--border-main)] safe-area-pb md:hidden">
        <div className="max-w-[720px] mx-auto">
          <button
            type="button"
            onClick={() => document.getElementById('listing-booking')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full py-3 rounded-[14px] bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold text-[16px] hover:opacity-95 transition-opacity"
          >
            Забронировать
          </button>
        </div>
      </div>

    </div>
  )
}
