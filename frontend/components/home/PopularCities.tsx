'use client'

import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { DS } from '@/shared/lib/design-system'

const CITIES = [
  { name: 'Москва', href: '/listings?city=Москва' },
  { name: 'Санкт-Петербург', href: '/listings?city=Санкт-Петербург' },
  { name: 'Сочи', href: '/listings?city=Сочи' },
  { name: 'Казань', href: '/listings?city=Казань' },
]

/**
 * ТЗ-MAIN-REDESIGN: Популярные города — grid 2/4, карточки rounded-xl bg-[var(--card)] hover:scale-105.
 */
export function PopularCities() {
  return (
    <section className="py-6" aria-label="Популярные города">
      <h2 className="text-[18px] md:text-[20px] font-semibold text-[var(--text)] mb-4">
        Популярные города
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CITIES.map(({ name, href }) => (
          <Link
            key={name}
            href={href}
            className={cn(
              'rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 text-center',
              DS.transition,
              'hover:scale-105 hover:shadow-lg'
            )}
          >
            <span className="text-[15px] font-medium text-[var(--text)]">{name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
