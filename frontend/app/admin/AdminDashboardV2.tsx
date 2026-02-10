'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'
import { apiFetch } from '@/shared/utils/apiFetch'

type AdminTab = 'dashboard' | 'users' | 'listings' | 'moderation' | 'settings'

interface AdminStats {
  users: { total: number }
  listings: { total: number; pending: number; published: number }
  bookings: { total: number }
}

interface AdminUser {
  id: string
  email: string | null
  status: string
  appRole: string
  createdAt: string
  _count: { listings: number; bookingsAsGuest: number }
}

interface AdminListing {
  id: string
  title: string
  status: string
  city: string
  basePrice: number
  createdAt: string
  owner: { id: string; email: string | null }
  photos: { url: string }[]
}

export function AdminDashboardV2() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Дашборд', icon: <DashboardIcon /> },
    { id: 'users' as AdminTab, label: 'Пользователи', icon: <UsersIcon /> },
    { id: 'listings' as AdminTab, label: 'Объявления', icon: <ListingsIcon /> },
    { id: 'moderation' as AdminTab, label: 'Модерация', icon: <ModerationIcon /> },
    { id: 'settings' as AdminTab, label: 'Настройки', icon: <SettingsIcon /> },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1C1F26] mb-1">Панель администратора</h1>
            <p className="text-[14px] text-[#6B7280]">Управление платформой LOCUS</p>
          </div>
          <Link href="/" className="px-4 py-2 rounded-[14px] bg-gray-100 text-[#1C1F26] text-[14px] font-medium hover:bg-gray-200">
            ← На главную
          </Link>
        </div>

        <div className={cn('bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6', 'border border-white/60', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)]')}>
          <div className="flex gap-2 border-b border-gray-200 pb-4 mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-[12px] text-[14px] font-medium transition-all whitespace-nowrap flex items-center gap-2',
                  activeTab === tab.id ? 'bg-violet-600 text-white' : 'text-[#6B7280] hover:bg-gray-100'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'listings' && <ListingsTab />}
            {activeTab === 'moderation' && <ModerationTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ДАШБОРД — Real API data
// ═══════════════════════════════════════════════════════════════
function DashboardTab() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await apiFetch<AdminStats>('/admin/stats')
        setStats(data)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="text-center py-8 text-[#6B7280]">Загрузка...</div>
  if (error) return <div className="text-center py-8 text-red-500">Ошибка: {error}</div>
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Пользователей" value={stats.users.total} color="blue" />
      <StatCard title="Всего объявлений" value={stats.listings.total} color="emerald" />
      <StatCard title="На модерации" value={stats.listings.pending} color="amber" />
      <StatCard title="Опубликовано" value={stats.listings.published} color="violet" />
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    violet: 'bg-violet-100 text-violet-600',
  }
  return (
    <div className={cn('bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-5', 'border border-white/60', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)]')}>
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colors[color])}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      </div>
      <p className="text-[28px] font-bold text-[#1C1F26]">{value.toLocaleString()}</p>
      <p className="text-[13px] text-[#6B7280] mt-1">{title}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ПОЛЬЗОВАТЕЛИ — Real API data with actions
