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
 * ТЗ-4: блок статистики доверия — после «Рекомендации AI».
 * Вторичный: меньше высота/padding, фон мягче, цифры крупные но спокойные. mt-12 mb-12.
 */
export function StatsBlock() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="stats-block-tz4-wrap px-4" aria-label="LOCUS в цифрах">
      <div
        className={cn(
          'stats-block-tz4 mx-auto max-w-6xl rounded-2xl py-4 px-5 md:py-5 md:px-6',
          'grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6',
          'transition-all duration-500 ease-out',
          mounted ? 'stats-block-tz3--visible' : 'stats-block-tz3--initial'
        )}
      >
        {STATS.map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="stats-block-tz4-value text-xl md:text-2xl font-medium">
              {value}
            </span>
            <span className="stats-block-tz4-label text-xs md:text-sm opacity-70">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
