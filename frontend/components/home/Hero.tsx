'use client'

import { HeroSection } from './HeroSection'

/**
 * ТЗ-3: Hero — приветствие. CTA скроллит к поиску или ведёт к результатам при готовых параметрах.
 * AI-блок вынесен на главную отдельной секцией под Hero.
 */
export function Hero({
  onCtaClick,
  onOpenFilters,
  ctaLoading,
}: {
  onCtaClick?: () => void
  onOpenFilters?: () => void
  ctaLoading?: boolean
}) {
  return <HeroSection onCtaClick={onCtaClick} onOpenFilters={onOpenFilters} ctaLoading={ctaLoading} />
}
