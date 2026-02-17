'use client'

import { HeroTyping } from './HeroTyping'

/**
 * ТЗ-3: Hero — приветствие, печатная строка, CTA.
 * Жёсткое ТЗ: без img/Image/background-image/logo в Hero; фиксированная высота блока заголовка.
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
        <div className="hero-title-wrapper w-full flex flex-col items-center justify-center">
          <h1 className="hero-tz18-title hero-tz12-title hero-title-tz1 text-[var(--text-main)] tracking-tight">
            <HeroTyping city={selectedCity} />
          </h1>
        </div>
        <p className="hero-tz18-subtitle leading-relaxed mt-1">
          LOCUS анализирует рынок, проверяет объявления и подбирает варианты под ваш запрос
        </p>
        <button
          type="button"
          onClick={onCtaClick}
          disabled={ctaLoading}
          className="hero-tz18-cta hero-cta-tz11 bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-90 disabled:pointer-events-none mt-5"
        >
          {ctaLoading ? (
            <>
              <span className="inline-block w-5 h-5 border-2 border-[var(--text-on-accent)]/40 border-t-[var(--text-on-accent)] rounded-full animate-spin shrink-0" aria-hidden />
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
