'use client'

/** TZ-48: превью объявления для desktop layout create listing */

import type { ListingPhotoDraft } from './listingStore'

interface ListingPreviewCardProps {
  photos: ListingPhotoDraft[]
  title: string
  description: string
  price: string
  city: string
  typeLabel: string
}

export function ListingPreviewCard({ photos, title, description, price, city, typeLabel }: ListingPreviewCardProps) {
  const cover = photos.find((p) => p.isCover) ?? photos[0]

  return (
    <div className="rounded-[16px] card-tz47 p-4 w-full">
      <h3 className="text-[14px] font-semibold text-[var(--text-muted)] mb-3">Превью</h3>
      <div className="space-y-3">
        {cover ? (
          <div className="aspect-[4/3] overflow-hidden rounded-[12px] bg-[var(--bg-input)]">
            <img src={cover.url} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[4/3] rounded-[12px] bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] text-[13px]">
            Добавьте фото
          </div>
        )}
        <p className="text-[16px] font-semibold text-[var(--text-primary)] truncate">
          {title || 'Заголовок'}
        </p>
        <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">
          {description || 'Описание'}
        </p>
        <p className="text-[14px] font-medium text-[var(--text-primary)]">
          {price ? `${price} ₽` : '—'} <span className="text-[var(--text-muted)]">/ мес</span>
        </p>
        <p className="text-[12px] text-[var(--text-muted)]">{city || 'Город'} · {typeLabel}</p>
      </div>
    </div>
  )
}
