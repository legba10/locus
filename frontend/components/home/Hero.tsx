'use client'

import { HeroSection } from './HeroSection'

/**
 * ТЗ-3: Hero — приветствие. CTA скроллит к поиску или ведёт к результатам при готовых параметрах.
 * ТЗ-9: при выбранном городе показываем его в hero.
 */
export function Hero({
  onCtaClick,
  onOpenFilters,
  ctaLoading,
  selectedCity = '',
}: {
  onCtaClick?: () => void
  onOpenFilters?: () => void
  ctaLoading?: boolean
  selectedCity?: string
}) {
  return <HeroSection onCtaClick={onCtaClick} onOpenFilters={onOpenFilters} ctaLoading={ctaLoading} selectedCity={selectedCity} />
}
