'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'
import { apiFetch } from '@/shared/utils/apiFetch'

type AdminTab = 'dashboard' | 'users' | 'listings' | 'moderation' | 'bookings' | 'push' | 'chats' | 'settings'

interface AdminStats {
  users: { total: number }
  listings: { total: number; pending: number; published: number }
  bookings: { total: number; confirmed?: number; canceled?: number }
  economy?: {
    gmv: number
    revenue: number
    commission?: number
    averageOrder?: number
    totalViews: number
    conversion: number
    messagesCount: number
  }
}

interface ChartPoint {
  date: string
  value?: number
  count?: number
}

interface AdminCharts {
  revenue: ChartPoint[]
  bookings: { date: string; count: number }[]
  newUsers: { date: string; count: number }[]
}

interface AdminUser {
  id: string
  email: string | null
  status: string
  appRole: string
  createdAt: string
  profile?: { name?: string | null } | null
  _count: { listings: number; bookingsAsGuest: number }
}

interface AdminListing {
  id: string
  title: string
  description?: string
  status: string
  city: string
  basePrice: number
  createdAt: string
  owner: { id: string; email: string | null; profile?: { name?: string | null } | null }
  photos: { url: string }[]
  amenities?: unknown[]
}

export function AdminDashboardV2() {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams?.get('tab') as AdminTab | null
  const tabIds: AdminTab[] = ['dashboard', 'users', 'listings', 'moderation', 'bookings', 'push', 'chats', 'settings']
  const [activeTab, setActiveTab] = useState<AdminTab>(tabFromUrl && tabIds.includes(tabFromUrl) ? tabFromUrl : 'dashboard')

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab && tabIds.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Дашборд', icon: <DashboardIcon /> },
    { id: 'users' as AdminTab, label: 'Пользователи', icon: <UsersIcon /> },
    { id: 'listings' as AdminTab, label: 'Объявления', icon: <ListingsIcon /> },
    { id: 'moderation' as AdminTab, label: 'Модерация', icon: <ModerationIcon /> },
    { id: 'bookings' as AdminTab, label: 'Брони', icon: <BookingsIcon /> },
    { id: 'push' as AdminTab, label: 'Уведомления', icon: <PushIcon /> },
    { id: 'chats' as AdminTab, label: 'Чаты', icon: <ChatsIcon /> },
    { id: 'settings' as AdminTab, label: 'Настройки', icon: <SettingsIcon /> },
  ]

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1C1F26] mb-1">Панель администратора</h1>
            <p className="text-[14px] text-[#6B7280]">Управление платформой LOCUS</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/ai" className="px-4 py-2 rounded-[14px] bg-violet-100 text-violet-700 text-[14px] font-medium hover:bg-violet-200">
              AI
            </Link>
            <Link href="/" className="px-4 py-2 rounded-[14px] bg-gray-100 text-[#1C1F26] text-[14px] font-medium hover:bg-gray-200">
              ← На главную
            </Link>
          </div>
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
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'push' && <PushTab />}
            {activeTab === 'chats' && <ChatsTab />}
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
  const [charts, setCharts] = useState<AdminCharts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, chartsData] = await Promise.all([
          apiFetch<AdminStats>('/admin/stats'),
          apiFetch<AdminCharts>('/admin/stats/charts?days=30').catch(() => null),
        ])
        setStats(statsData)
        setCharts(chartsData)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-center py-8 text-[#6B7280]">Загрузка...</div>
  if (error) return <div className="text-center py-8 text-red-500">Ошибка: {error}</div>
  if (!stats) return null

  const econ = stats.economy

  return (
    <div className="space-y-6">
      <div className="admin-grid-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard title="Пользователей" value={stats.users.total} color="blue" />
        <StatCard title="Объявления" value={stats.listings.total} color="emerald" />
        <StatCard title="На модерации" value={stats.listings.pending} color="amber" />
        <StatCard title="Опубликовано" value={stats.listings.published} color="violet" />
        <StatCard title="Брони" value={stats.bookings.total} color="blue" />
        <StatCard title="Отмены" value={stats.bookings.canceled ?? 0} color="red" />
        {econ && (
          <>
            <StatCard title="Выручка" value={econ.revenue} color="emerald" format="price" />
            <StatCard title="Комиссия" value={econ.commission ?? econ.revenue} color="emerald" format="price" />
            <StatCard title="GMV" value={econ.gmv} color="violet" format="price" />
            <StatCard title="Средний чек" value={econ.averageOrder ?? 0} color="violet" format="price" />
            <StatCard title="Просмотры" value={econ.totalViews} color="blue" />
            <StatCard title="Конверсия %" value={econ.conversion} color="emerald" format="percent" />
            <StatCard title="Сообщения" value={econ.messagesCount} color="violet" />
          </>
        )}
      </div>

      {charts && (charts.revenue.length > 0 || charts.bookings.length > 0 || charts.newUsers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {charts.revenue.length > 0 && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-4">
              <h3 className="text-[14px] font-semibold text-[#1C1F26] mb-3">Доход по дням (30 дн.)</h3>
              <SimpleBarChart data={charts.revenue.map((r) => r.value ?? 0)} max={Math.max(...charts.revenue.map((r) => r.value ?? 0), 1)} color="bg-emerald-500" />
            </div>
          )}
          {charts.bookings.length > 0 && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-4">
              <h3 className="text-[14px] font-semibold text-[#1C1F26] mb-3">Брони по дням (30 дн.)</h3>
              <SimpleBarChart data={charts.bookings.map((b) => b.count)} max={Math.max(...charts.bookings.map((b) => b.count), 1)} color="bg-violet-500" />
            </div>
          )}
          {charts.newUsers.length > 0 && (
            <div className="rounded-[18px] border border-gray-200 bg-white p-4">
              <h3 className="text-[14px] font-semibold text-[#1C1F26] mb-3">Новые пользователи (30 дн.)</h3>
              <SimpleBarChart data={charts.newUsers.map((u) => u.count)} max={Math.max(...charts.newUsers.map((u) => u.count), 1)} color="bg-blue-500" />
            </div>
          )}
        </div>
      )}

      {econ && (
        <div className={cn('rounded-[18px] border border-gray-200 overflow-hidden', 'bg-white/[0.75]')}>
          <h3 className="text-[16px] font-semibold text-[#1C1F26] p-4 border-b border-gray-100">Юнит-экономика</h3>
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 font-medium text-[#6B7280]">Метрика</th>
                <th className="p-3 font-medium text-[#6B7280]">Значение</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100"><td className="p-3">Total revenue</td><td className="p-3 font-medium">{formatPrice(econ.revenue)}</td></tr>
              <tr className="border-t border-gray-100"><td className="p-3">Комиссия</td><td className="p-3 font-medium">{formatPrice(econ.commission ?? econ.revenue)}</td></tr>
              <tr className="border-t border-gray-100"><td className="p-3">Средний чек</td><td className="p-3 font-medium">{econ.averageOrder ? formatPrice(econ.averageOrder) : '—'}</td></tr>
              <tr className="border-t border-gray-100"><td className="p-3">Брони (подтверждённые)</td><td className="p-3">{stats.bookings.confirmed ?? 0}</td></tr>
              <tr className="border-t border-gray-100"><td className="p-3">Конверсия</td><td className="p-3">{econ.totalViews ? (econ.conversion).toFixed(2) + '%' : '—'}</td></tr>
              <tr className="border-t border-gray-100"><td className="p-3">GMV</td><td className="p-3 font-medium">{formatPrice(econ.gmv)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SimpleBarChart({ data, max, color }: { data: number[]; max: number; color: string }) {
  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.slice(-14).map((v, i) => (
        <div key={i} className="flex-1 min-w-0 flex flex-col items-center">
          <div className={cn('w-full rounded-t transition-all', color)} style={{ height: max > 0 ? `${Math.max(2, (v / max) * 100)}%` : '2px' }} />
        </div>
      ))}
    </div>
  )
}

function StatCard({ title, value, color, format }: { title: string; value: number; color: string; format?: 'price' | 'percent' }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    violet: 'bg-violet-100 text-violet-600',
    red: 'bg-red-100 text-red-600',
  }
  const display = format === 'price' ? formatPrice(value) : format === 'percent' ? value.toFixed(1) + '%' : value.toLocaleString()
  return (
    <div className={cn('bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-4', 'border border-white/60', 'shadow-[0_6px_24px_rgba(0,0,0,0.08)]')}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', colors[color] ?? 'bg-gray-100 text-gray-600')}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      </div>
      <p className="text-[20px] sm:text-[24px] font-bold text-[#1C1F26] truncate" title={String(display)}>{display}</p>
      <p className="text-[12px] text-[#6B7280] mt-0.5">{title}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ПОЛЬЗОВАТЕЛИ — Real API data with actions (set role — root only)
// ═══════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [settingRole, setSettingRole] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiFetch<AdminUser[]>('/admin/users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const ROOT_ADMIN_EMAIL = 'legba086@mail.ru'
  const isRootUser = (u: AdminUser) =>
    (u.email ?? '').trim().toLowerCase() === ROOT_ADMIN_EMAIL.trim().toLowerCase()

  const handleSetRole = async (userId: string, role: 'admin' | 'manager' | 'user') => {
    setSettingRole(userId)
    try {
      await apiFetch('/admin/set-role', {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to set role:', err)
    } finally {
      setSettingRole(null)
    }
  }

  const handleBan = async (userId: string, ban: boolean) => {
    try {
      await apiFetch(`/admin/users/${userId}/${ban ? 'ban' : 'unban'}`, { method: 'POST' })
      fetchUsers()
    } catch (err) {
      console.error('Failed to ban/unban:', err)
    }
  }

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
                  {user.appRole === 'ADMIN' ? 'Администратор' : 'Пользователь'} •{' '}
                  {user._count?.listings || 0} объявлений •{' '}
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
      if (action === 'reject') {
        const reason = window.prompt('Причина отклонения (будет показана автору):') ?? ''
        await apiFetch(`/admin/listings/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
      } else {
        await apiFetch(`/admin/listings/${id}/${action}`, { method: 'POST' })
      }
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
          <option value="REJECTED">Отклонённые</option>
          <option value="BLOCKED">Заблокировано</option>
        </select>
      </div>

      {listings.length === 0 ? (
        <p className="text-[#6B7280]">Нет объявлений</p>
      ) : (
        <div className="overflow-x-auto rounded-[18px] border border-gray-200 bg-white">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 font-medium text-[#6B7280] w-16">Фото</th>
                <th className="p-3 font-medium text-[#6B7280]">Название</th>
                <th className="p-3 font-medium text-[#6B7280]">Владелец</th>
                <th className="p-3 font-medium text-[#6B7280]">Статус</th>
                <th className="p-3 font-medium text-[#6B7280]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="p-2">
                    {listing.photos?.[0]?.url ? (
                      <img src={listing.photos[0].url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">Нет</div>
                    )}
                  </td>
                  <td className="p-3">
                    <Link href={`/listings/${listing.id}`} className="font-medium text-[#1C1F26] hover:text-violet-600 line-clamp-2">
                      {listing.title}
                    </Link>
                    <p className="text-[12px] text-[#6B7280]">{listing.city} · {formatPrice(listing.basePrice)}</p>
                  </td>
                  <td className="p-3 text-[#6B7280]">{listing.owner?.profile?.name || listing.owner?.email || '—'}</td>
                  <td className="p-3">
                    <span className={cn('px-2 py-0.5 rounded-lg text-[12px] font-medium', statusColors[listing.status] || 'bg-gray-100 text-gray-700')}>
                      {statusLabels[listing.status] || listing.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <Link href={`/listings/${listing.id}`} className="px-2 py-1 rounded-lg bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-500">
                        Открыть
                      </Link>
                      {listing.status === 'PENDING_REVIEW' && (
                        <>
                          <button type="button" onClick={() => handleAction(listing.id, 'approve')} className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[12px] font-medium hover:bg-emerald-500">
                            Одобрить
                          </button>
                          <button type="button" onClick={() => handleAction(listing.id, 'reject')} className="px-2 py-1 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-500">
                            Отклонить
                          </button>
                        </>
                      )}
                      {listing.status === 'PUBLISHED' && (
                        <button type="button" onClick={() => handleAction(listing.id, 'block')} className="px-2 py-1 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-500">
                          Бан
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Удалить объявление? Это действие необратимо.')) return
                          try {
                            await apiFetch(`/admin/listings/${listing.id}/delete`, { method: 'POST' })
                            fetchListings()
                          } catch (err) {
                            console.error('Failed to delete listing:', err)
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-gray-200 text-gray-700 text-[12px] font-medium hover:bg-gray-300"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      if (action === 'reject') {
        const reason = window.prompt('Причина отклонения (будет показана автору):') ?? ''
        await apiFetch(`/admin/listings/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
      } else {
        await apiFetch(`/admin/listings/${id}/approve`, { method: 'POST' })
      }
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
            <div key={listing.id} className="p-4 rounded-[14px] bg-amber-50 border border-amber-200 flex flex-col sm:flex-row gap-4">
              {listing.photos?.[0]?.url && (
                <div className="w-full sm:w-24 h-24 rounded-[12px] overflow-hidden bg-gray-200 flex-shrink-0">
                  <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1C1F26] mb-1">{listing.title}</p>
                {listing.description && (
                  <p className="text-[12px] text-[#6B7280] line-clamp-2 mb-2">{listing.description}</p>
                )}
                <p className="text-[13px] text-[#6B7280] mb-1">
                  {listing.city} • {formatPrice(listing.basePrice)} • от {listing.owner?.profile?.name || listing.owner?.email || 'Неизвестно'}
                </p>
                <p className="text-[12px] text-amber-700">
                  Создано: {new Date(listing.createdAt).toLocaleString('ru')}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[11px] text-[#6B7280]">Чеклист: фото ✓</span>
                  {listing.basePrice > 0 && <span className="text-[11px] text-[#6B7280]">цена ✓</span>}
                  {(listing.amenities?.length ?? 0) > 0 && <span className="text-[11px] text-[#6B7280]">удобства ✓</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 self-start sm:self-center">
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
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// БРОНИ — список бронирований
// ═══════════════════════════════════════════════════════════════
interface AdminBooking {
  id: string
  listingId: string
  guestId: string
  hostId: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: string
  createdAt: string
  listing?: { id: string; title: string }
  guest?: { id: string; email: string | null }
  host?: { id: string; email: string | null }
}

function BookingsTab() {
  const [list, setList] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<AdminBooking[]>('/admin/bookings')
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-8 text-[#6B7280]">Загрузка...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Брони ({list.length})</h2>
      {list.length === 0 ? (
        <p className="text-[#6B7280]">Пока нет бронирований.</p>
      ) : (
        <div className="space-y-2">
          {list.map((b) => (
            <div key={b.id} className="p-4 rounded-[14px] bg-gray-50 border border-gray-100">
              <p className="font-medium text-[#1C1F26]">{b.listing?.title ?? b.listingId}</p>
              <p className="text-[13px] text-[#6B7280]">
                Гость: {b.guest?.email ?? b.guestId} • Хост: {b.host?.email ?? b.hostId}
              </p>
              <p className="text-[12px] text-[#6B7280]">
                {new Date(b.checkIn).toLocaleDateString('ru')} – {new Date(b.checkOut).toLocaleDateString('ru')} • {formatPrice(b.totalPrice)} • {b.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ЧАТЫ — список диалогов для модератора
// ═══════════════════════════════════════════════════════════════
interface AdminChat {
  id: string
  listingId: string
  hostId: string
  guestId: string
  updatedAt: string
  listing?: { id: string; title: string }
  host?: { id: string; email: string | null }
  guest?: { id: string; email: string | null }
  _count?: { messages: number }
}

function ChatsTab() {
  const [list, setList] = useState<AdminChat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<AdminChat[]>('/admin/chats')
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-8 text-[#6B7280]">Загрузка...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Чаты ({list.length})</h2>
      {list.length === 0 ? (
        <p className="text-[#6B7280]">Пока нет диалогов.</p>
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <div key={c.id} className="p-4 rounded-[14px] bg-gray-50 border border-gray-100">
              <p className="font-medium text-[#1C1F26]">{c.listing?.title ?? c.listingId}</p>
              <p className="text-[13px] text-[#6B7280]">
                Хост: {c.host?.email ?? c.hostId} • Гость: {c.guest?.email ?? c.guestId}
              </p>
              <p className="text-[12px] text-[#6B7280]">
                Обновлён: {new Date(c.updatedAt).toLocaleString('ru')} • Сообщений: {c._count?.messages ?? 0}
              </p>
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
// PUSH — отправка уведомлений всем пользователям
// ═══════════════════════════════════════════════════════════════
function PushTab() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent?: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!title.trim()) {
      setError('Введите текст уведомления')
      return
    }
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await apiFetch<{ sent: number }>('/admin/push', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim() || undefined,
          link: link.trim() || undefined,
        }),
      })
      setResult(res ?? { sent: 0 })
      setTitle('')
      setBody('')
      setLink('')
    } catch (e: any) {
      setError(e?.message ?? 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[18px] font-bold text-[#1C1F26]">Уведомления</h2>
      <p className="text-[14px] text-[#6B7280]">Отправка уведомления всем пользователям (отобразится в колокольчике в шапке).</p>
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Текст (заголовок) *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок уведомления"
            className="w-full rounded-[14px] px-4 py-3 border border-gray-200 bg-white text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Описание (необязательно)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Дополнительный текст"
            rows={3}
            className="w-full rounded-[14px] px-4 py-3 border border-gray-200 bg-white text-[14px] resize-none"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Ссылка (необязательно)</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-[14px] px-4 py-3 border border-gray-200 bg-white text-[14px]"
          />
        </div>
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        {result != null && <p className="text-[13px] text-green-600">Отправлено пользователям: {result.sent ?? 0}</p>}
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="px-5 py-2.5 rounded-[14px] bg-violet-600 text-white font-semibold text-[14px] hover:bg-violet-500 disabled:opacity-70"
        >
          {loading ? 'Отправка…' : 'Отправить всем'}
        </button>
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

function BookingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function PushIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function ChatsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
