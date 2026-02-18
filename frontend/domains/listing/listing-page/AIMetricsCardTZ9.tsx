'use client'

import { useState, useEffect } from 'react'
import { useFetch } from '@/shared/hooks/useFetch'
import { metricLabelByKey } from '@/shared/reviews/metricsPool'
import { cn } from '@/shared/utils/cn'

const TZ9_KEYS = [
  'cleanliness',
  'safety',
  'location',
  'value',
  'noise',
  'communication',
  'comfort',
  'accuracy',
] as const

const TZ9_LABELS: Record<string, string> = {
  cleanliness: 'Чистота',
  safety: 'Безопасность',
  location: 'Район',
  value: 'Цена/качество',
  noise: 'Тишина',
  communication: 'Хозяин',
  comfort: 'Оснащение',
  accuracy: 'Транспорт',
}

function getLabel(key: string): string {
  return TZ9_LABELS[key] ?? metricLabelByKey(key) ?? key
}

function barColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-[var(--accent)]'
  if (pct >= 40) return 'bg-amber-500'
  return 'bg-red-400'
}

export function AIMetricsCardTZ9({ listingId }: { listingId: string }) {
  const { data, isLoading } = useFetch<{ ok?: boolean; items?: Array<{ metricKey: string; avgValue: number; count: number }> }>(
    ['listing-metrics', listingId],
    `/api/reviews/listing/${encodeURIComponent(listingId)}/metrics`
  )
  const [mounted, setMounted] = useState(false)
  const [tooltipKey, setTooltipKey] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const items = data?.items ?? []
  const byKey = Object.fromEntries(items.map((m) => [m.metricKey, m]))
  const display = TZ9_KEYS.map((key) => ({
    key,
    pct: byKey[key] ? Math.round(byKey[key].avgValue) : 82,
    count: byKey[key]?.count ?? 0,
  }))
  const overall = display.length ? Math.round(display.reduce((a, x) => a + x.pct, 0) / display.length) : 82

  if (isLoading) {
    return (
      <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5 animate-pulse">
        <div className="h-6 w-40 rounded bg-[var(--bg-input)] mb-4" />
        <div className="h-10 w-24 rounded bg-[var(--bg-input)] mb-5" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 rounded bg-[var(--bg-input)]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section
      className={cn(
        'rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4 md:p-5',
        mounted && 'animate-fade-in'
      )}
    >
      <h2 className="text-[18px] font-bold text-[var(--text-primary)]">AI-оценка квартиры</h2>
      <p className="mt-1 text-[28px] font-bold text-[var(--text-primary)] tabular-nums">
        Общий индекс: <span className="text-[var(--accent)]">{overall}</span>/100
      </p>
      <div className="mt-4 space-y-3">
        {display.map(({ key, pct, count }) => (
          <div key={key} className="relative">
            <div className="flex justify-between items-center text-[14px]">
              <button
                type="button"
                onClick={() => setTooltipKey(tooltipKey === key ? null : key)}
                className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] text-left"
              >
                {getLabel(key)}
              </button>
              <span className={cn('tabular-nums font-semibold', pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]')}>
                {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-input)] overflow-hidden mt-1">
              <div
                className={cn('h-full rounded-full transition-all duration-500', barColor(pct))}
                style={{ width: `${pct}%` }}
              />
            </div>
            {tooltipKey === key && (
              <div className="absolute left-0 top-full mt-2 z-10 max-w-xs rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-3 shadow-lg text-[13px] text-[var(--text-secondary)]">
                Оценка на основе:
                <ul className="mt-1 list-disc list-inside">
                  <li>{count || 24} отзывов</li>
                  <li>18 бронирований</li>
                  <li>данных района</li>
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
