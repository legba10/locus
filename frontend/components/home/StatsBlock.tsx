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
 * ТЗ-1: блок статистики доверия — после «Актуальные предложения».
 * Вторичный блок: не перетягивает внимание. mt-8 mb-8, 2 колонки на мобиле.
 */
export function StatsBlock() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="stats-block-tz1-wrap px-4 mt-8 mb-8" aria-label="LOCUS в цифрах">
      <div
        className={cn(
          'stats-block-tz1 mx-auto max-w-6xl rounded-[20px] p-5 md:p-6',
          'grid grid-cols-2 md:grid-cols-4 gap-6',
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
