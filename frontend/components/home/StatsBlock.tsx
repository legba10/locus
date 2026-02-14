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
 * ТЗ-3: блок статистики — премиальная карточка, сетка 2×2 / 4 колонки,
 * адаптация light/dark, микро-анимация появления.
 */
export function StatsBlock() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="px-4 mt-6" aria-label="LOCUS в цифрах">
      <div
        className={cn(
          'stats-block-tz6 mx-auto max-w-6xl rounded-2xl shadow-sm p-6 md:p-12 lg:p-16',
          'grid grid-cols-2 md:grid-cols-3 gap-6',
          'transition-all duration-500 ease-out',
          mounted ? 'stats-block-tz3--visible' : 'stats-block-tz3--initial'
        )}
      >
        {STATS.map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="stats-block-tz3-value text-2xl md:text-3xl font-semibold">
              {value}
            </span>
            <span className="stats-block-tz3-label text-sm opacity-60">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
