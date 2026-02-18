'use client'

import { useProfileV2 } from '@/config/uiFlags'
import { ThemeSwitcherFooter } from './ThemeSwitcherFooter'

/** ТЗ 3: переключатель темы только в Profile → Настройки. В футере скрыт при useProfileV2. */
export function ThemeSwitcherFooterGate() {
  if (useProfileV2) return null
  return <ThemeSwitcherFooter />
}
