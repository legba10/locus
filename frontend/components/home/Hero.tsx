'use client'

import { HeroSection } from './HeroSection'

/**
 * ТЗ-1: Hero главной — обёртка над HeroSection (стабильный текст, печать, визуал).
 * Header, фильтры, auth не трогаем.
 */
export function Hero() {
  return <HeroSection />
}
