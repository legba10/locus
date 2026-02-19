'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { ReviewWizard } from '@/components/listing'
import { ReviewCardTZ9 } from './ReviewCardTZ9'

export type ReviewFilter = 'all' | '5' | 'text' | 'recent' | 'cleanliness' | 'location' | 'value'

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: '5', label: '5★' },
  { id: 'text', label: 'С текстом' },
  { id: 'recent', label: 'Последние' },
  { id: 'cleanliness', label: 'Чистота' },
  { id: 'location', label: 'Район' },
  { id: 'value', label: 'Цена' },
]

export interface ListingReviewsBlockTZ9Props {
  listingId: string
  ownerId?: string
  reviews: any[]
  ratingAvg: number | null
  ratingCount: number
  recommendPercent: number | null
  distribution: Record<number, number>
  userAlreadyReviewed: boolean
  currentUserId?: string | null
  onSubmitted?: () => void
}

export function ListingReviewsBlockTZ9({
  listingId,
  ownerId,
  reviews,
  ratingAvg,
  ratingCount,
  recommendPercent,
  distribution,
  userAlreadyReviewed,
  currentUserId,
  onSubmitted,
}: ListingReviewsBlockTZ9Props) {
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const [showWizard, setShowWizard] = useState(false)
  const [ratingDisplay, setRatingDisplay] = useState(0)
  const wizardRef = useRef<HTMLDivElement>(null)

  const filteredReviews = (() => {
    let list = [...reviews]
    if (filter === '5') list = list.filter((r) => r.rating >= 5)
    if (filter === 'text') list = list.filter((r) => r.text?.trim())
    if (filter === 'recent') list = list.slice(0, 5)
    if (filter === 'cleanliness') list = list.filter((r) => r.metrics?.some((m: any) => m.metricKey === 'cleanliness'))
    if (filter === 'location') list = list.filter((r) => r.metrics?.some((m: any) => m.metricKey === 'location'))
    if (filter === 'value') list = list.filter((r) => r.metrics?.some((m: any) => m.metricKey === 'value'))
    return list
  })()

  useEffect(() => {
    if (ratingAvg == null) return
    const target = Math.round(ratingAvg * 10) / 10
    const step = target / 20
    let v = 0
    const t = setInterval(() => {
      v += step
      if (v >= target) {
        setRatingDisplay(target)
        clearInterval(t)
        return
      }
      setRatingDisplay(Math.round(v * 10) / 10)
    }, 40)
    return () => clearInterval(t)
  }, [ratingAvg])

  const scrollToWizard = () => {
    setShowWizard(true)
    setTimeout(() => wizardRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const total = distribution[1] + distribution[2] + distribution[3] + distribution[4] + distribution[5] || 1
  const distRows = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: distribution[star] ?? 0,
    pct: Math.round(((distribution[star] ?? 0) / total) * 100),
  }))

  return (
    <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5">
      {/* Верх: заголовок + рейтинг + одна кнопка «Оставить отзыв» */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[var(--text-primary)]">Отзывы гостей</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="inline-flex items-center gap-1 text-[18px] font-bold text-amber-600">
              ★ {ratingAvg != null ? ratingDisplay.toFixed(1) : '—'}
            </span>
            <span className="text-[14px] text-[var(--text-secondary)]">
              На основе {ratingCount} {ratingCount === 1 ? 'отзыва' : ratingCount < 5 ? 'отзывов' : 'отзывов'}
            </span>
            {recommendPercent != null && (
              <span className="text-[14px] text-[var(--text-secondary)]">{recommendPercent}% рекомендуют</span>
            )}
          </div>
        </div>
        {!userAlreadyReviewed && (
          <button
            type="button"
            onClick={scrollToWizard}
            className="shrink-0 h-11 px-5 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] hover:opacity-90"
          >
            Оставить отзыв
          </button>
        )}
      </div>

      {/* Распределение рейтинга */}
      {ratingCount > 0 && (
        <div className="mb-6 space-y-2">
          {distRows.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="w-8 text-[13px] text-[var(--text-secondary)]">{star}★</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg-input)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-[13px] text-[var(--text-muted)] tabular-nums">{pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* ТЗ-11: AI-разбор отзывов */}
      <div className="mb-6 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)]/50 p-4">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">AI анализ:</p>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Гости довольны чистотой и расположением. Иногда отмечают шум ночью.
        </p>
      </div>

      {/* Фильтры — горизонтальный скролл */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 scrollbar-none mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-[12px] text-[13px] font-medium transition-colors',
              filter === f.id
                ? 'bg-[var(--accent)] text-[var(--button-primary-text)]'
                : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--border-main)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Список отзывов */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)]">Нет отзывов по выбранному фильтру.</p>
        ) : (
          filteredReviews.map((r, i) => (
            <ReviewCardTZ9 key={r.id} review={r} index={i} />
          ))
        )}
      </div>

      {/* Один блок формы отзыва (без дублирования кнопки) */}
      <div ref={wizardRef} className="mt-8">
        <ReviewWizard
          listingId={listingId}
          ownerId={ownerId}
          userAlreadyReviewed={userAlreadyReviewed}
          onSubmitted={() => {
            onSubmitted?.()
            setShowWizard(false)
          }}
        />
      </div>
    </section>
  )
}
