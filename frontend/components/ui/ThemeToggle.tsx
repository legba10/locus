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
      className="w-10 h-6 flex items-center justify-center rounded-full hover:opacity-90 transition shrink-0 text-[var(--text-main)]"
    >
      <Icon className="w-4 h-4" aria-hidden />
    </button>
  )
}
