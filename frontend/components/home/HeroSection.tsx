'use client'

import Link from 'next/link'
import { HeroTyping } from './HeroTyping'

/**
 * ТЗ-4: HERO — градиент light/dark, glow, читаемая типографика, без серых обводок.
 * Контейнер max-w-6xl, pt-16 pb-20. Заголовок и описание по ТЗ-4.
 */
export function HeroSection() {
  return (
    <section
      className="hero-section-tz4 relative overflow-hidden pt-24 pb-16 bg-[var(--background)]"
      aria-label="Главный экран"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-4 flex flex-col items-center text-center">
        <h1 className="hero-section-tz4-title text-3xl md:text-5xl font-semibold tracking-tight">
          Найдите жильё, которое подходит вам
        </h1>
        <div className="min-h-[1.75em] flex items-center justify-center text-lg md:text-xl mt-2">
          <HeroTyping />
        </div>
        <p className="hero-section-tz4-desc text-base mt-4 max-w-md leading-relaxed text-[var(--text-main)]">
          LOCUS анализирует рынок, проверяет объявления и подбирает варианты под ваш запрос
        </p>
        <Link
          href="#search"
          className="mt-6 px-6 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition inline-flex items-center justify-center hover:scale-[1.03] active:scale-[0.99]"
        >
          Подобрать жильё
        </Link>
      </div>
    </section>
  )
}
