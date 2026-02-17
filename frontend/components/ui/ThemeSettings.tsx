'use client'

import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/shared/utils/cn'

/**
 * ТЗ-3: блок темы в настройках профиля — «Внешний вид» / «Тема: светлая / темная».
 */
export function ThemeSettings() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <section className="profile-header-tz9 rounded-[18px] p-5 sm:p-6">
      <h2 className="text-[18px] font-semibold text-[var(--color-text)] mb-4">Внешний вид</h2>
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-muted)] mb-2">Тема</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'rounded-[14px] px-4 py-3 text-[14px] font-medium transition-colors',
              !isDark
                ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
                : 'border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--bg-glass)]'
            )}
          >
            Светлая
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'rounded-[14px] px-4 py-3 text-[14px] font-medium transition-colors',
              isDark
                ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
                : 'border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--bg-glass)]'
            )}
          >
            Тёмная
          </button>
        </div>
      </div>
    </section>
  )
}
