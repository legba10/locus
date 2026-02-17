'use client'

import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/shared/utils/cn'

/**
 * ТЗ-3: переключатель темы в подвале — «Тема сайта» [ светлая ] [ темная ].
 * Использует текущий theme store (ThemeContext / localStorage).
 */
export function ThemeSwitcherFooter() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider">
        Тема сайта
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={cn(
            'rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
            !isDark
              ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
              : 'border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--bg-glass)]'
          )}
        >
          Светлая
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={cn(
            'rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
            isDark
              ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
              : 'border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--bg-glass)]'
          )}
        >
          Тёмная
        </button>
      </div>
    </div>
  )
}
