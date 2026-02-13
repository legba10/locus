'use client'

import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { DS } from '@/shared/lib/design-system'

/**
 * ТЗ-MAIN-REDESIGN: Hero уровня продукта.
 * Заголовок, подзаголовок, CTA. Фон: dark gradient / light white.
 */
export function Hero() {
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        'bg-white',
        'dark:bg-gradient-to-b dark:from-[#0B0F1A] dark:to-[#020617]',
        '[data-theme="dark"]:bg-gradient-to-b [data-theme="dark"]:from-[#0B0F1A] [data-theme="dark"]:to-[#020617]',
        'px-4 pt-12 pb-16 md:pt-16 md:pb-20'
      )}
      aria-label="Главный экран"
    >
      <div className="market-container relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-[28px] md:text-[44px] font-bold text-[var(--text)] mb-4 leading-tight tracking-tight">
          Найдите жильё, которое идеально подходит вам
        </h1>
        <p className="text-[16px] md:text-[18px] text-[var(--sub)] mb-8 leading-relaxed max-w-2xl mx-auto">
          LOCUS анализирует рынок, проверяет объявления и подбирает варианты под ваш бюджет
        </p>
        <Link
          href="#search"
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-[16px] font-semibold',
            'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
            DS.transition,
            'hover:opacity-95 active:scale-[0.98] shadow-lg'
          )}
        >
          Подобрать жильё
        </Link>
      </div>
    </section>
  )
}
