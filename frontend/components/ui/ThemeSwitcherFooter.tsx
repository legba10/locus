'use client'

import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/shared/utils/cn'

/**
 * ТЗ-1: единый переключатель темы в подвале — один toggle (iOS/Notion style).
 * Заменяет две кнопки «Светлая / Тёмная». Синхронизация через ThemeContext/localStorage.
 */
export function ThemeSwitcherFooter() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-flex-start lg:justify-start">
      <span className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider">
        Тема сайта
      </span>
      <button
        type="button"
        role="switch"
        aria-label="Сменить тему"
        aria-checked={isDark}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'footer-theme-switch shrink-0',
          'h-8 w-[60px] rounded-[999px]',
          'border border-[var(--border)] bg-[var(--bg-input)]',
          'shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
          'transition-[background-color,border-color] duration-[0.25s] ease-out',
          'hover:border-[var(--accent)]/40 hover:bg-[var(--bg-glass)]',
          'active:scale-[0.98]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)]'
        )}
      >
        <span
          className={cn(
            'footer-theme-switch__thumb block h-[26px] w-[26px] rounded-[999px]',
            'bg-[var(--accent)] shadow-md',
            'transition-transform duration-[0.25s] ease-out',
            isDark ? 'translate-x-[28px]' : 'translate-x-[3px]'
          )}
          style={{ marginTop: 3 }}
        />
      </button>
    </div>
  )
}
