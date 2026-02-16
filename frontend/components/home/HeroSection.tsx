'use client'

import { HeroTyping } from './HeroTyping'

/**
 * ТЗ-3: Hero — приветствие, печатная строка, CTA.
 * ТЗ-1: всегда печатающийся текст — «Найдите жильё, [фраза] в [город]», город из selectedCity.
 */
export function HeroSection({
  onCtaClick,
  onOpenFilters,
  ctaLoading = false,
  selectedCity = '',
}: {
  onCtaClick?: () => void
  onOpenFilters?: () => void
  ctaLoading?: boolean
  selectedCity?: string
}) {
  return (
    <section
      className="hero hero-section-tz4 hero-section-tz11 hero-tz17 hero-tz3 hero-tz16 relative overflow-hidden bg-[var(--background)]"
      aria-label="Главный экран"
    >
      <div className="hero-container relative z-10 mx-auto max-w-[1200px] px-5 md:px-6 flex flex-col items-center text-center">
        <h1 className="hero-tz18-title hero-tz12-title hero-title-tz1 text-[var(--text-main)] tracking-tight">
          Найдите жильё, <HeroTyping city={selectedCity} />
        </h1>
        <p className="hero-tz18-subtitle leading-relaxed mt-1">
          LOCUS анализирует рынок, проверяет объявления и подбирает варианты под ваш запрос
        </p>
        <button
          type="button"
          onClick={onCtaClick}
          disabled={ctaLoading}
          className="hero-tz18-cta hero-cta-tz11 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-90 disabled:pointer-events-none mt-5"
        >
          {ctaLoading ? (
            <>
              <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" aria-hidden />
              Ищем варианты…
            </>
          ) : (
            'Подобрать жильё'
          )}
        </button>
      </div>
    </section>
  )
}
