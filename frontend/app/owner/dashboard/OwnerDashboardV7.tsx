'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { formatPrice } from '@/core/i18n/ru'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { CityInput } from '@/shared/components/CityInput'
import { UpgradeModal } from '@/components/upgradeModal/UpgradeModal'
import type { UserPlan } from '@/shared/contracts/api'
import { PlanBadge } from '@/components/planBadge/PlanBadge'
import { LockedFeatureCard } from '@/components/paywall/LockedFeatureCard'

type DashboardTab = 'listings' | 'add' | 'bookings' | 'messages' | 'analytics' | 'profile'

/**
 * OwnerDashboardV7 — Полный кабинет арендодателя
 * 
 * Разделы:
 * 1. Мои объявления (с метриками, статусами, действиями)
 * 2. Добавить объявление (форма с drag&drop фото)
 * 3. Бронирования (список с действиями)
 * 4. Сообщения
 * 5. Аналитика (графики, KPI)
 * 6. Профиль
 */
export function OwnerDashboardV7() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<DashboardTab>('listings')
  const [editingListing, setEditingListing] = useState<any | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<"limit" | "analytics" | "ai" | "general">("general")
  const tariff = user?.tariff ?? 'free'

  const plan: UserPlan = (user?.plan as UserPlan | undefined) ?? (tariff === 'landlord_pro' ? 'AGENCY' : tariff === 'landlord_basic' ? 'PRO' : 'FREE')
  const listingLimit = user?.listingLimit ?? 1
  const listingUsed = (user as any)?.listingUsed ?? 0
  const isFreePlan = plan === 'FREE'
  const canCreate = listingUsed < listingLimit

  useEffect(() => {
    const tab = searchParams.get('tab') as DashboardTab | null
    if (tab && ['listings', 'add', 'bookings', 'messages', 'analytics', 'profile'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

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
        {isFreePlan && (
          <div className="mb-6 rounded-[16px] border border-violet-100 bg-violet-50 px-5 py-4 text-[14px] text-violet-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <PlanBadge plan={plan} />
              <span>Ваш тариф: {plan}. Доступно: {listingLimit} • Использовано: {listingUsed}.</span>
            </div>
            <button
              type="button"
              onClick={() => { setUpgradeReason("general"); setUpgradeOpen(true); }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-[10px] bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-500"
            >
              Улучшить тариф
            </button>
          </div>
        )}
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
                  { id: 'listings' as DashboardTab, label: 'Мои объявления', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )},
                  { id: 'add' as DashboardTab, label: 'Добавить объявление', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ) },
                  { id: 'bookings' as DashboardTab, label: 'Бронирования', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )},
                  { id: 'messages' as DashboardTab, label: 'Сообщения', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )},
                  { id: 'analytics' as DashboardTab, label: 'Аналитика', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ), lockable: true },
                  { id: 'profile' as DashboardTab, label: 'Профиль', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )},
                ].map(tab => {
                  const isLocked = tab.id === "analytics" && isFreePlan;
                  return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isLocked) {
                        setUpgradeReason(tab.id === 'analytics' ? "analytics" : "general");
                        setUpgradeOpen(true);
                        return;
                      }
                      setActiveTab(tab.id)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-[12px]',
                      'text-[14px] font-medium transition-all',
                      'flex items-center gap-2',
                      activeTab === tab.id
                        ? 'bg-violet-600 text-white'
                        : 'text-[#6B7280] hover:bg-gray-100',
                      isLocked && 'opacity-80'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                    {isLocked && <span className="ml-auto text-[12px] font-semibold">🔒 PRO</span>}
                  </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* ═══════════════════════════════════════════════════════════════
              ОСНОВНОЙ КОНТЕНТ
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3">
            {activeTab === 'listings' && (
              <MyListingsTab
                onAdd={() => {
                  setEditingListing(null)
                  setActiveTab('add')
                }}
                onEdit={(listing) => {
                  setEditingListing(listing)
                  setActiveTab('add')
                }}
                plan={plan}
                listingLimit={listingLimit}
                onUpgrade={(reason) => { setUpgradeReason(reason); setUpgradeOpen(true); }}
              />
            )}
            {activeTab === 'add' && (
              <AddListingTab
                onSuccess={() => {
                  setEditingListing(null)
                  setActiveTab('listings')
                }}
                onCancel={() => {
                  setEditingListing(null)
                  setActiveTab('listings')
                }}
                initialListing={editingListing}
                onLimitReached={() => { router.push("/pricing?reason=limit"); }}
              />
            )}
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'analytics' && (
              isFreePlan ? (
                <LockedFeatureCard
                  title="Подробная аналитика"
                  description="Графики просмотров, источники трафика и статистика по дням доступны на PRO."
                  ctaHref="/pricing?reason=analytics"
                />
              ) : (
                <AnalyticsTab />
              )
            )}
            {activeTab === 'profile' && <ProfileTab />}
          </div>
        </div>
      </div>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlan={plan}
        reason={upgradeReason}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// МОИ ОБЪЯВЛЕНИЯ
