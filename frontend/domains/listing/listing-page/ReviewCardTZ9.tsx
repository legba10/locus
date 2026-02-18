'use client'

import Image from 'next/image'
import { metricLabelByKey } from '@/shared/reviews/metricsPool'
import { cn } from '@/shared/utils/cn'

export interface ReviewCardTZ9Props {
  review: {
    id: string
    rating: number
    text: string | null
    createdAt: string
    author?: { id: string; profile?: { name: string | null; avatarUrl: string | null } | null }
    metrics?: Array<{ metricKey: string; value: number }>
    ownerReply?: string | null
  }
  /** для анимации появления */
  index?: number
}

export function ReviewCardTZ9({ review, index = 0 }: ReviewCardTZ9Props) {
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''
  const name = review.author?.profile?.name ?? 'Гость'
  const avatarUrl = review.author?.profile?.avatarUrl ?? null
  const metrics = review.metrics ?? []
  const hasReply = Boolean(review.ownerReply?.trim())

  return (
    <article
      className={cn(
        'rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5',
        'animate-fade-in'
      )}
      style={{ animationDuration: '0.4s', animationDelay: `${Math.min(index * 60, 300)}ms`, animationFillMode: 'backwards' } as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        {avatarUrl ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-input)] flex-shrink-0">
            <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="40px" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] font-semibold text-[14px]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-[14px] text-[var(--text-primary)]">{name}</span>
            <span className="text-[12px] text-[var(--text-muted)]">{dateStr}</span>
            <span className="inline-flex items-center gap-0.5 text-[14px] text-amber-600 font-medium">
              ★ {review.rating.toFixed(1)}
            </span>
          </div>
          {review.text ? (
            <p className="mt-2 text-[14px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
              {review.text}
            </p>
          ) : (
            <p className="mt-2 text-[13px] text-[var(--text-muted)] italic">Без комментария</p>
          )}
          {metrics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)]">Оценки:</span>
              {metrics.slice(0, 5).map((m) => (
                <span key={m.metricKey}>
                  {metricLabelByKey(m.metricKey)}{' '}
                  <span className="font-medium tabular-nums text-[var(--text-primary)]">
                    {Math.min(5, Math.max(1, Math.round((m.value / 100) * 5)))}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {hasReply && (
        <div className="mt-4 pl-0 md:pl-13 rounded-[12px] border-l-2 border-[var(--border-main)] bg-[var(--bg-input)]/50 p-3">
          <p className="text-[12px] font-semibold text-[var(--text-muted)] mb-1">Ответ владельца</p>
          <p className="text-[14px] text-[var(--text-secondary)] whitespace-pre-wrap">{review.ownerReply}</p>
        </div>
      )}
    </article>
  )
}
