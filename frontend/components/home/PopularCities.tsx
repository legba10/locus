'use client'

import { cn } from '@/shared/utils/cn'
import { DS } from '@/shared/lib/design-system'
import { useFilterStore } from '@/core/filters'

const CITIES = [
  { name: 'Москва' },
  { name: 'Санкт-Петербург' },
  { name: 'Сочи' },
  { name: 'Казань' },
]

/**
 * ТЗ-11: клик по городу = установка города в поиске (без перехода).
 */
export function PopularCities({ shake = false }: { shake?: boolean }) {
  const setCity = useFilterStore((s) => s.setCity)

  const handleCity = (name: string) => {
    setCity(name)
  }

  return (
    <section className={cn('py-6', shake && 'search-flow-shake')} aria-label="Популярные города">
      <h2 className="text-[18px] md:text-[20px] font-semibold text-[var(--text)] mb-4">
        Популярные города
      </h2>
      <div className="popular-cities-tz18">
        {CITIES.map(({ name }) => (
          <button
            key={name}
            type="button"
            onClick={() => handleCity(name)}
            className={cn(
              'popular-cities-tz18__card bg-[var(--card)] border border-[var(--border)]',
              DS.transition,
              'font-medium text-[var(--text)]'
            )}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  )
}
