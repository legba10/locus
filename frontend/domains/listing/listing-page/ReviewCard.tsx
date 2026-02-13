'use client'

import Image from 'next/image'
import { metricLabelByKey } from '@/shared/reviews/metricsPool'
import { cn } from '@/shared/utils/cn'

export interface ListingReviewCardProps {
  review: {
    id: string
    rating: number
    text: string | null
    createdAt: string
    author?: { id: string; profile?: { name: string | null; avatarUrl: string | null } | null }
    metrics?: Array<{ metricKey: string; value: number }>
  }
}

export function ReviewCard({ review }: ListingReviewCardProps) {
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''
  const name = review.author?.profile?.name ?? 'Гость'
  const avatarUrl = review.author?.profile?.avatarUrl ?? null
  const metrics = review.metrics ?? []

  return (
    <div className={cn('rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-5')}>
      <div className="flex items-start gap-3">
        {avatarUrl ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-glass)] flex-shrink-0">
            <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="40px" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] font-semibold text-[14px]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--text-main)]">
              <span className="text-amber-500">★</span> {review.rating.toFixed(1)}
            </span>
            <span className="text-[12px] text-[var(--text-secondary)]">{dateStr}</span>
          </div>
          {review.text ? (
            <p className="mt-2 text-[14px] text-[var(--text-main)] whitespace-pre-wrap leading-relaxed" style={{ lineHeight: 1.6 }}>
              {review.text}
            </p>
          ) : (
            <p className="mt-2 text-[13px] text-[var(--text-secondary)] italic">Без комментария</p>
          )}
          {metrics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {metrics.slice(0, 5).map((m) => (
                <span key={m.metricKey} className="text-[12px] text-[var(--text-secondary)]">
                  {metricLabelByKey(m.metricKey)} <span className="font-medium tabular-nums text-[var(--text-main)]">{m.value}%</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