// ═══════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiFetch<AdminUser[]>('/admin/users')
      setUsers(data || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  if (loading) return <div className="text-center py-8 text-[#6B7280]">Загрузка...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Пользователи ({users.length})</h2>
      {users.length === 0 ? (
        <p className="text-[#6B7280]">Нет пользователей</p>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-[14px] bg-gray-50 border border-gray-200">
              <div className="flex-1">
                <p className="font-medium text-[#1C1F26]">{(user as any).profile?.name || user.email || 'Пользователь'}</p>
                <p className="text-[13px] text-[#6B7280]">
                  {user.appRole === 'ADMIN' ? 'Администратор' : 'Пользователь'} • 
                  {user._count?.listings || 0} объявлений • 
                  {new Date(user.createdAt).toLocaleDateString('ru')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('px-3 py-1 rounded-lg text-[12px] font-medium', user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                  {user.status === 'ACTIVE' ? 'Активен' : 'Заблокирован'}
                </span>
                <span className={cn('px-3 py-1 rounded-lg text-[12px] font-medium', user.appRole === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700')}>
                  {user.appRole}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ОБЪЯВЛЕНИЯ — Real API data with actions
// ═══════════════════════════════════════════════════════════════
function ListingsTab() {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchListings = useCallback(async () => {
    try {
      const url = filter === 'all' ? '/admin/listings' : `/admin/listings?status=${filter}`
      const data = await apiFetch<AdminListing[]>(url)
      setListings(data || [])
    } catch (err) {
      console.error('Failed to fetch listings:', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'block') => {
    try {
      await apiFetch(`/admin/listings/${id}/${action}`, { method: 'POST' })
      fetchListings()
    } catch (err) {
      console.error(`Failed to ${action} listing:`, err)
    }
  }

  if (loading) return <div className="text-center py-8 text-[#6B7280]">Загрузка...</div>

  const statusLabels: Record<string, string> = {
    DRAFT: 'Черновик',
    AWAITING_PAYMENT: 'Ожидает оплаты',
    PENDING_REVIEW: 'На модерации',
    PUBLISHED: 'Опубликовано',
    REJECTED: 'Отклонено',
    BLOCKED: 'Заблокировано',
    ARCHIVED: 'В архиве',
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    AWAITING_PAYMENT: 'bg-amber-100 text-amber-700',
    PENDING_REVIEW: 'bg-blue-100 text-blue-700',
    PUBLISHED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    BLOCKED: 'bg-red-100 text-red-700',
    ARCHIVED: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#1C1F26]">Объявления ({listings.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-[14px] px-4 py-2 border border-gray-200 bg-white text-[14px]"
        >
          <option value="all">Все статусы</option>
          <option value="DRAFT">Черновики</option>
          <option value="PENDING_REVIEW">На модерации</option>
          <option value="PUBLISHED">Опубликовано</option>
          <option value="BLOCKED">Заблокировано</option>
        </select>
      </div>

      {listings.length === 0 ? (
        <p className="text-[#6B7280]">Нет объявлений</p>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="flex items-center justify-between p-4 rounded-[14px] bg-gray-50 border border-gray-200">
              <div className="flex-1">
                <p className="font-medium text-[#1C1F26]">{listing.title}</p>
                <p className="text-[13px] text-[#6B7280]">
                  {listing.city} • {formatPrice(listing.basePrice)} • {listing.owner?.profile?.name || 'Неизвестно'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('px-3 py-1 rounded-lg text-[12px] font-medium', statusColors[listing.status] || 'bg-gray-100 text-gray-700')}>
                  {statusLabels[listing.status] || listing.status}
                </span>
                <Link href={`/listings/${listing.id}`} className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-500">
                  Открыть
                </Link>
                {listing.status === 'PENDING_REVIEW' && (
                  <>
                    <button onClick={() => handleAction(listing.id, 'approve')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[12px] font-medium hover:bg-emerald-500">
                      Одобрить
                    </button>
                    <button onClick={() => handleAction(listing.id, 'reject')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-500">
                      Отклонить
                    </button>
                  </>
                )}
                {listing.status === 'PUBLISHED' && (
                  <button onClick={() => handleAction(listing.id, 'block')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-500">
                    Блок
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// МОДЕРАЦИЯ — Listings pending review
// ═══════════════════════════════════════════════════════════════
function ModerationTab() {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPending = useCallback(async () => {
    try {
      const data = await apiFetch<AdminListing[]>('/admin/listings/pending')
      setListings(data || [])
    } catch (err) {
      console.error('Failed to fetch pending listings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPending() }, [fetchPending])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiFetch(`/admin/listings/${id}/${action}`, { method: 'POST' })
      fetchPending()
    } catch (err) {
      console.error(`Failed to ${action} listing:`, err)
    }
  }

  if (loading) return <div className="text-center py-8 text-[#6B7280]">Загрузка...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Модерация ({listings.length})</h2>
      
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[#6B7280]">Нет объявлений на модерации</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="p-4 rounded-[14px] bg-amber-50 border border-amber-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-[#1C1F26] mb-1">{listing.title}</p>
                  <p className="text-[13px] text-[#6B7280] mb-2">
                    {listing.city} • {formatPrice(listing.basePrice)} • от {listing.owner?.profile?.name || 'Неизвестно'}
                  </p>
                  <p className="text-[12px] text-amber-700">
                    Создано: {new Date(listing.createdAt).toLocaleString('ru')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/listings/${listing.id}`} className="px-4 py-2 rounded-[12px] bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-500">
                    Просмотр
                  </Link>
                  <button onClick={() => handleAction(listing.id, 'approve')} className="px-4 py-2 rounded-[12px] bg-emerald-600 text-white text-[13px] font-medium hover:bg-emerald-500">
                    Одобрить
                  </button>
                  <button onClick={() => handleAction(listing.id, 'reject')} className="px-4 py-2 rounded-[12px] bg-red-600 text-white text-[13px] font-medium hover:bg-red-500">
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// НАСТРОЙКИ
// ═══════════════════════════════════════════════════════════════
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Настройки</h2>
      <div className={cn('bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6', 'border border-white/60')}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Авто-публикация объявлений</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-violet-600" />
              <span className="text-[14px] text-[#1C1F26]">Публиковать без модерации (не рекомендуется)</span>
            </label>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Уведомления о новых объявлениях</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-violet-600" />
              <span className="text-[14px] text-[#1C1F26]">Получать email о новых объявлениях на модерацию</span>
            </label>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Минимальная цена объявления (₽)</label>
            <input
              type="number"
              defaultValue={1000}
              className="w-full rounded-[14px] px-4 py-3 border border-gray-200 bg-white text-[14px]"
            />
          </div>
          <button className="px-5 py-2.5 rounded-[14px] bg-violet-600 text-white font-semibold text-[14px] hover:bg-violet-500">
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════
function DashboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function ListingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ModerationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
