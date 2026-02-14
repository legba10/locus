'use client'

import Link from 'next/link'
import { Typewriter } from '@/components/ui/Typewriter'

/**
 * ТЗ-2: финальный hero — единый текст, градиент, overlay, печатающая анимация, CTA.
 * Mobile: pt-20 px-4, text-center. Desktop: pt-24 pb-16.
 */
export function Hero() {
  return (
    <section
      className="relative pt-20 md:pt-24 pb-16 overflow-hidden"
      aria-label="Главный экран"
    >
      {/* Фон — градиент + glow */}
      <div className="absolute inset-0 bg-[#070b18]" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-transparent pointer-events-none"
        aria-hidden
      />

      {/* Контент */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 flex flex-col items-center text-center">
        <h1
          className="text-3xl md:text-5xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
        >
          Найдите жильё, которое подходит вам
        </h1>
        <div className="h-6 mt-2 text-lg drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          <Typewriter />
        </div>
        <p className="text-white/90 text-base md:text-lg mt-4 max-w-2xl leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          LOCUS анализирует рынок, проверяет объявления и подбирает варианты под ваш запрос.
        </p>
        <Link
          href="#search"
          className="mt-6 px-6 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium hover:opacity-90 transition inline-flex items-center justify-center"
        >
          Подобрать жильё
        </Link>
      </div>
    </section>
  )
}
