'use client'

import { HeroSection } from './HeroSection'

/**
 * ТЗ-17 + ТЗ-20: Hero — заголовок, печатная строка, подзаголовок, CTA (с loading), AI-панель.
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
