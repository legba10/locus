'use client'

import { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '@/providers/ThemeProvider'
import { Moon, Sun } from 'lucide-react'

/**
 * ТЗ-1: единая кнопка темы — w-10 h-10, без margin/absolute.
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
      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition shrink-0"
    >
      <Icon className="w-5 h-5" aria-hidden />
    </button>
  )
}
