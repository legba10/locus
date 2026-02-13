'use client'

import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

/**
 * ТЗ №2: Hero — мягкий контраст в light, типографика 700–800, subtitle opacity, CTA без пересвета.
 * Mobile: padding top 24–32px, CTA сразу под текстом.
 */
export function Hero() {
  return (
    <section
      className={cn(
        'hero-tz2-inner relative overflow-hidden',
        'px-4 pt-6 pb-8 md:pt-16 md:pb-10'
      )}
      aria-label="Главный экран"
    >
      <div className="market-container relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="hero-tz2__title text-[28px] xs:text-[30px] md:text-[44px] lg:text-[52px] mb-4 tracking-tight">
          Найдите жильё, которое идеально подходит вам
        </h1>
        <p className="hero-tz2__lead text-[15px] md:text-[18px] mb-6 md:mb-8">
          LOCUS анализирует рынок, проверяет объявления и подбирает варианты под ваш бюджет
        </p>
        <Link href="#search" className="hero-tz2__cta inline-flex items-center justify-center gap-2">
          Подобрать жильё
        </Link>
      </div>
    </section>
  )
}
