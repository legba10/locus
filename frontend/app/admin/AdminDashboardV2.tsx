'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'listings'
  | 'bookings'
  | 'reviews'
  | 'ai'
  | 'economics'
  | 'moderation'
  | 'settings'

/**
 * AdminDashboardV2 — Расширенная админ-панель (8 разделов)
 * 
 * Разделы:
 * 1. Дашборд
 * 2. Пользователи
 * 3. Объявления
 * 4. Бронирования
 * 5. Отзывы
 * 6. AI-аналитика
 * 7. Модерация
 * 8. Настройки
 */
export function AdminDashboardV2() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1C1F26] mb-1">Панель администратора</h1>
            <p className="text-[14px] text-[#6B7280]">Управление платформой LOCUS</p>
          </div>
          <Link
            href="/"
            className={cn(
              'px-4 py-2 rounded-[14px]',
              'bg-gray-100 text-[#1C1F26] text-[14px] font-medium',
              'hover:bg-gray-200 transition-colors'
            )}
          >
            ← На главную
          </Link>
        </div>

        {/* Tabs */}
        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6 mb-6',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex gap-2 border-b border-gray-200 pb-4 mb-6 overflow-x-auto" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'thin' }}>
            {[
              { id: 'dashboard' as AdminTab, label: 'Дашборд', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )},
              { id: 'users' as AdminTab, label: 'Пользователи', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )},
              { id: 'listings' as AdminTab, label: 'Объявления', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )},
              { id: 'bookings' as AdminTab, label: 'Бронирования', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )},
              { id: 'reviews' as AdminTab, label: 'Отзывы', icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )},
              { id: 'ai' as AdminTab, label: 'AI-аналитика', icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  )},
              { id: 'economics' as AdminTab, label: 'Юнит-экономика', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )},
              { id: 'moderation' as AdminTab, label: 'Модерация', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )},
              { id: 'settings' as AdminTab, label: 'Настройки', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )},
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-[12px] text-[14px] font-medium transition-all whitespace-nowrap',
                  'flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'text-[#6B7280] hover:bg-gray-100'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="scroll-container" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'listings' && <ListingsTab />}
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'ai' && <AiAnalyticsTab />}
            {activeTab === 'economics' && <EconomicsTab />}
            {activeTab === 'moderation' && <ModerationTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ДАШБОРД
// ═══════════════════════════════════════════════════════════════
function DashboardTab() {
  const mockStats = {
    users: { total: 8247, newToday: 48, active: 6123 },
    listings: { total: 15632, active: 12480, pending: 156 },
    bookings: { total: 3456, thisMonth: 892, revenue: 12500000 },
    reviews: { total: 3456, new: 23, average: 4.5 },
    ai: { recommendations: 8921, accuracy: 87, processed: 15234 },
  }

  return (
    <div className="space-y-6">
      {/* KPI карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-5',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockStats.users.total.toLocaleString()}</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Пользователей</p>
          <p className="text-[12px] text-emerald-600 mt-1">+{mockStats.users.newToday} сегодня</p>
        </div>

        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-5',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockStats.listings.total.toLocaleString()}</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Объявлений</p>
          <p className="text-[12px] text-amber-600 mt-1">{mockStats.listings.pending} на модерации</p>
        </div>

        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-5',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockStats.bookings.total.toLocaleString()}</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Бронирований</p>
          <p className="text-[12px] text-emerald-600 mt-1">{mockStats.bookings.thisMonth} за месяц</p>
        </div>

        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-5',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockStats.reviews.total.toLocaleString()}</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Отзывов</p>
          <p className="text-[12px] text-emerald-600 mt-1">Средний: {mockStats.reviews.average}</p>
        </div>

        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-5',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-[12px] text-violet-600 font-medium">{mockStats.ai.accuracy}%</span>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockStats.ai.recommendations.toLocaleString()}</p>
          <p className="text-[13px] text-[#6B7280] mt-1">AI рекомендаций</p>
          <p className="text-[12px] text-emerald-600 mt-1">{mockStats.ai.processed.toLocaleString()} обработано</p>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <h2 className="text-[18px] font-bold text-[#1C1F26] mb-4">Рост объявлений</h2>
          <div className="h-64 bg-gray-50 rounded-[12px] flex items-center justify-center">
            <p className="text-[14px] text-[#6B7280]">График роста скоро появится</p>
          </div>
        </div>

        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <h2 className="text-[18px] font-bold text-[#1C1F26] mb-4">Активность пользователей</h2>
          <div className="h-64 bg-gray-50 rounded-[12px] flex items-center justify-center">
            <p className="text-[14px] text-[#6B7280]">График активности скоро появится</p>
          </div>
        </div>
      </div>

      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <h2 className="text-[18px] font-bold text-[#1C1F26] mb-4">Эффективность AI</h2>
        <div className="h-64 bg-gray-50 rounded-[12px] flex items-center justify-center">
          <p className="text-[14px] text-[#6B7280]">График эффективности AI скоро появится</p>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ПОЛЬЗОВАТЕЛИ
// ═══════════════════════════════════════════════════════════════
function UsersTab() {
  const mockUsers = [
    { id: '1', email: 'user1@example.com', role: 'user', createdAt: '2026-01-20', status: 'active', listings: 0 },
    { id: '2', email: 'landlord1@example.com', role: 'host', createdAt: '2026-01-19', status: 'active', listings: 3 },
    { id: '3', email: 'user2@example.com', role: 'user', createdAt: '2026-01-18', status: 'active', listings: 0 },
    { id: '4', email: 'spam@example.com', role: 'user', createdAt: '2026-01-17', status: 'blocked', listings: 0 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-[#1C1F26]">Пользователи</h2>
        <input
          type="text"
          placeholder="Поиск по email..."
          className={cn(
            'w-64 rounded-[14px] px-4 py-2',
            'border border-gray-200/60 bg-white/95',
            'text-[#1C1F26] text-[14px]',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
          )}
        />
      </div>

      <div className="space-y-3">
        {mockUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 rounded-[14px] bg-gray-50 border border-gray-200">
            <div className="flex-1">
              <p className="font-medium text-[#1C1F26]">{user.email}</p>
              <p className="text-[13px] text-[#6B7280]">
                {user.role === 'guest' ? 'Пользователь' : user.role === 'host' ? 'Арендодатель' : 'Администратор'} • 
                {user.listings} объявлений • {user.createdAt}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-3 py-1 rounded-lg text-[12px] font-medium',
                user.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              )}>
                {user.status === 'active' ? 'Активен' : 'Заблокирован'}
              </span>
              <button
                className={cn(
                  'px-3 py-1 rounded-lg text-[12px] font-medium transition-colors',
                  user.status === 'active'
                    ? 'bg-red-600 text-white hover:bg-red-500'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                )}
                title={user.status === 'active' ? 'Заблокировать пользователя' : 'Разблокировать пользователя'}
              >
                {user.status === 'active' ? 'Блок' : 'Разблок'}
              </button>
              <button
                className="px-3 py-1 rounded-lg bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-500"
                title="Изменить роль"
              >
                Роль
              </button>
              <Link
                href={`/admin/users/${user.id}`}
                className="px-3 py-1 rounded-lg bg-gray-100 text-[#1C1F26] text-[12px] font-medium hover:bg-gray-200"
              >
                Профиль
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ОБЪЯВЛЕНИЯ
// ═══════════════════════════════════════════════════════════════
function ListingsTab() {
  const mockListings = [
    { id: '1', title: 'Квартира в центре Москвы', status: 'published', views: 523, createdAt: '2026-01-25', aiScore: 87 },
    { id: '2', title: 'Современная студия', status: 'pending', views: 0, createdAt: '2026-01-26', aiScore: 0 },
    { id: '3', title: 'Дом в Сочи', status: 'published', views: 234, createdAt: '2026-01-24', aiScore: 72 },
    { id: '4', title: 'Сомнительное объявление', status: 'reported', views: 12, createdAt: '2026-01-23', aiScore: 35 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-[#1C1F26]">Объявления</h2>
        <div className="flex gap-2">
          <select className={cn(
            'rounded-[14px] px-4 py-2',
            'border border-white/60',
            'bg-white/75 backdrop-blur-[18px]',
            'text-[#1C1F26] text-[14px]',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
            'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
            'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
            'transition-all cursor-pointer appearance-none'
          )}>
            <option value="all">Все статусы</option>
            <option value="published">Опубликовано</option>
            <option value="pending">На модерации</option>
            <option value="reported">Жалобы</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {mockListings.map(listing => (
          <div key={listing.id} className="flex items-center justify-between p-4 rounded-[14px] bg-gray-50 border border-gray-200">
            <div className="flex-1">
              <p className="font-medium text-[#1C1F26]">{listing.title}</p>
              <p className="text-[13px] text-[#6B7280]">
                {listing.status === 'published' ? 'Опубликовано' : listing.status === 'pending' ? 'На модерации' : 'Жалоба'} • 
                {listing.views} просмотров • {listing.createdAt}
                {listing.aiScore > 0 && (
                  <span className="ml-2 text-violet-600">AI: {listing.aiScore}%</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[12px] font-medium hover:bg-emerald-500"
                title="Отметить как проверено"
              >
                ✓ Проверено
              </button>
              <Link
                href={`/listings/${listing.id}`}
                className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-500"
              >
                Открыть
              </Link>
              <button
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-[#1C1F26] text-[12px] font-medium hover:bg-gray-200"
              >
                Редактировать
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-500"
                title="Заблокировать"
              >
                Блок
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// БРОНИРОВАНИЯ
// ═══════════════════════════════════════════════════════════════
function BookingsTab() {
  const mockBookings = [
    { id: '1', listing: 'Квартира в центре', guest: 'Иван И.', status: 'confirmed', date: '2026-02-01', price: 30000 },
    { id: '2', listing: 'Студия у метро', guest: 'Мария П.', status: 'pending', date: '2026-02-05', price: 25000 },
    { id: '3', listing: 'Дом в Сочи', guest: 'Петр С.', status: 'cancelled', date: '2026-02-10', price: 50000 },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Бронирования</h2>
      <div className="space-y-3">
        {mockBookings.map(booking => (
          <div key={booking.id} className="flex items-center justify-between p-4 rounded-[14px] bg-gray-50 border border-gray-200">
            <div className="flex-1">
              <p className="font-medium text-[#1C1F26]">{booking.listing}</p>
              <p className="text-[13px] text-[#6B7280]">
                {booking.guest} • {booking.date} • {formatPrice(booking.price, 'month')}
              </p>
            </div>
            <span className={cn(
              'px-3 py-1 rounded-lg text-[12px] font-medium',
              booking.status === 'confirmed'
                ? 'bg-emerald-100 text-emerald-700'
                : booking.status === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            )}>
              {booking.status === 'confirmed' ? 'Подтверждено' : booking.status === 'pending' ? 'Ожидает' : 'Отменено'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ОТЗЫВЫ
// ═══════════════════════════════════════════════════════════════
function ReviewsTab() {
  const mockReviews = [
    { id: '1', listing: 'Квартира в центре', author: 'Иван И.', rating: 5, text: 'Отличная квартира!', date: '2026-01-20' },
    { id: '2', listing: 'Студия у метро', author: 'Мария П.', rating: 4, text: 'Хорошо, но шумно.', date: '2026-01-19' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Отзывы</h2>
      <div className="space-y-3">
        {mockReviews.map(review => (
          <div key={review.id} className="p-4 rounded-[14px] bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-[#1C1F26]">{review.listing}</p>
                <p className="text-[13px] text-[#6B7280]">{review.author} • {review.date}</p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={cn('w-4 h-4', i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300')} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-[14px] text-[#6B7280]">{review.text}</p>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-[12px] font-medium hover:bg-red-200">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// AI-АНАЛИТИКА
// ═══════════════════════════════════════════════════════════════
function AiAnalyticsTab() {
  const mockAiStats = {
    quality: 87,
    popularParams: [
      { param: 'Город: Москва', count: 3421 },
      { param: 'Бюджет: 25,000-35,000₽', count: 2890 },
      { param: 'Комнаты: 2', count: 2156 },
    ],
    errors: [
      { type: 'Низкая точность цены', count: 12 },
      { type: 'Ошибки в рекомендациях', count: 5 },
    ],
    suggestions: [
      'AI рекомендует улучшить описание объявлений в районе "Центр"',
      'Увеличить точность оценки цены для студий',
    ],
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">AI-аналитика</h2>

      {/* Качество рекомендаций */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <h3 className="text-[16px] font-bold text-[#1C1F26] mb-4">Качество рекомендаций</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[48px] font-bold text-violet-600">{mockAiStats.quality}</span>
            <span className="text-[18px] text-[#6B7280]">%</span>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-600 rounded-full transition-all"
                style={{ width: `${mockAiStats.quality}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Популярные параметры */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <h3 className="text-[16px] font-bold text-[#1C1F26] mb-4">Популярные параметры поиска</h3>
        <div className="space-y-2">
          {mockAiStats.popularParams.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-[12px]">
              <span className="text-[14px] text-[#1C1F26]">{item.param}</span>
              <span className="text-[14px] font-semibold text-violet-600">{item.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ошибки AI */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <h3 className="text-[16px] font-bold text-[#1C1F26] mb-4">Ошибки AI</h3>
        <div className="space-y-2">
          {mockAiStats.errors.map((error, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-[12px] border border-red-100">
              <span className="text-[14px] text-[#1C1F26]">{error.type}</span>
              <span className="text-[14px] font-semibold text-red-600">{error.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Предложения улучшения */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <h3 className="text-[16px] font-bold text-[#1C1F26] mb-4">Предложения улучшения</h3>
        <div className="space-y-3">
          {mockAiStats.suggestions.map((suggestion, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-violet-50 rounded-[12px] border border-violet-100">
              <svg className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-[14px] text-[#1C1F26]">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ЮНИТ-ЭКОНОМИКА
// ═══════════════════════════════════════════════════════════════
function EconomicsTab() {
  const mockEconomics = {
    totalRevenue: 2450000, // Общий доход
    totalCosts: 1800000, // Общие затраты
    profit: 650000, // Прибыль
    margin: 26.5, // Маржа %
    cac: 1200, // Customer Acquisition Cost
    ltv: 8500, // Lifetime Value
    ltvCacRatio: 7.1, // LTV/CAC
    arpu: 3200, // Average Revenue Per User
    churnRate: 4.2, // Отток %
    growthRate: 18.5, // Рост %
    aiRecommendations: [
      {
        id: '1',
        title: 'Оптимизация CAC',
        description: 'Снижение стоимости привлечения клиента на 15% за счет улучшения конверсии воронки',
        impact: 'high',
        potentialSavings: 180000,
        action: 'Улучшить UX регистрации и добавить реферальную программу'
      },
      {
        id: '2',
        title: 'Увеличение LTV',
        description: 'Повышение среднего времени использования платформы на 20%',
        impact: 'high',
        potentialSavings: 320000,
        action: 'Внедрить программу лояльности и улучшить рекомендации AI'
      },
      {
        id: '3',
        title: 'Снижение оттока',
        description: 'Уменьшение churn rate с 4.2% до 3.0% за счет улучшения качества объявлений',
        impact: 'medium',
        potentialSavings: 95000,
        action: 'Усилить модерацию и улучшить AI-фильтрацию'
      },
      {
        id: '4',
        title: 'Оптимизация маржи',
        description: 'Увеличение маржинальности на 5% за счет оптимизации операционных затрат',
        impact: 'medium',
        potentialSavings: 122500,
        action: 'Автоматизировать процессы модерации и поддержки'
      }
    ],
    metrics: [
      { label: 'CAC', value: '1 200 ₽', trend: -8.5, status: 'good' },
      { label: 'LTV', value: '8 500 ₽', trend: +12.3, status: 'good' },
      { label: 'LTV/CAC', value: '7.1x', trend: +15.2, status: 'excellent' },
      { label: 'ARPU', value: '3 200 ₽', trend: +5.7, status: 'good' },
      { label: 'Churn', value: '4.2%', trend: -2.1, status: 'warning' },
      { label: 'Growth', value: '+18.5%', trend: +3.2, status: 'good' }
    ]
  }

  return (
    <div className="space-y-6" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', scrollBehavior: 'smooth' }}>
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Юнит-экономика</h2>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#6B7280]">Общий доход</span>
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{formatPrice(mockEconomics.totalRevenue)}</p>
          <p className="text-[12px] text-emerald-600 mt-1">+12.5% за месяц</p>
        </div>

        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#6B7280]">Прибыль</span>
            <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{formatPrice(mockEconomics.profit)}</p>
          <p className="text-[12px] text-[#6B7280] mt-1">Маржа: {mockEconomics.margin}%</p>
        </div>

        <div className={cn(
          'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
          'border border-white/60',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#6B7280]">LTV/CAC</span>
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-[28px] font-bold text-[#1C1F26]">{mockEconomics.ltvCacRatio}x</p>
          <p className="text-[12px] text-emerald-600 mt-1">Отличный показатель</p>
        </div>
      </div>

      {/* Детальные метрики */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <h3 className="text-[16px] font-bold text-[#1C1F26] mb-4">Ключевые метрики</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockEconomics.metrics.map((metric, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-[12px]">
              <p className="text-[12px] text-[#6B7280] mb-1">{metric.label}</p>
              <p className="text-[18px] font-bold text-[#1C1F26] mb-1">{metric.value}</p>
              <p className={cn(
                'text-[11px] font-medium',
                metric.trend > 0 ? 'text-emerald-600' : 'text-red-600'
              )}>
                {metric.trend > 0 ? '+' : ''}{metric.trend}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Рекомендации */}
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <h3 className="text-[16px] font-bold text-[#1C1F26]">AI Рекомендации по оптимизации</h3>
        </div>
        <div className="space-y-4">
          {mockEconomics.aiRecommendations.map(rec => (
            <div key={rec.id} className={cn(
              'p-5 rounded-[14px] border',
              rec.impact === 'high'
                ? 'bg-violet-50 border-violet-200'
                : 'bg-blue-50 border-blue-200'
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[15px] font-semibold text-[#1C1F26]">{rec.title}</h4>
                    <span className={cn(
                      'px-2 py-0.5 rounded-md text-[11px] font-medium',
                      rec.impact === 'high'
                        ? 'bg-violet-600 text-white'
                        : 'bg-blue-600 text-white'
                    )}>
                      {rec.impact === 'high' ? 'Высокий приоритет' : 'Средний приоритет'}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mb-2">{rec.description}</p>
                  <p className="text-[13px] font-medium text-[#1C1F26] mb-2 flex items-start gap-2">
                    <svg className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>{rec.action}</span>
                  </p>
                  <p className="text-[13px] text-emerald-700 font-semibold">
                    Потенциальная экономия: {formatPrice(rec.potentialSavings)}/мес
                  </p>
                </div>
                <button className={cn(
                  'px-4 py-2 rounded-[12px] text-[13px] font-medium ml-4',
                  'bg-violet-600 text-white',
                  'hover:bg-violet-500 transition-colors'
                )}>
                  Применить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// МОДЕРАЦИЯ
// ═══════════════════════════════════════════════════════════════
function ModerationTab() {
  const mockReports = [
    { id: '1', listing: 'Квартира в центре', reason: 'Подозрительная цена', status: 'new', reportedBy: 'user1@example.com' },
    { id: '2', listing: 'Студия у метро', reason: 'Некорректное описание', status: 'reviewing', reportedBy: 'user2@example.com' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-bold text-[#1C1F26]">Модерация</h2>
      <div className="space-y-3">
        {mockReports.map(report => (
          <div key={report.id} className="p-4 rounded-[14px] bg-gray-50 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-[#1C1F26]">{report.listing}</p>
                <p className="text-[13px] text-[#6B7280] mb-2">
                  Причина: {report.reason} • Жалоба от: {report.reportedBy}
                </p>
                <span className={cn(
                  'px-3 py-1 rounded-lg text-[12px] font-medium',
                  report.status === 'new'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                )}>
                  {report.status === 'new' ? 'Новая' : 'На проверке'}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-[12px] bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-500">
                  Открыть
                </button>
                <button className="px-4 py-2 rounded-[12px] bg-emerald-600 text-white text-[13px] font-medium hover:bg-emerald-500">
                  Одобрить
                </button>
                <button className="px-4 py-2 rounded-[12px] bg-red-600 text-white text-[13px] font-medium hover:bg-red-500">
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
      <div className={cn(
        'bg-white/[0.75] backdrop-blur-[22px] rounded-[18px] p-6',
        'border border-white/60',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]'
      )}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">AI точность (порог)</label>
            <input
              type="number"
              defaultValue={75}
              min={0}
              max={100}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Автомодерация</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-violet-600" />
              <span className="text-[14px] text-[#1C1F26]">Включить автоматическую модерацию</span>
            </label>
          </div>
          <button
            className={cn(
              'px-5 py-2.5 rounded-[14px]',
              'bg-violet-600 text-white font-semibold text-[14px]',
              'hover:bg-violet-500 transition-colors'
            )}
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  )
}
