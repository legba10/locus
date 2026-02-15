'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

const STATS = [
  { value: '15K+', label: 'Объявлений' },
  { value: '8K+', label: 'Пользователей' },
  { value: '155+', label: 'Городов' },
  { value: '98%', label: 'Довольных' },
] as const

/**
 * ТЗ-4: блок статистики.
 * ТЗ-17: после блока «Актуальные предложения». Desktop: grid 4, gap 60px, padding-top 80px; mobile: 2x2.
 */
export function StatsBlock() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="stats-block-tz18-wrap stats-block-tz17-wrap px-4" aria-label="LOCUS в цифрах">
      <div
        className={cn(
          'stats-block-tz4 stats-block-tz17 stats-block-tz18 mx-auto max-w-6xl rounded-2xl py-4 px-5 md:py-5 md:px-6',
          'grid grid-cols-2 md:grid-cols-4',
          'transition-all duration-500 ease-out',
          mounted ? 'stats-block-tz3--visible' : 'stats-block-tz3--initial'
        )}
      >
        {STATS.map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="stats-block-tz18__value stats-block-tz4-value text-[var(--text-main)]">
              {value}
            </span>
            <span className="stats-block-tz18__label stats-block-tz4-label text-[var(--text-secondary)]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
