'use client'

import { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '@/providers/ThemeProvider'
import { Moon, Sun } from 'lucide-react'

/**
 * ТЗ-2: один переключатель темы — только в header, w-9 h-9, иконка 24px.
 * mounted guard убирает прыжок при гидрации.
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, toggle } = useContext(ThemeContext)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'
  const Icon = isDark ? Sun : Moon

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      className="layout-header__theme-toggle theme-toggle-tz9 flex items-center justify-center w-11 h-11 rounded-[12px] shrink-0 text-[var(--text)] border border-[var(--border)] bg-[var(--card-bg)] cursor-pointer transition-transform duration-200 hover:scale-105"
    >
      <Icon className="w-5 h-5" aria-hidden />
    </button>
  )
}
