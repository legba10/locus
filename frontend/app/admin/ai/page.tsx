'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { apiFetch } from '@/shared/utils/apiFetch'
import { formatPrice } from '@/core/i18n/ru'

interface AdminStats {
  users: { total: number }
  listings: { total: number; pending: number; published: number }
  bookings: { total: number; confirmed?: number; canceled?: number }
  economy?: {
    gmv: number
    revenue: number
    totalViews: number
    conversion: number
  }
}

interface AdminListing {
  id: string
  title: string
  city: string
  status: string
  viewsCount?: number
  owner?: { id: string; email: string | null }
}

export default function AdminAiPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, listingsData] = await Promise.all([
          apiFetch<AdminStats>('/admin/stats').catch(() => null),
          apiFetch<AdminListing[]>('/admin/listings?limit=100').catch(() => []),
        ])
        setStats(statsData ?? null)
        setListings(Array.isArray(listingsData) ? listingsData : [])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const popularListings = [...listings]
    .filter((l) => (l as any).viewsCount != null)
    .sort((a, b) => ((b as any).viewsCount ?? 0) - ((a as any).viewsCount ?? 0))
    .slice(0, 5)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-primary) 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--text-primary)] mb-1">Помощник</h1>
            <p className="text-[14px] text-[var(--text-secondary)]">Ответы на основе реальных данных платформы</p>
          </div>
          <Link href="/admin" className="px-4 py-2 rounded-[14px] bg-gray-100 text-[var(--text-primary)] text-[14px] font-medium hover:bg-gray-200">
            ← В админку
          </Link>
        </div>

        {loading ? (
          <p className="text-[var(--text-secondary)]">Загрузка...</p>
        ) : (
          <div className="space-y-6">
            <div className={cn('bg-white rounded-[18px] p-6', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Сколько бронирований?</h2>
              <p className="text-[15px] text-[var(--text-secondary)]">
                Всего бронирований: <strong className="text-[var(--text-primary)]">{stats?.bookings?.total ?? 0}</strong>.
                {stats?.bookings?.confirmed != null && (
                  <> Подтверждённых: <strong className="text-[var(--text-primary)]">{stats.bookings.confirmed}</strong>.</>
                )}
              </p>
            </div>

            <div className={cn('bg-white rounded-[18px] p-6', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Сколько денег?</h2>
              <p className="text-[15px] text-[var(--text-secondary)]">
                Выручка платформы: <strong className="text-[var(--text-primary)]">{stats?.economy?.revenue != null ? formatPrice(stats.economy.revenue) : '—'}</strong>.
                GMV (объём бронирований): <strong className="text-[var(--text-primary)]">{stats?.economy?.gmv != null ? formatPrice(stats.economy.gmv) : '—'}</strong>.
              </p>
            </div>

            <div className={cn('bg-white rounded-[18px] p-6', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80')}>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">Какие объявления популярны?</h2>
              {popularListings.length === 0 ? (
                <p className="text-[15px] text-[var(--text-secondary)]">Нет данных о просмотрах или объявлениях.</p>
              ) : (
                <ul className="space-y-2">
                  {popularListings.map((l) => (
                    <li key={l.id} className="flex items-center justify-between text-[14px]">
                      <Link href={`/listing/${l.id}`} className="font-medium text-violet-600 hover:text-violet-700 line-clamp-1">
                        {l.title}
                      </Link>
                      <span className="text-[var(--text-secondary)] shrink-0 ml-2">{(l as any).viewsCount ?? 0} просмотров</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

