'use client'

import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { BarChart3, Star, MessageSquare, TrendingUp, MousePointer } from 'lucide-react'

/** ТЗ-15: Аналитика для арендодателя — AI-метрики: рейтинг, отзывы, загрузка, конверсия. */
export default function ProfileAnalyticsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const isLandlord = (user as any)?.role === 'landlord' || (user as any)?.listingUsed > 0

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-[var(--accent)] text-[14px]">Войти в аккаунт</Link>
        </div>
      </div>
    )
  }

  if (!isLandlord) {
    return (
      <div className="space-y-6">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Аналитика</h1>
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-6 text-center">
          <BarChart3 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-[var(--text-secondary)] mb-4">Аналитика доступна для арендодателей после размещения объявлений.</p>
          <Link href="/create-listing" className="text-[var(--accent)] font-medium hover:underline">Разместить объявление</Link>
        </div>
      </div>
    )
  }

  const rating = (user as any)?.rating_avg ?? (user as any)?.rating ?? null

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Аналитика</h1>
      <p className="text-[14px] text-[var(--text-secondary)]">AI-метрики по вашим объявлениям.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--accent)]/15 flex items-center justify-center">
              <Star className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.8} />
            </div>
            <span className="text-[13px] font-medium text-[var(--text-muted)]">Рейтинг</span>
          </div>
          <p className="text-[24px] font-bold text-[var(--text-primary)]">{rating != null ? Number(rating).toFixed(1) : '—'}</p>
        </div>
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--accent)]/15 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.8} />
            </div>
            <span className="text-[13px] font-medium text-[var(--text-muted)]">Отзывы</span>
          </div>
          <p className="text-[24px] font-bold text-[var(--text-primary)]">—</p>
          <p className="text-[12px] text-[var(--text-muted)]">после накопления данных</p>
        </div>
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--accent)]/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.8} />
            </div>
            <span className="text-[13px] font-medium text-[var(--text-muted)]">Загрузка</span>
          </div>
          <p className="text-[24px] font-bold text-[var(--text-primary)]">—</p>
        </div>
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--accent)]/15 flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.8} />
            </div>
            <span className="text-[13px] font-medium text-[var(--text-muted)]">Конверсия</span>
          </div>
          <p className="text-[24px] font-bold text-[var(--text-primary)]">—</p>
        </div>
      </div>

      <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-6">
        <p className="text-[14px] text-[var(--text-muted)]">Детальные графики и рекомендации появятся после накопления данных по просмотрам и бронированиям.</p>
      </div>
    </div>
  )
}
