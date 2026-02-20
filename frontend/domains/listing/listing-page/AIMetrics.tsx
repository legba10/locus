'use client'

import { useFetch } from '@/shared/hooks/useFetch'
import { metricLabelByKey } from '@/shared/reviews/metricsPool'
import { cn } from '@/shared/utils/cn'

const DISPLAY_KEYS = ['cleanliness', 'safety', 'location', 'value'] as const
const LABEL_OVERRIDE: Record<string, string> = {
  location: 'Район',
  value: 'Цена/качество',
  cleanliness: 'Чистота',
  safety: 'Безопасность',
}

export function AIMetrics({ listingId }: { listingId: string }) {
  const { data, isLoading } = useFetch<{ ok?: boolean; items?: Array<{ metricKey: string; avgValue: number; count: number }> }>(
    ['listing-metrics', listingId],
    `/api/reviews/listing/${encodeURIComponent(listingId)}/metrics`
  )

  const items = data?.items ?? []
  const byKey = Object.fromEntries(items.map((m) => [m.metricKey, m]))
  const display = DISPLAY_KEYS.filter((k) => byKey[k] != null).map((k) => ({ key: k, ...byKey[k] }))

  if (isLoading) {
    return (
      <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 animate-pulse">
        <div className="h-5 w-32 skeleton-glass rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 skeleton-glass rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (display.length === 0) return null

  /* TZ-28: AI-блок компактно, общий индекс крупно, категории макс 12px между строками */
  const avgPct = display.length > 0 ? Math.round(display.reduce((s, d) => s + d.avgValue, 0) / display.length) : 0

  return (
    <div className={cn('section-ai-metrics rounded-[16px] border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-5')}>
      <h2 className="text-[16px] font-bold text-[var(--text-main)] mb-2">AI-оценка</h2>
      {avgPct > 0 && (
        <p className="text-[28px] font-bold text-[var(--accent)] tabular-nums mb-3">{avgPct}%</p>
      )}
      <div className="space-y-3">
        {display.map(({ key, avgValue }) => {
          const pct = Math.round(avgValue)
          const label = LABEL_OVERRIDE[key] ?? metricLabelByKey(key)
          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between text-[13px]">
                <span className="font-medium text-[var(--text-main)]">{label}</span>
                <span className="tabular-nums font-semibold text-[var(--text-main)]">{pct}%</span>
              </div>
              <div className="section-ai-metrics__bar h-1.5 rounded-full bg-[var(--bg-glass)] overflow-hidden">
                <div
                  className="section-ai-metrics__bar-fill h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent2) 100%)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
