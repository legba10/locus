'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'
import { apiFetch } from '@/shared/utils/apiFetch'
import { getAiAdminMockReviewMetrics } from '@/ai/aiAdmin'
import { useAiController } from '@/ai/aiController'
import { AiAdminPanel } from '@/components/ai/AiAdminPanel'

type AdminTab = 'dashboard' | 'users' | 'listings' | 'moderation' | 'bookings' | 'push' | 'chats' | 'settings'
const ADMIN_TAB_IDS: AdminTab[] = ['dashboard', 'users', 'listings', 'moderation', 'bookings', 'push', 'chats', 'settings']

/** ТЗ-5: flat + nested from GET /admin/stats */
interface AdminStats {
  users_total?: number
  users_active?: number
  listings_total?: number
  listings_active?: number
  bookings_total?: number
  bookings_confirmed?: number
  revenue_total?: number
  gmv_total?: number
  avg_check?: number
  users_last_7_days?: number
  listings_last_7_days?: number
  bookings_last_7_days?: number
  users?: { total: number; active?: number }
  listings?: { total: number; pending: number; published: number }
  bookings?: { total: number; confirmed?: number; canceled?: number }
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

interface ActivityEvent {
  type: 'user' | 'listing' | 'booking'
  id: string
  date: string
  label: string
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
  const [activeTab, setActiveTab] = useState<AdminTab>(tabFromUrl && ADMIN_TAB_IDS.includes(tabFromUrl) ? tabFromUrl : 'dashboard')
  const aiController = useAiController()

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab && ADMIN_TAB_IDS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl, activeTab])

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

  const tabButton = (tab: (typeof tabs)[0]) => (
    <button
      key={tab.id}
      type="button"
      onClick={() => setActiveTab(tab.id)}
      className={cn(
        'w-full lg:w-auto px-4 py-2.5 rounded-[12px] text-[14px] font-medium transition-all whitespace-nowrap flex items-center gap-2',
        activeTab === tab.id ? 'admin-tab-active' : 'admin-tab-inactive'
      )}
    >
      {tab.icon}
      {tab.label}
    </button>
  )

  return (
    <div className="min-h-screen flex flex-col">
      {/* ТЗ-4: admin header — full width, inner 1280px */}
      <header className="admin-header">
        <div className="admin-header__inner">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[var(--admin-text-primary)] mb-0.5">Панель администратора</h1>
            <p className="text-[14px] text-[var(--admin-text-secondary)]">Управление платформой LOCUS</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/ai" className="px-4 py-2 rounded-[14px] bg-violet-500/20 text-violet-300 text-[14px] font-medium hover:bg-violet-500/30 border border-[var(--admin-card-border)]">
              AI
            </Link>
            <button
              type="button"
              onClick={() => aiController.openPanel('admin')}
              className="px-4 py-2 rounded-[14px] bg-violet-500/20 text-violet-300 text-[14px] font-medium hover:bg-violet-500/30 border border-[var(--admin-card-border)]"
            >
              AI-анализ
            </button>
            <Link href="/" className="px-4 py-2 rounded-[14px] bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] text-[14px] font-medium hover:bg-[var(--admin-row-hover)] border border-[var(--admin-card-border)]">
              ← На главную
            </Link>
          </div>
        </div>
      </header>

      <div className="admin-layout flex-1">
        {/* ТЗ-4: sidebar desktop 240px — вертикальные табы */}
        <aside className="admin-sidebar">
          <nav className="flex flex-col gap-1 px-3">
            {tabs.map(tab => tabButton(tab))}
          </nav>
        </aside>

        <main className="admin-main">
          {/* Mobile: табы горизонтально */}
          <div className="lg:hidden border-b border-[var(--admin-card-border)] px-4 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {tabs.map(tab => tabButton(tab))}
            </div>
          </div>

          <div className="admin-container flex-1 py-6 lg:py-8">
            <div className="admin-content admin-gap-section flex flex-col" style={{ maxHeight: 'none' }}>
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
        </main>
      </div>
      <AiAdminPanel open={aiController.open && aiController.mode === 'admin'} onClose={aiController.closePanel} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ДАШБОРД — ТЗ-5: реальная статистика, skeleton, обновить, активность
// ═══════════════════════════════════════════════════════════════
function DashboardTab() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [charts, setCharts] = useState<AdminCharts | null>(null)
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [statsData, chartsData, activityData] = await Promise.all([
        apiFetch<AdminStats>('/admin/stats'),
        apiFetch<AdminCharts>('/admin/stats/charts?days=30').catch(() => null),
        apiFetch<ActivityEvent[]>('/admin/stats/activity?limit=10').catch(() => []),
      ])
      setStats(statsData)
      setCharts(chartsData)
      setActivity(Array.isArray(activityData) ? activityData : [])
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex flex-col admin-gap-section">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[var(--admin-text-primary)]">Дашборд</h2>
        </div>
        <section className="admin-metrics-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-card admin-metric-card min-h-[110px] animate-pulse">
              <div className="h-8 w-8 rounded-lg bg-[var(--admin-input-bg)] mb-2" />
              <div className="h-6 w-16 rounded bg-[var(--admin-input-bg)]" />
              <div className="h-4 w-24 rounded bg-[var(--admin-input-bg)] mt-2" />
            </div>
          ))}
        </section>
        <div className="text-center py-6 text-[var(--admin-text-secondary)]">Загрузка данных...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-8 text-red-400">Ошибка: {error}</div>
        <button type="button" onClick={handleRefresh} className="mx-auto px-4 py-2 rounded-xl bg-violet-600 text-white text-[14px] font-medium">
          Обновить
        </button>
      </div>
    )
  }

  if (!stats) return null

  const s = stats
  const econ = s.economy
  const usersTotal = s.users_total ?? s.users?.total ?? 0
  const usersActive = s.users_active ?? s.users?.active ?? usersTotal
  const listingsTotal = s.listings_total ?? s.listings?.total ?? 0
  const listingsActive = s.listings_active ?? s.listings?.published ?? 0
  const bookingsTotal = s.bookings_total ?? s.bookings?.total ?? 0
  const bookingsConfirmed = s.bookings_confirmed ?? s.bookings?.confirmed ?? 0
  const revenueTotal = s.revenue_total ?? econ?.revenue ?? 0
  const gmvTotal = s.gmv_total ?? econ?.gmv ?? 0
  const avgCheck = s.avg_check ?? econ?.averageOrder ?? 0
  const usersLast7 = s.users_last_7_days ?? 0
  const listingsLast7 = s.listings_last_7_days ?? 0
  const bookingsLast7 = s.bookings_last_7_days ?? 0

  const revenueData = charts?.revenue?.length ? charts.revenue.map((r) => r.value ?? 0) : Array(30).fill(0)
  const bookingsChartData = charts?.bookings?.length ? charts.bookings.map((b) => b.count) : Array(30).fill(0)
  const usersChartData = charts?.newUsers?.length ? charts.newUsers.map((u) => u.count) : Array(30).fill(0)
  const revenueMax = Math.max(...revenueData, 1)
  const bookingsMax = Math.max(...bookingsChartData, 1)
  const usersMax = Math.max(...usersChartData, 1)
  const aiReviews = getAiAdminMockReviewMetrics()

  return (
    <div className="flex flex-col admin-gap-section">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-bold text-[var(--admin-text-primary)]">Дашборд</h2>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] text-[14px] font-medium border border-[var(--admin-card-border)] hover:bg-[var(--admin-row-hover)] disabled:opacity-60"
        >
          {refreshing ? 'Обновление…' : 'Обновить'}
        </button>
      </div>

      {/* 1. Метрики — реальные значения, подпись +X за 7 дней */}
      <section className="admin-metrics-grid">
        <StatCard title="Пользователей" value={usersTotal} subtitle={usersLast7 > 0 ? `+${usersLast7} за 7 дней` : undefined} color="blue" />
        <StatCard title="Активных пользователей" value={usersActive} color="blue" />
        <StatCard title="Объявлений" value={listingsTotal} subtitle={listingsLast7 > 0 ? `+${listingsLast7} за 7 дней` : undefined} color="emerald" />
        <StatCard title="Активных объявлений" value={listingsActive} color="emerald" />
        <StatCard title="Бронирований" value={bookingsTotal} subtitle={bookingsLast7 > 0 ? `+${bookingsLast7} за 7 дней` : undefined} color="blue" />
        <StatCard title="Подтверждённых броней" value={bookingsConfirmed} color="violet" />
        <StatCard title="GMV" value={gmvTotal} color="violet" format="price" />
        <StatCard title="Доход платформы" value={revenueTotal} color="emerald" format="price" />
        <StatCard title="Комиссия" value={econ?.commission ?? revenueTotal} color="emerald" format="price" />
        <StatCard title="Средний чек" value={avgCheck} color="violet" format="price" />
        <StatCard title="Просмотры" value={econ?.totalViews ?? 0} color="blue" />
        <StatCard title="Конверсия %" value={econ?.conversion ?? 0} color="emerald" format="percent" />
        <StatCard title="Сообщения" value={econ?.messagesCount ?? 0} color="violet" />
      </section>

      {/* 2. Графики — всегда показываем, данные из API или нули */}
      <section className="grid grid-cols-1 lg:grid-cols-3 admin-gap-block">
        <div className="admin-card w-full min-w-0">
          <h3 className="text-[14px] font-semibold text-[var(--admin-text-primary)] mb-3">Доход по дням (30 дн.)</h3>
          <div className="admin-chart-wrap">
            <SimpleBarChart data={revenueData.slice(-14)} max={revenueMax} color="bg-emerald-500" height={220} />
          </div>
        </div>
        <div className="admin-card w-full min-w-0">
          <h3 className="text-[14px] font-semibold text-[var(--admin-text-primary)] mb-3">Брони по дням (30 дн.)</h3>
          <div className="admin-chart-wrap">
            <SimpleBarChart data={bookingsChartData.slice(-14)} max={bookingsMax} color="bg-violet-500" height={220} />
          </div>
        </div>
        <div className="admin-card w-full min-w-0">
          <h3 className="text-[14px] font-semibold text-[var(--admin-text-primary)] mb-3">Новые пользователи (30 дн.)</h3>
          <div className="admin-chart-wrap">
            <SimpleBarChart data={usersChartData.slice(-14)} max={usersMax} color="bg-blue-500" height={220} />
          </div>
        </div>
      </section>

      <section className="admin-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[16px] font-semibold text-[var(--admin-text-primary)]">AI-анализ отзывов (mock)</h3>
          <span className="text-[12px] text-[var(--admin-text-muted)]">Готово к API</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[12px] bg-emerald-500/10 border border-emerald-500/30 p-3">
            <p className="text-[12px] text-emerald-300">Позитив</p>
            <p className="text-[20px] font-semibold text-emerald-200">{aiReviews.positive}%</p>
          </div>
          <div className="rounded-[12px] bg-red-500/10 border border-red-500/30 p-3">
            <p className="text-[12px] text-red-300">Негатив</p>
            <p className="text-[20px] font-semibold text-red-200">{aiReviews.negative}%</p>
          </div>
        </div>
        <div className="mt-3 rounded-[12px] border border-[var(--admin-card-border)] p-3">
          <p className="text-[12px] text-[var(--admin-text-secondary)] mb-1">Основные проблемы</p>
          <ul className="space-y-1 text-[13px] text-[var(--admin-text-primary)]">
            {aiReviews.commonProblems.map((problem) => (
              <li key={problem}>• {problem}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Таблица юнит-экономики */}
      <section className="admin-card overflow-hidden p-0">
        <h3 className="text-[16px] font-semibold text-[var(--admin-text-primary)] p-4 border-b border-[var(--admin-card-border)]">Юнит-экономика</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table w-full text-[14px]">
            <thead>
              <tr>
                <th className="p-3 font-medium">Метрика</th>
                <th className="p-3 font-medium">Значение</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3">Доход</td><td className="p-3 font-medium">{formatPrice(revenueTotal)}</td></tr>
              <tr><td className="p-3">Комиссия</td><td className="p-3 font-medium">{formatPrice(econ?.commission ?? revenueTotal)}</td></tr>
              <tr><td className="p-3">Средний чек</td><td className="p-3 font-medium">{formatPrice(avgCheck)}</td></tr>
              <tr><td className="p-3">Брони (подтверждённые)</td><td className="p-3">{bookingsConfirmed}</td></tr>
              <tr><td className="p-3">Конверсия %</td><td className="p-3">{(econ?.conversion ?? 0).toFixed(2)}%</td></tr>
              <tr><td className="p-3">GMV</td><td className="p-3 font-medium">{formatPrice(gmvTotal)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Последние действия */}
      <section className="admin-card overflow-hidden p-0">
        <h3 className="text-[16px] font-semibold text-[var(--admin-text-primary)] p-4 border-b border-[var(--admin-card-border)]">Последние действия</h3>
        <ul className="divide-y divide-[var(--admin-card-border)]">
          {activity.length === 0 ? (
            <li className="p-4 text-[var(--admin-text-muted)] text-[14px]">Нет событий</li>
          ) : (
            activity.map((ev) => (
              <li key={`${ev.type}-${ev.id}`} className="flex items-center justify-between gap-3 p-4">
                <span className="text-[var(--admin-text-secondary)] text-[14px] truncate">{ev.label}</span>
                <span className="text-[var(--admin-text-muted)] text-[12px] shrink-0">
                  {ev.type === 'user' && 'Пользователь'}
                  {ev.type === 'listing' && 'Объявление'}
                  {ev.type === 'booking' && 'Бронь'}
                  {' · '}
                  {new Date(ev.date).toLocaleString('ru')}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}

function SimpleBarChart({ data, max, color, height = 96 }: { data: number[]; max: number; color: string; height?: number }) {
  return (
    <div className="flex items-end gap-0.5 min-w-0 w-full" style={{ height }}>
      {data.slice(-14).map((v, i) => (
        <div key={i} className="flex-1 min-w-0 flex flex-col items-center">
          <div className={cn('w-full rounded-t transition-all', color)} style={{ height: max > 0 ? `${Math.max(2, (v / max) * 100)}%` : '2px' }} />
        </div>
      ))}
    </div>
  )
}

function StatCard({ title, value, color, format, subtitle }: { title: string; value: number; color: string; format?: 'price' | 'percent'; subtitle?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300',
    violet: 'bg-violet-500/20 text-violet-300',
    red: 'bg-red-500/20 text-red-300',
  }
  const display = format === 'price' ? formatPrice(value) : format === 'percent' ? value.toFixed(1) + '%' : value.toLocaleString()
  return (
    <div className="admin-card admin-metric-card min-h-[110px] flex flex-col justify-center">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', colors[color] ?? 'bg-[var(--admin-input-bg)] text-[var(--admin-text-muted)]')}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      </div>
      <p className="text-[18px] sm:text-[22px] font-bold text-[var(--admin-text-primary)] truncate" title={String(display)}>{display}</p>
      <p className="text-[12px] text-[var(--admin-text-secondary)] mt-0.5">{title}</p>
      {subtitle && <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">{subtitle}</p>}
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

  if (loading) return <div className="text-center py-8 text-[var(--admin-text-secondary)]">Загрузка...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[var(--admin-text-primary)]">Пользователи ({users.length})</h2>
      {users.length === 0 ? (
        <p className="text-[var(--admin-text-secondary)]">Нет пользователей</p>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="admin-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-[14px]">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--admin-text-primary)]">{(user as any).profile?.name || user.email || 'Пользователь'}</p>
                <p className="text-[13px] text-[var(--admin-text-secondary)]">
                  {user.email}
                </p>
                <p className="text-[12px] text-[var(--admin-text-muted)] mt-0.5">
                  {user.appRole === 'ADMIN' ? 'Администратор' : 'Пользователь'} • {user._count?.listings || 0} объявлений • {new Date(user.createdAt).toLocaleDateString('ru')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('px-3 py-1 rounded-lg text-[12px] font-medium', user.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300')}>
                  {user.status === 'ACTIVE' ? 'Активен' : 'Заблокирован'}
                </span>
                <span className={cn('px-3 py-1 rounded-lg text-[12px] font-medium', user.appRole === 'ADMIN' ? 'bg-violet-500/20 text-violet-300' : 'bg-[var(--admin-input-bg)] text-[var(--admin-text-secondary)]')}>
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

  if (loading) return <div className="text-center py-8 text-[var(--admin-text-secondary)]">Загрузка...</div>

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
    DRAFT: 'bg-[var(--admin-input-bg)] text-[var(--admin-text-secondary)]',
    AWAITING_PAYMENT: 'bg-amber-500/20 text-amber-300',
    PENDING_REVIEW: 'bg-blue-500/20 text-blue-300',
    PUBLISHED: 'bg-emerald-500/20 text-emerald-300',
    REJECTED: 'bg-red-500/20 text-red-300',
    BLOCKED: 'bg-red-500/20 text-red-300',
    ARCHIVED: 'bg-[var(--admin-input-bg)] text-[var(--admin-text-secondary)]',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-bold text-[var(--admin-text-primary)]">Объявления ({listings.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-[14px] px-4 py-2 border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] text-[14px]"
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
        <p className="text-[var(--admin-text-secondary)]">Нет объявлений</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {listings.map((listing) => {
              const photoUrl = listing.photos?.[0]?.url
              return (
                <div key={listing.id} className="admin-card p-4 rounded-[14px] space-y-3">
                  <div className="flex gap-3">
                    {photoUrl ? (
                      <Image src={photoUrl} alt="" width={64} height={64} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" unoptimized={photoUrl.startsWith('http')} />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-[var(--admin-input-bg)] flex items-center justify-center text-[10px] text-[var(--admin-text-muted)] flex-shrink-0">Нет</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link href={`/listings/${listing.id}`} className="font-medium text-[var(--admin-text-primary)] hover:text-violet-400 line-clamp-2">{listing.title}</Link>
                      <p className="text-[12px] text-[var(--admin-text-secondary)]">{listing.city} · {formatPrice(listing.basePrice)}</p>
                      <p className="text-[12px] text-[var(--admin-text-muted)]">{listing.owner?.profile?.name || listing.owner?.email || '—'}</p>
                      <span className={cn('inline-block mt-1 px-2 py-0.5 rounded-lg text-[12px] font-medium', statusColors[listing.status])}>{statusLabels[listing.status] || listing.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/listings/${listing.id}`} className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-500">Открыть</Link>
                    {listing.status === 'PENDING_REVIEW' && (
                      <>
                        <button type="button" onClick={() => handleAction(listing.id, 'approve')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[12px] font-medium">Одобрить</button>
                        <button type="button" onClick={() => handleAction(listing.id, 'reject')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-medium">Отклонить</button>
                      </>
                    )}
                    {listing.status === 'PUBLISHED' && (
                      <button type="button" onClick={() => handleAction(listing.id, 'block')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-medium">Бан</button>
                    )}
                    <button type="button" onClick={async () => { if (!window.confirm('Удалить объявление? Это действие необратимо.')) return; try { await apiFetch(`/admin/listings/${listing.id}/delete`, { method: 'POST' }); fetchListings(); } catch (err) { console.error('Failed to delete listing', err); } }} className="px-3 py-1.5 rounded-lg bg-[var(--admin-input-bg)] text-[var(--admin-text-secondary)] text-[12px] font-medium">Удалить</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="hidden md:block admin-table-wrapper rounded-[18px] border border-[var(--admin-card-border)]">
            <table className="admin-table w-full text-[14px]">
              <thead>
                <tr>
                  <th className="p-3 font-medium w-16">Фото</th>
                  <th className="p-3 font-medium">Название</th>
                  <th className="p-3 font-medium">Владелец</th>
                  <th className="p-3 font-medium">Статус</th>
                  <th className="p-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const photoUrl = listing.photos?.[0]?.url
                  return (
                    <tr key={listing.id}>
                      <td className="p-2">
                        {photoUrl ? (
                          <Image src={photoUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover" unoptimized={photoUrl.startsWith('http')} />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[var(--admin-input-bg)] flex items-center justify-center text-[10px] text-[var(--admin-text-muted)]">Нет</div>
                        )}
                      </td>
                      <td className="p-3">
                        <Link href={`/listings/${listing.id}`} className="font-medium text-[var(--admin-text-primary)] hover:text-violet-400 line-clamp-2">{listing.title}</Link>
                        <p className="text-[12px] text-[var(--admin-text-secondary)]">{listing.city} · {formatPrice(listing.basePrice)}</p>
                      </td>
                      <td className="p-3 text-[var(--admin-text-secondary)]">{listing.owner?.profile?.name || listing.owner?.email || '—'}</td>
                      <td className="p-3">
                        <span className={cn('px-2 py-0.5 rounded-lg text-[12px] font-medium', statusColors[listing.status])}>{statusLabels[listing.status] || listing.status}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          <Link href={`/listings/${listing.id}`} className="px-2 py-1 rounded-lg bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-500">Открыть</Link>
                          {listing.status === 'PENDING_REVIEW' && (
                            <>
                              <button type="button" onClick={() => handleAction(listing.id, 'approve')} className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[12px] font-medium hover:bg-emerald-500">Одобрить</button>
                              <button type="button" onClick={() => handleAction(listing.id, 'reject')} className="px-2 py-1 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-500">Отклонить</button>
                            </>
                          )}
                          {listing.status === 'PUBLISHED' && (
                            <button type="button" onClick={() => handleAction(listing.id, 'block')} className="px-2 py-1 rounded-lg bg-red-600 text-white text-[12px] font-medium">Бан</button>
                          )}
                          <button type="button" onClick={async () => { if (!window.confirm('Удалить объявление? Это действие необратимо.')) return; try { await apiFetch(`/admin/listings/${listing.id}/delete`, { method: 'POST' }); fetchListings(); } catch (err) { console.error('Failed to delete listing', err); } }} className="px-2 py-1 rounded-lg bg-[var(--admin-input-bg)] text-[var(--admin-text-secondary)] text-[12px] font-medium">Удалить</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
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

  if (loading) return <div className="text-center py-8 text-[var(--admin-text-secondary)]">Загрузка...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[var(--admin-text-primary)]">Модерация ({listings.length})</h2>
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[var(--admin-text-secondary)]">Нет объявлений на модерации</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => {
            const modPhotoUrl = listing.photos?.[0]?.url
            return (
              <div key={listing.id} className="admin-card p-4 rounded-[14px] flex flex-col sm:flex-row gap-4">
                {modPhotoUrl ? (
                  <div className="w-full sm:w-24 h-24 rounded-[12px] overflow-hidden bg-[var(--admin-input-bg)] flex-shrink-0 relative">
                    <Image src={modPhotoUrl} alt={listing.title ?? ''} fill className="object-cover" sizes="96px" unoptimized={modPhotoUrl.startsWith('http')} />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--admin-text-primary)] mb-1">{listing.title}</p>
                  {listing.description && (
                    <p className="text-[12px] text-[var(--admin-text-secondary)] line-clamp-2 mb-2">{listing.description}</p>
                  )}
                  <p className="text-[13px] text-[var(--admin-text-secondary)] mb-1">
                    {listing.city} • {formatPrice(listing.basePrice)} • от {listing.owner?.profile?.name || listing.owner?.email || 'Неизвестно'}
                  </p>
                  <p className="text-[12px] text-[var(--admin-text-muted)]">
                    Создано: {new Date(listing.createdAt).toLocaleString('ru')}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[11px] text-[var(--admin-text-muted)]">Чеклист: фото ✓</span>
                    {listing.basePrice > 0 && <span className="text-[11px] text-[var(--admin-text-muted)]">цена ✓</span>}
                    {(listing.amenities?.length ?? 0) > 0 && <span className="text-[11px] text-[var(--admin-text-muted)]">удобства ✓</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 self-start sm:self-center">
                  <Link href={`/listings/${listing.id}`} className="px-4 py-2 rounded-[12px] bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-500">Просмотр</Link>
                  <button onClick={() => handleAction(listing.id, 'approve')} className="px-4 py-2 rounded-[12px] bg-emerald-600 text-white text-[13px] font-medium hover:bg-emerald-500">Одобрить</button>
                  <button onClick={() => handleAction(listing.id, 'reject')} className="px-4 py-2 rounded-[12px] bg-red-600 text-white text-[13px] font-medium hover:bg-red-500">Отклонить</button>
                </div>
              </div>
            )
          })}
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

  if (loading) return <div className="py-8 text-[var(--admin-text-secondary)]">Загрузка...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[var(--admin-text-primary)]">Брони ({list.length})</h2>
      {list.length === 0 ? (
        <p className="text-[var(--admin-text-secondary)]">Пока нет бронирований.</p>
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <div key={b.id} className="admin-card p-4 rounded-[14px]">
              <p className="font-medium text-[var(--admin-text-primary)]">{b.listing?.title ?? b.listingId}</p>
              <p className="text-[13px] text-[var(--admin-text-secondary)]">
                Гость: {b.guest?.email ?? b.guestId} • Хост: {b.host?.email ?? b.hostId}
              </p>
              <p className="text-[12px] text-[var(--admin-text-muted)]">
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

  if (loading) return <div className="py-8 text-[var(--admin-text-secondary)]">Загрузка...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[var(--admin-text-primary)]">Чаты ({list.length})</h2>
      {list.length === 0 ? (
        <p className="text-[var(--admin-text-secondary)]">Пока нет диалогов.</p>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div key={c.id} className="admin-card p-4 rounded-[14px]">
              <p className="font-medium text-[var(--admin-text-primary)]">{c.listing?.title ?? c.listingId}</p>
              <p className="text-[13px] text-[var(--admin-text-secondary)]">
                Хост: {c.host?.email ?? c.hostId} • Гость: {c.guest?.email ?? c.guestId}
              </p>
              <p className="text-[12px] text-[var(--admin-text-muted)]">
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
      <h2 className="text-[20px] font-bold text-[var(--admin-text-primary)]">Настройки</h2>
      <div className="admin-card rounded-[18px] p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--admin-text-secondary)] mb-2">Авто-публикация объявлений</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-[var(--admin-card-border)] text-violet-600 bg-[var(--admin-input-bg)]" />
              <span className="text-[14px] text-[var(--admin-text-primary)]">Публиковать без модерации (не рекомендуется)</span>
            </label>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--admin-text-secondary)] mb-2">Уведомления о новых объявлениях</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--admin-card-border)] text-violet-600 bg-[var(--admin-input-bg)]" />
              <span className="text-[14px] text-[var(--admin-text-primary)]">Получать email о новых объявлениях на модерацию</span>
            </label>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--admin-text-secondary)] mb-2">Минимальная цена объявления (₽)</label>
            <input
              type="number"
              defaultValue={1000}
              className="w-full rounded-[14px] px-4 py-3 border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] text-[14px]"
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
      <h2 className="text-[18px] font-bold text-[var(--admin-text-primary)]">Уведомления</h2>
      <p className="text-[14px] text-[var(--admin-text-secondary)]">Отправка уведомления всем пользователям (отобразится в колокольчике в шапке).</p>
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[var(--admin-text-secondary)] mb-2">Текст (заголовок) *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок уведомления"
            className="w-full rounded-[14px] px-4 py-3 border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[var(--admin-text-secondary)] mb-2">Описание (необязательно)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Дополнительный текст"
            rows={3}
            className="w-full rounded-[14px] px-4 py-3 border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] text-[14px] resize-none"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[var(--admin-text-secondary)] mb-2">Ссылка (необязательно)</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-[14px] px-4 py-3 border border-[var(--admin-card-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text-primary)] text-[14px]"
          />
        </div>
        {error && <p className="text-[13px] text-red-400">{error}</p>}
        {result != null && <p className="text-[13px] text-emerald-400">Отправлено пользователям: {result.sent ?? 0}</p>}
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