// ═══════════════════════════════════════════════════════════════
function MyListingsTab({
  onAdd,
  onEdit,
  plan,
  listingLimit,
  onUpgrade,
}: {
  onAdd: () => void;
  onEdit: (listing: any) => void;
  plan: UserPlan;
  listingLimit: number;
  onUpgrade: (reason: "limit" | "analytics" | "ai" | "general") => void;
}) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useFetch<{ items: any[] }>(
    ['owner-listings'],
    '/api/listings/my'
  )

  const listings = data?.items || []
  const used = listings.length
  const canCreate = used < listingLimit

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1C1F26]">Мои объявления</h1>
        <button
          type="button"
          onClick={canCreate ? onAdd : () => onUpgrade("limit")}
          className={cn(
            'px-5 py-2.5 rounded-[14px]',
            canCreate ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            'font-semibold text-[14px] transition-colors'
          )}
        >
          {canCreate ? '+ Добавить объявление' : '➕ Добавить объявление 🔒'}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-[16px] border border-gray-100/80 bg-white px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <PlanBadge plan={plan} />
          <div className="text-[13px] text-[#6B7280]">
            Использовано <span className="font-semibold text-[#1C1F26]">{used}</span> из{" "}
            <span className="font-semibold text-[#1C1F26]">{listingLimit}</span> объявлений
          </div>
        </div>
        {plan === "FREE" && (
          <button
            type="button"
            onClick={() => onUpgrade("general")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[12px] text-center text-[13px] font-semibold bg-violet-600 text-white hover:bg-violet-500"
          >
            Улучшить тариф
          </button>
        )}
      </div>

      {!canCreate && (
        <div className={cn(
          'bg-white rounded-[16px] p-5',
          'border border-gray-100/80',
          'shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
        )}>
          <p className="text-[14px] text-[#6B7280] mb-3">
            У вас бесплатный тариф. Вы уже разместили {used} объявление.
          </p>
          <button
            type="button"
            onClick={() => onUpgrade("limit")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[12px] text-center text-[13px] font-semibold bg-violet-600 text-white hover:bg-violet-500"
          >
            Перейти на тариф
          </button>
        </div>
      )}

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
          <button
            type="button"
            onClick={canCreate ? onAdd : undefined}
            disabled={!canCreate}
            className={cn(
              'inline-block px-5 py-2.5 rounded-[14px]',
              canCreate ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              'font-semibold text-[14px] transition-colors'
            )}
          >
            Создать первое объявление
          </button>
          {!canCreate && (
            <p className="mt-3 text-[13px] text-[#9CA3AF]">
              Добавление объявлений доступно на платном тарифе.
            </p>
          )}
        </div>
      )}

      {!isLoading && listings.length > 0 && (
        <div className="space-y-4 scroll-container max-h-[70vh] lg:max-h-[calc(100vh-250px)] overflow-y-auto">
          {listings.map((listing: any) => (
            <div
              key={listing.id}
              className={cn(
                'bg-white rounded-[18px] p-6',
                'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
                'border border-gray-100/80'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Фото */}
                <div className="w-32 h-24 rounded-[12px] overflow-hidden bg-gray-100 flex-shrink-0">
                  {(listing.photos?.[0]?.url || listing.images?.[0]?.url) ? (
                    <Image
                      src={listing.photos?.[0]?.url || listing.images?.[0]?.url || ''}
                      alt={listing.title}
                      width={128}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized={(listing.photos?.[0]?.url || listing.images?.[0]?.url || '').startsWith('http')}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] text-[12px]">
                      Нет фото
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1">
                  <h3 className="text-[18px] font-bold text-[#1C1F26] mb-2">
                    {(() => {
                      let cleanTitle = listing.title || 'Без названия'
                      cleanTitle = cleanTitle
                        .replace(/квартира рядом с метро #?\d*/gi, '')
                        .replace(/тихая квартира #?\d*/gi, '')
                        .replace(/рядом с метро #?\d*/gi, '')
                        .replace(/метро #?\d*/gi, '')
                        .replace(/квартира #?\d*/gi, '')
                        .trim()
                      if (!cleanTitle || cleanTitle.length < 3) {
                        cleanTitle = `Квартира ${listing.city || ''}`.trim() || 'Без названия'
                      }
                      return cleanTitle
                    })()}
                  </h3>
                  <p className="text-[14px] text-[#6B7280] mb-3">
                    {listing.city} • {formatPrice(listing.basePrice || listing.pricePerNight, 'month')}
                  </p>
                  
                  {/* Метрики */}
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-[13px] text-[#6B7280]">{listing.viewsCount || listing.views || 0} просмотров</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[13px] text-[#6B7280]">{listing.bookingsCount ?? listing.bookings?.length ?? 0} бронирований</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[13px] text-[#6B7280]">{listing.favoritesCount ?? 0} в избранном</span>
                    </div>
                    {listing.aiScore && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[13px] text-violet-600 font-medium">AI: {listing.aiScore}%</span>
                      </div>
                    )}
                  </div>

                  {plan === "FREE" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="rounded-[14px] border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-[13px] text-[#1C1F26]">📊 Подробная аналитика</div>
                          <button
                            type="button"
                            onClick={() => onUpgrade("analytics")}
                            className="text-[12px] font-semibold text-violet-700 hover:text-violet-800"
                          >
                            🔒 PRO
                          </button>
                        </div>
                        <div className="mt-1 text-[12px] text-[#6B7280]">Графики, источники трафика, статистика по дням</div>
                      </div>
                      <div className="rounded-[14px] border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-[13px] text-[#1C1F26]">🤖 AI‑анализ цены</div>
                          <button
                            type="button"
                            onClick={() => onUpgrade("ai")}
                            className="text-[12px] font-semibold text-violet-700 hover:text-violet-800"
                          >
                            🔒 PRO
                          </button>
                        </div>
                        <div className="mt-1 text-[12px] text-[#6B7280]">Рекомендации цены и рисков по объявлению</div>
                      </div>
                    </div>
                  )}

                  {/* Статус и действия */}
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'px-3 py-1 rounded-lg text-[12px] font-medium',
                      listing.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : listing.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {listing.status === 'PUBLISHED' ? 'Опубликовано' : listing.status === 'PENDING' ? 'На модерации' : 'Скрыто'}
                    </span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className={cn(
                          'px-4 py-2 rounded-[12px] w-full sm:w-auto text-center',
                          'bg-gray-100 text-[#1C1F26] text-[13px] font-medium',
                          'hover:bg-gray-200 transition-colors'
                        )}
                      >
                        Открыть
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(listing)}
                        className={cn(
                          'px-4 py-2 rounded-[12px] w-full sm:w-auto',
                          'bg-violet-600 text-white text-[13px] font-medium',
                          'hover:bg-violet-500 transition-colors'
                        )}
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('Удалить объявление без возможности восстановления?')) return
                          await apiFetch(`/listings/${encodeURIComponent(listing.id)}`, { method: 'DELETE' })
                          await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
                        }}
                        className={cn(
                          'px-4 py-2 rounded-[12px] w-full sm:w-auto',
                          'bg-red-100 text-red-700 text-[13px] font-medium',
                          'hover:bg-red-200 transition-colors'
                        )}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
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
// ДОБАВИТЬ ОБЪЯВЛЕНИЕ
// ═══════════════════════════════════════════════════════════════
function AddListingTab({
  onSuccess,
  onCancel,
  initialListing,
  onLimitReached,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialListing?: any | null;
  onLimitReached?: () => void;
}) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(initialListing?.id)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    price: '',
    rooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    type: 'apartment',
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<Array<{ id: string; url: string }>>([])
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialListing) {
      setFormData({
        title: '',
        description: '',
        city: '',
        price: '',
        rooms: '',
        area: '',
        floor: '',
        totalFloors: '',
        type: 'apartment',
      })
      setPhotos([])
      setExistingPhotos([])
      return
    }

    const houseRules = initialListing.houseRules || {}
    setFormData({
      title: initialListing.title ?? '',
      description: initialListing.description ?? '',
      city: initialListing.city ?? '',
      price: String(initialListing.basePrice ?? ''),
      rooms: String(initialListing.bedrooms ?? ''),
      area: String(houseRules.area ?? ''),
      floor: String(houseRules.floor ?? ''),
      totalFloors: String(houseRules.totalFloors ?? ''),
      type: houseRules.type ?? initialListing.type ?? 'apartment',
    })
    setPhotos([])
    setExistingPhotos(
      Array.isArray(initialListing.photos)
        ? initialListing.photos.map((p: any) => ({ id: p.id, url: p.url }))
        : []
    )
  }, [initialListing])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setPhotos(prev => [...prev, ...newFiles].slice(0, 10))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhotos(prev => [...prev, ...newFiles].slice(0, 10))
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = async (photoId: string) => {
    if (!initialListing?.id) return
    await apiFetch(`/listings/${encodeURIComponent(initialListing.id)}/photos/${encodeURIComponent(photoId)}`, {
      method: 'DELETE',
    })
    setExistingPhotos(prev => prev.filter((p) => p.id !== photoId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const title = formData.title.trim()
      const description = formData.description.trim()
      const city = formData.city.trim()
      const price = Number(formData.price)
      const rooms = Number(formData.rooms || '0')
      const area = Number(formData.area || '0')
      const floor = Number(formData.floor || '0')
      const totalFloors = Number(formData.totalFloors || '0')

      if (!title || !description || !city || !price || Number.isNaN(price)) {
        setError('Заполните название, описание, город и цену')
        setIsSubmitting(false)
        return
      }

      if (photos.length + existingPhotos.length === 0) {
        setError('Добавьте хотя бы одно фото')
        setIsSubmitting(false)
        return
      }

      const listingType = formData.type ? formData.type.toUpperCase() : 'APARTMENT'
      const payload: any = {
        title,
        description,
        city,
        basePrice: price,
        capacityGuests: 2,
        bedrooms: rooms || 1,
        bathrooms: 1,
        type: listingType,
        houseRules: {},
      }

      if (area) {
        payload.houseRules = {
          ...(payload.houseRules || {}),
          area,
          floor,
          totalFloors,
          type: formData.type,
        }
      }

      let listingId = initialListing?.id as string | undefined
      if (isEdit) {
        await apiFetchJson(`/listings/${encodeURIComponent(listingId)}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        const createData = await apiFetchJson<{ item?: { id: string }; id?: string; listingId?: string }>(
          '/listings',
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
        )

        listingId =
          createData?.listing?.id ?? createData?.item?.id ?? createData?.id ?? createData?.listingId

        if (!listingId) {
          throw new Error('Сервер не вернул ID нового объявления')
        }
      }

      // 2) Загружаем новые фото через /api/listings/{id}/photos
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const form = new FormData()
        form.append('file', file)
        form.append('sortOrder', String(i))

        await apiFetch(
          `/listings/${encodeURIComponent(listingId)}/photos`,
          {
            method: 'POST',
            body: form,
          },
        )
      }

      // 3) Публикуем объявление (только для создания)
      if (!isEdit) {
        await apiFetch(
          `/listings/${encodeURIComponent(listingId)}/publish`,
          { method: 'POST' },
        )
      }

      // 4) Обновляем список объявлений без перезагрузки
      await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })

      // 5) Сбрасываем форму
      setFormData({
        title: '',
        description: '',
        city: '',
        price: '',
        rooms: '',
        area: '',
        floor: '',
        totalFloors: '',
        type: 'apartment',
      })
      setPhotos([])
      setExistingPhotos([])

      // 6) Автоматически переключаемся на вкладку "Мои объявления"
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      if (err?.code === "LIMIT_REACHED") {
        onLimitReached?.()
        setError(err?.message ?? 'Лимит объявлений исчерпан')
      } else {
        const message =
          err instanceof Error ? err.message : 'Ошибка при сохранении объявления'
        setError(message)
      }
      // eslint-disable-next-line no-console
      console.error('Create listing error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">
        {isEdit ? 'Редактировать объявление' : 'Добавить объявление'}
      </h1>

      <div className={cn(
        'bg-white rounded-[18px] p-6',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Фото (drag&drop) */}
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Фотографии</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-[14px] p-8 text-center transition-colors',
                dragActive ? 'border-violet-400 bg-violet-50' : 'border-gray-300 bg-gray-50'
              )}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[14px] text-[#6B7280] mb-1">
                  Перетащите фото сюда или <span className="text-violet-600">выберите файлы</span>
                </p>
                <p className="text-[12px] text-[#6B7280]">До 10 фотографий</p>
              </label>
            </div>
            
            {/* Текущие фото (edit) */}
            {existingPhotos.length > 0 && (
              <div className="mt-4">
                <p className="text-[12px] text-[#6B7280] mb-2">Текущие фотографии</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-100">
                      <Image src={photo.url} alt="Existing photo" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(photo.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Превью новых фото */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-100">
                    <Image
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              <CityInput
                value={formData.city}
                onChange={(value) => setFormData({ ...formData, city: value })}
                placeholder="Выберите город"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Этаж</label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="3"
                className={cn(
                  'w-full rounded-[14px] px-4 py-3',
                  'border border-gray-200/60 bg-white/95',
                  'text-[#1C1F26] text-[14px]',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
                )}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Этажей в доме</label>
              <input
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                placeholder="9"
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

          {/* AI-подсказки (mock) */}
          <div className={cn(
            'bg-violet-50/80 rounded-[14px] p-4',
            'border border-violet-100'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-[13px] font-semibold text-violet-600">AI-подсказки</span>
            </div>
            <ul className="space-y-1 text-[12px] text-[#6B7280]">
              <li>• Добавьте минимум 5 фотографий для лучшего результата</li>
              <li>• Подробное описание увеличивает просмотры на 30%</li>
              <li>• Цена в диапазоне 25,000-35,000₽ имеет высокий спрос</li>
            </ul>
          </div>

          {error && (
            <p className="text-[13px] text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full py-3 rounded-[14px]',
                'bg-violet-600 text-white font-semibold text-[15px]',
                'hover:bg-violet-500 transition-colors',
                'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
                isSubmitting && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (isEdit ? 'Сохранение...' : 'Создание...') : (isEdit ? 'Сохранить' : 'Создать объявление')}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={cn(
                  'w-full py-3 rounded-[14px]',
                  'border border-gray-200 text-[#1C1F26] text-[15px] font-semibold',
                  'hover:bg-gray-50 transition-colors'
                )}
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// БРОНИРОВАНИЯ
// ═══════════════════════════════════════════════════════════════
function BookingsTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Бронирования</h1>
      <div className={cn(
        'bg-white rounded-[18px] p-8 text-center',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <p className="text-[15px] text-[#6B7280]">
          Пока нет бронирований. Заявки появятся после первых арендаторов.
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// СООБЩЕНИЯ
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// АНАЛИТИКА — Расширенная версия с AI функциями
// ═══════════════════════════════════════════════════════════════
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Аналитика</h1>
      <div className={cn(
        'bg-white rounded-[18px] p-8 text-center',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <p className="text-[15px] text-[#6B7280]">
          Данные появятся после первых просмотров и бронирований.
        </p>
      </div>
    </div>
  )
}

function PaidFeatureNotice() {
  return (
    <div className={cn(
      'bg-white rounded-[18px] p-8 text-center',
      'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
      'border border-gray-100/80'
    )}>
      <div className="text-4xl mb-3">🔒</div>
      <h2 className="text-[18px] font-bold text-[#1C1F26] mb-2">Функция доступна на платном тарифе</h2>
      <p className="text-[14px] text-[#6B7280]">
        Обновите тариф, чтобы добавлять объявления и смотреть аналитику.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
        <Link
          href="/pricing"
          className="px-4 py-2 rounded-[12px] text-center text-[13px] font-medium border border-gray-200 text-[#1C1F26] hover:bg-gray-50"
        >
          Посмотреть тарифы
        </Link>
        <Link
          href="/pricing#cta"
          className="px-4 py-2 rounded-[12px] text-center text-[13px] font-medium bg-violet-600 text-white hover:bg-violet-500"
        >
          Купить тариф
        </Link>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ПРОФИЛЬ
// ═══════════════════════════════════════════════════════════════
function ProfileTab() {
  const { user, refresh } = useAuthStore()
  const tariff = user?.tariff ?? 'free'
  const tariffLabel =
    tariff === 'landlord_basic' ? 'Basic' : tariff === 'landlord_pro' ? 'Pro' : 'Free'
  const plan: UserPlan = (user?.plan as UserPlan | undefined) ?? (tariff === 'landlord_pro' ? 'AGENCY' : tariff === 'landlord_basic' ? 'PRO' : 'FREE')
  const listingLimit = user?.listingLimit ?? (plan === 'AGENCY' ? 10 : plan === 'PRO' ? 5 : 1)
  const { data: mine } = useFetch<{ items: any[] }>(['owner-listings-profile'], '/api/listings/my')
  const used = mine?.items?.length ?? 0
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const isTelegramPhone = Boolean(user?.telegram_id && user?.phone)

  useEffect(() => {
    setFormData({
      fullName: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    })
  }, [user])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await apiFetchJson('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: formData.fullName.trim() || null,
          phone: formData.phone.trim() || null,
        }),
      })
      await refresh()
      setSuccess(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения профиля'
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Профиль</h1>
      <div className="rounded-[18px] border border-gray-100/80 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <PlanBadge plan={plan} />
              <div className="text-[14px] font-bold text-[#1C1F26]">Ваш тариф: {plan}</div>
            </div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              {used} из {listingLimit} объявлений использовано
            </div>
            <div className="mt-2 text-[13px] text-[#6B7280]">
              Перейти на PRO: до 5 объявлений • аналитика • продвижение
            </div>
          </div>
          {plan === "FREE" && (
            <Link
              href="/pricing?reason=profile_upsell"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-[14px] bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-500"
            >
              Улучшить тариф
            </Link>
          )}
        </div>
      </div>
      <div className={cn(
        'bg-white rounded-[18px] p-6',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-gray-100/80'
      )}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Имя</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-gray-50',
                'text-[#1C1F26] text-[14px]'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Тариф</label>
            <input
              type="text"
              value={tariffLabel}
              disabled
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-gray-200/60 bg-gray-50',
                'text-[#1C1F26] text-[14px]'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
              readOnly={isTelegramPhone}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                isTelegramPhone ? 'border border-gray-200/60 bg-gray-50' : 'border border-gray-200/60 bg-white/95',
                'text-[#1C1F26] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
              )}
            />
            {isTelegramPhone && (
              <p className="text-[12px] text-[#6B7280] mt-2">Подтверждён через Telegram</p>
            )}
          </div>
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          {success && <p className="text-[13px] text-emerald-600">Профиль обновлён</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'w-full py-3 rounded-[14px]',
              'bg-violet-600 text-white font-semibold text-[15px]',
              'hover:bg-violet-500 transition-colors',
              isSaving && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  )
}
