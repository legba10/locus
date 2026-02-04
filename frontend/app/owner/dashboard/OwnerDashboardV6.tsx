'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'

type DashboardTab = 'listings' | 'add' | 'bookings' | 'messages' | 'analytics' | 'profile'

/**
 * OwnerDashboardV6 — Кабинет арендодателя с sidebar
 * 
 * Структура:
 * Sidebar:
 * - Мои объявления
 * - Добавить объявление
 * - Бронирования
 * - Сообщения
 * - Аналитика
 * - Профиль
 */
export function OwnerDashboardV6() {
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<DashboardTab>('listings')

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[#1C1F26] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-violet-600 hover:text-violet-700 text-[14px]">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ═══════════════════════════════════════════════════════════════
              SIDEBAR
              ═══════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-1">
            <div className={cn(
              'bg-white/[0.75] backdrop-blur-[22px]',
              'rounded-[20px]',
              'border border-white/60',
              'shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
              'p-6 sticky top-6'
            )}>
              <h2 className="text-[18px] font-bold text-[#1C1F26] mb-6">Кабинет</h2>
              
              <nav className="space-y-1">
                {[
                  { id: 'listings' as DashboardTab, label: 'Мои объявления', icon: '🏠' },
                  { id: 'add' as DashboardTab, label: 'Добавить объявление', icon: '➕' },
                  { id: 'bookings' as DashboardTab, label: 'Бронирования', icon: '📅' },
                  { id: 'messages' as DashboardTab, label: 'Сообщения', icon: '💬' },
                  { id: 'analytics' as DashboardTab, label: 'Аналитика', icon: '📊' },
                  { id: 'profile' as DashboardTab, label: 'Профиль', icon: '👤' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-[12px]',
                      'text-[14px] font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-violet-600 text-white'
                        : 'text-[#6B7280] hover:bg-gray-100'
                    )}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ═══════════════════════════════════════════════════════════════
              ОСНОВНОЙ КОНТЕНТ
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3">
            {activeTab === 'listings' && <MyListingsTab />}
            {activeTab === 'add' && <AddListingTab />}
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'profile' && <ProfileTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Мои объявления
function MyListingsTab() {
  const { data, isLoading } = useFetch<{ items: any[] }>(
    ['owner-listings'],
    '/api/listings?limit=50'
  )

  const listings = data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1C1F26]">Мои объявления</h1>
        <Link
          href="/owner/listings/new"
          className={cn(
            'px-5 py-2.5 rounded-[14px]',
            'bg-violet-600 text-white font-semibold text-[14px]',
            'hover:bg-violet-500 transition-colors'
          )}
        >
          + Добавить объявление
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-[18px] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <div className={cn(
          'bg-white rounded-[18px] p-12 text-center',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <p className="text-[16px] text-[#6B7280] mb-4">У вас пока нет объявлений</p>
          <Link
            href="/owner/listings/new"
            className={cn(
              'inline-block px-5 py-2.5 rounded-[14px]',
              'bg-violet-600 text-white font-semibold text-[14px]',
              'hover:bg-violet-500 transition-colors'
            )}
          >
            Создать первое объявление
          </Link>
        </div>
      )}

      {!isLoading && listings.length > 0 && (
        <div className="space-y-4">
          {listings.map((listing: any) => (
            <div
              key={listing.id}
              className={cn(
                'bg-white rounded-[18px] p-6',
                'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
                'border border-gray-100/80'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-[18px] font-bold text-[#1C1F26] mb-2">{listing.title}</h3>
                  <p className="text-[14px] text-[#6B7280] mb-3">
                    {listing.city} • {formatPrice(listing.basePrice || listing.pricePerNight, 'month')}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      'px-3 py-1 rounded-lg text-[12px] font-medium',
                      listing.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {listing.status === 'PUBLISHED' ? 'Активно' : 'Скрыто'}
                    </span>
                    <span className="text-[13px] text-[#6B7280]">
                      👁 {listing.views || 0} просмотров
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/listings/${listing.id}`}
                    className={cn(
                      'px-4 py-2 rounded-[12px]',
                      'bg-gray-100 text-[#1C1F26] text-[13px] font-medium',
                      'hover:bg-gray-200 transition-colors'
                    )}
                  >
                    Открыть
                  </Link>
                  <button
                    className={cn(
                      'px-4 py-2 rounded-[12px]',
                      'bg-violet-600 text-white text-[13px] font-medium',
                      'hover:bg-violet-500 transition-colors'
                    )}
                  >
                    Редактировать
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

// Добавить объявление
function AddListingTab() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    price: '',
    rooms: '',
    area: '',
    type: 'apartment',
  })

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Добавить объявление</h1>

      <div className={cn(
        'bg-white rounded-[18px] p-6',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <form className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Название</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Квартира в центре"
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опишите ваше жильё..."
              rows={5}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400',
                'resize-none'
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Город</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              >
                <option value="">Выберите город</option>
                <option value="Москва">Москва</option>
                <option value="Санкт-Петербург">Санкт-Петербург</option>
                <option value="Казань">Казань</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Цена (₽/мес)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="30000"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Комнаты</label>
              <input
                type="number"
                value={formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                placeholder="2"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Площадь (м²)</label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="50"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Тип жилья</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            >
              <option value="apartment">Квартира</option>
              <option value="room">Комната</option>
              <option value="house">Дом</option>
              <option value="studio">Студия</option>
            </select>
          </div>

          <button
            type="submit"
            className={cn(
              'w-full py-3 rounded-[14px]',
              'bg-violet-600 text-white font-semibold text-[15px]',
              'hover:bg-violet-500 transition-colors',
              'shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
            )}
          >
            Создать объявление
          </button>
        </form>
      </div>
    </div>
  )
}

// Бронирования
function BookingsTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Бронирования</h1>
      <div className={cn(
        'bg-white rounded-[18px] p-8 text-center',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <p className="text-[15px] text-[#6B7280]">Пока нет бронирований.</p>
      </div>
    </div>
  )
}

// Сообщения
function MessagesTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Сообщения</h1>
      <div className={cn(
        'bg-white rounded-[18px] p-12 text-center',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <p className="text-[16px] text-[#6B7280]">Сообщения скоро появятся</p>
      </div>
    </div>
  )
}

// Аналитика
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Аналитика</h1>
      <div className={cn(
        'bg-white rounded-[18px] p-12 text-center',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <p className="text-[16px] text-[#6B7280]">Аналитика скоро появится</p>
      </div>
    </div>
  )
}

// Профиль
function ProfileTab() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Профиль</h1>
      <div className={cn(
        'bg-white rounded-[18px] p-6',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-gray-50',
                'text-[#1C1F26] text-[14px]'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Имя</label>
            <input
              type="text"
              value={user?.full_name || ''}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
