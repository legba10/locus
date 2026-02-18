'use client'

import { cn } from '@/shared/utils/cn'
import type { ListingPlan } from '@/shared/contracts/api'

const LABEL: Record<ListingPlan, string> = {
  free: 'Базовый',
  pro: 'PRO',
  top: 'TOP',
}

const STYLES: Record<ListingPlan, string> = {
  free: 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-main)]',
  pro: 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/40',
  top: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40',
}

export function ListingPlanBadge({
  plan,
  className,
}: {
  plan: ListingPlan
  className?: string
}) {
  if (plan === 'free') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
          STYLES[plan],
          className
        )}
      >
        {LABEL[plan]}
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide',
        STYLES[plan],
        className
      )}
    >
      {LABEL[plan]}
    </span>
  )
}
