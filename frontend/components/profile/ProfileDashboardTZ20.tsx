'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/domains/auth'
import { Star } from 'lucide-react'

/** ТЗ-15: Экран профиля — аватар, имя, город, рейтинг, кнопка «Редактировать профиль». Навигация — в сайдбаре. */
export function ProfileDashboardTZ20() {
  const { user } = useAuthStore()

  const displayName = user?.full_name ?? user?.username ?? 'Пользователь'
  const displayAvatar = user?.avatar_url ?? null
  const rating = (user as any)?.rating_avg ?? (user as any)?.rating ?? null
  const city = (user as any)?.city ?? (user as any)?.location ?? null

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--bg-input)] flex-shrink-0 flex items-center justify-center">
            {displayAvatar ? (
              <Image src={displayAvatar} alt="" fill className="object-cover" sizes="80px" />
            ) : (
              <span className="text-2xl font-semibold text-[var(--text-muted)]">{displayName[0]?.toUpperCase() || 'П'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold text-[var(--text-primary)]">{displayName}</h1>
            {city && (
              <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">{city}</p>
            )}
            {rating != null && (
              <p className="flex items-center gap-1.5 mt-1 text-[14px] text-[var(--text-secondary)]">
                <Star className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)]" aria-hidden />
                {Number(rating).toFixed(1)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-[var(--border-main)]">
          <Link
            href="/profile/settings"
            className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] hover:opacity-95 transition-opacity"
          >
            Редактировать профиль
          </Link>
        </div>
      </section>
    </div>
  )
}
