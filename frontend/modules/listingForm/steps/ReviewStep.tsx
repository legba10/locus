'use client'

import type { ListingPhotoDraft } from '../listingStore'

interface ReviewStepProps {
  photos: ListingPhotoDraft[]
  title: string
  description: string
  price: string
}

export function ReviewStep({ photos, title, description, price }: ReviewStepProps) {
  const cover = photos.find((p) => p.isCover) ?? photos[0]

  return (
    <div className="space-y-4">
      <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Проверьте объявление</h3>
      <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 space-y-3">
        {cover && (
          <div className="overflow-hidden rounded-[10px] bg-[var(--bg-input)]">
            <img src={cover.url} alt="" className="h-44 w-full object-cover" />
          </div>
        )}
        <div>
          <p className="text-[12px] text-[var(--text-muted)]">Описание</p>
          <p className="text-[14px] text-[var(--text-primary)] whitespace-pre-line">{description || title || '—'}</p>
        </div>
        <div>
          <p className="text-[12px] text-[var(--text-muted)]">Цена</p>
          <p className="text-[16px] font-semibold text-[var(--text-primary)]">{price ? `${price} ₽` : '—'}</p>
        </div>
      </div>
    </div>
  )
}
