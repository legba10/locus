'use client'

import { useFetch } from '@/shared/hooks/useFetch'
import { metricLabelByKey } from '@/shared/reviews/metricsPool'
import { cn } from '@/shared/utils/cn'

const DISPLAY_KEYS = ['cleanliness', 'safety', 'accuracy', 'checkin', 'value', 'communication'] as const

export function ListingMetricsCard({ listingId }: { listingId: string }) {
  const { data, isLoading } = useFetch<{ ok?: boolean; items?: Array<{ metricKey: string; avgValue: number; count: number }> }>(
    ['listing-metrics', listingId],
    `/api/reviews/listing/${encodeURIComponent(listingId)}/metrics`
  )

  const items = data?.items ?? []
  const byKey = Object.fromEntries(items.map((m) => [m.metricKey, m]))
  const display = DISPLAY_KEYS.filter((k) => byKey[k] != null).map((k) => ({ key: k, ...byKey[k] }))

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (display.length === 0) return null

  return (
    <div className={cn('rounded-2xl border border-gray-100 bg-white p-5 md:p-6', 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]')}>
      <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">Метрики жилья</h3>
      <div className="space-y-3">
        {display.map(({ key, avgValue, count }) => {
          const pct = Math.round(avgValue)
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between text-[13px]">
                <span className="font-medium text-[var(--text-primary)]">{metricLabelByKey(key)}</span>
                <span className="tabular-nums text-[#6B7280]">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
