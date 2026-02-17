'use client'

import { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '@/providers/ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import IconButton from './IconButton'

/**
 * ТЗ №2: переключатель темы в header — IconButton 44×44, иконка 20–22px.
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, toggle } = useContext(ThemeContext)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'
  const Icon = isDark ? Sun : Moon

  return (
    <IconButton
      onClick={toggle}
      ariaLabel={isDark ? 'Светлая тема' : 'Тёмная тема'}
      className="layout-header__theme-toggle"
    >
      <Icon className="w-5 h-5" aria-hidden />
    </IconButton>
  )
}
