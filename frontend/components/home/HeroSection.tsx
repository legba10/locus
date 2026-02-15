'use client'

import { HeroTyping } from './HeroTyping'

/**
 * ТЗ-17 + ТЗ-18 + ТЗ-20: HERO — заголовок, печатная строка, подзаголовок, CTA (с loading), AI-панель.
 */
export function HeroSection({
  onCtaClick,
  onOpenFilters,
  ctaLoading = false,
}: {
  onCtaClick?: () => void
  onOpenFilters?: () => void
  ctaLoading?: boolean
}) {
  return (
    <section
      className="hero-section-tz4 hero-section-tz11 hero-tz17 relative overflow-hidden pt-[120px] pb-20 bg-[var(--background)]"
      aria-label="Главный экран"
    >
      <div className="relative z-10 mx-auto max-w-[1100px] px-4 md:px-6 flex flex-col items-center text-center">
        <h1 className="hero-tz18-title text-[var(--text-main)] tracking-tight">
          Найдите жильё, которое подходит вам
        </h1>
        <div className="hero-tz18-typing min-h-[1.5em] flex items-center justify-center">
          <HeroTyping />
        </div>
        <p className="hero-tz18-subtitle leading-relaxed">
          LOCUS анализирует рынок, проверяет объявления и подбирает варианты под ваш запрос
        </p>
        <button
          type="button"
          onClick={onCtaClick}
          disabled={ctaLoading}
          className="hero-tz18-cta hero-cta-tz11 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-90 disabled:pointer-events-none"
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
        {/* ТЗ-18: AI-панель — высота 80px, активный вид, клик открывает фильтры */}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="hero-ai-panel-tz18 hero-ai-panel-tz17 mt-8 w-full max-w-[900px] flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left cursor-pointer"
            aria-label="Умный подбор AI — открыть фильтры"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[15px] md:text-[16px] font-medium text-[var(--text-main)]">Умный подбор</p>
                  <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] mt-0.5">AI подберёт варианты под ваш бюджет, район и параметры.</p>
                </div>
              </div>
              <span className="text-[14px] md:text-[15px] font-semibold text-[var(--accent)] shrink-0">Открыть подбор →</span>
            </div>
          </button>
        )}
      </div>
    </section>
  )
}
