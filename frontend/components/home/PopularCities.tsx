'use client'

import { useRouter } from 'next/navigation'
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
 * ТЗ-2: клик по городу задаёт город и ведёт в список. Опционально shake при подсказке «Сначала выберите город».
 */
export function PopularCities({ shake = false }: { shake?: boolean }) {
  const router = useRouter()
  const setCity = useFilterStore((s) => s.setCity)

  const handleCity = (name: string) => {
    setCity(name)
    const params = new URLSearchParams()
    params.set('city', name)
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <section className={cn('py-6', shake && 'search-flow-shake')} aria-label="Популярные города">
      <h2 className="text-[18px] md:text-[20px] font-semibold text-[var(--text)] mb-4">
        Популярные города
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CITIES.map(({ name }) => (
          <button
            key={name}
            type="button"
            onClick={() => handleCity(name)}
            className={cn(
              'rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 text-center',
              DS.transition,
              'hover:scale-105 hover:shadow-lg text-[15px] font-medium text-[var(--text)]'
            )}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  )
}
