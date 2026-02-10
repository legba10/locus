'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { formatPrice, amenityLabel } from '@/core/i18n/ru'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { UpgradeModal } from '@/components/upgradeModal/UpgradeModal'
import type { UserPlan } from '@/shared/contracts/api'
import { PlanBadge } from '@/components/planBadge/PlanBadge'
import { LockedFeatureCard } from '@/components/paywall/LockedFeatureCard'
import { ListingWizard } from '@/domains/listings/ListingWizard'

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
        {!isLoading && listings.length > 0 && (
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
        )}
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
        <div className="flex flex-col gap-4 pb-[120px] scroll-container max-h-[70vh] lg:max-h-[calc(100vh-250px)] overflow-y-auto">
          {listings.map((listing: any) => {
            const cleanTitle = (() => {
              let t = listing.title || 'Без названия'
              t = t
                .replace(/квартира рядом с метро #?\d*/gi, '')
                .replace(/тихая квартира #?\d*/gi, '')
                .replace(/рядом с метро #?\d*/gi, '')
                .replace(/метро #?\d*/gi, '')
                .replace(/квартира #?\d*/gi, '')
                .trim()
              return (!t || t.length < 3) ? (`Квартира ${listing.city || ''}`.trim() || 'Без названия') : t
            })()
            const amenityKeys = (Array.isArray(listing.amenities)
              ? listing.amenities.map((x: any) => x?.amenity?.key ?? x?.amenity?.label ?? x).filter(Boolean)
              : []) as string[]

            return (
              <div
                key={listing.id}
                className="w-full rounded-[20px] bg-white p-4 flex flex-col gap-3 shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80"
              >
                {/* Фото — фиксированная высота, без дерганий */}
                <div className="relative w-full h-[180px] min-h-[180px] rounded-[14px] overflow-hidden bg-gray-100">
                  {(listing.photos?.[0]?.url || listing.images?.[0]?.url) ? (
                    <Image
                      src={listing.photos?.[0]?.url || listing.images?.[0]?.url || ''}
                      alt={cleanTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                      unoptimized={(listing.photos?.[0]?.url || listing.images?.[0]?.url || '').startsWith('http')}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] text-[12px]">
                      Нет фото
                    </div>
                  )}
                </div>

                {/* Заголовок */}
                <h3 className="text-[18px] font-semibold text-[#1C1F26] leading-tight line-clamp-2">
                  {cleanTitle}
                </h3>

                {/* Город + цена */}
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#6B7280]">{listing.city ?? '—'}</span>
                  <span className="text-[14px] font-medium text-[#1C1F26]">
                    {formatPrice(listing.basePrice || listing.pricePerNight, 'month')}
                  </span>
                </div>

                {/* Удобства — чипсы, русская локализация */}
                {amenityKeys.length > 0 && (
                  <div className="flex flex-wrap gap-[6px]">
                    {amenityKeys.slice(0, 8).map((key: string) => (
                      <span
                        key={key}
                        className="text-[12px] py-1.5 px-2.5 rounded-full bg-[#F3F4F6] text-[#4B5563]"
                      >
                        {amenityLabel(key)}
                      </span>
                    ))}
                    {amenityKeys.length > 8 && (
                      <span className="text-[12px] py-1.5 px-2.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                        +{amenityKeys.length - 8}
                      </span>
                    )}
                  </div>
                )}

                {/* Метрики */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#6B7280] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-[13px] text-[#6B7280]">{listing.viewsCount || listing.views || 0} просмотров</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#6B7280] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[13px] text-[#6B7280]">{listing.bookingsCount ?? listing.bookings?.length ?? 0} бронирований</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#6B7280] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[13px] text-[#6B7280]">{listing.favoritesCount ?? 0} в избранном</span>
                  </div>
                  {listing.aiScore != null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-violet-600 font-medium">AI: {listing.aiScore}%</span>
                    </div>
                  )}
                </div>

                {/* AI-блок: скрыт на mobile, compact на desktop */}
                {(() => {
                  const intel = (listing as any)?.intelligence as any | null | undefined
                  const recommendedPrice: number | null =
                    typeof intel?.recommendedPrice === 'number' ? intel.recommendedPrice : null
                  const diffPct: number | null =
                    typeof intel?.priceDeltaPercent === 'number' ? intel.priceDeltaPercent : null
                  const position: string | null = typeof intel?.marketPosition === 'string' ? intel.marketPosition : null

                  if (!recommendedPrice) {
                    if (plan !== 'FREE') return null
                    return (
                      <div className="hidden md:block rounded-[14px] border border-gray-100 bg-gray-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[13px] font-semibold text-[#1C1F26]">AI‑совет по цене</div>
                            <div className="mt-0.5 text-[12px] text-[#6B7280]">Доступен на PRO</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpgrade('ai')}
                            className="shrink-0 inline-flex items-center justify-center px-3 py-2 rounded-[12px] text-[12px] font-semibold bg-violet-600 text-white hover:bg-violet-500"
                          >
                            PRO
                          </button>
                        </div>
                      </div>
                    )
                  }

                  const direction =
                    position === 'below_market' ? 'ниже рынка' : position === 'above_market' ? 'выше рынка' : 'в рынке'
                  const diffText =
                    diffPct != null && Number.isFinite(diffPct) ? `${Math.abs(diffPct).toFixed(0)}% ${direction}` : direction

                  const apply = async () => {
                    if (plan === 'FREE') {
                      onUpgrade('ai')
                      return
                    }
                    await apiFetchJson(`/listings/${encodeURIComponent(String(listing.id))}`, {
                      method: 'PATCH',
                      body: JSON.stringify({ basePrice: recommendedPrice }),
                    })
                    await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
                  }

                  return (
                    <div className="hidden md:block rounded-[14px] border border-violet-100 bg-violet-50/70 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[13px] font-semibold text-violet-800">AI: цена {diffText}</div>
                          <div className="mt-0.5 text-[12px] text-[#6B7280]">
                            Рекомендуем <span className="font-semibold text-[#1C1F26]">{recommendedPrice.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void apply()}
                          className={cn(
                            'shrink-0 inline-flex items-center justify-center px-3 py-2 rounded-[12px] text-[12px] font-semibold',
                            plan === 'FREE'
                              ? 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
                              : 'bg-violet-600 text-white hover:bg-violet-500'
                          )}
                        >
                          {plan === 'FREE' ? 'Применить' : 'Применить'}
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* Баннер: на модерации */}
                {(listing.status === 'PENDING_REVIEW' || listing.status === 'PENDING') && (
                  <div className="rounded-[12px] bg-amber-50 border border-amber-200 p-3">
                    <p className="text-[13px] font-medium text-amber-800">На модерации</p>
                    <p className="text-[12px] text-amber-700 mt-0.5">Обычно проверка занимает до 24 часов. После одобрения объявление появится в каталоге.</p>
                  </div>
                )}
                {/* Статус + кнопки — сетка 3 колонки, без скачков */}
                <div className="flex flex-col gap-2">
                  {listing.status === 'REJECTED' && (listing.moderationComment || listing.moderation_comment) && (
                    <div className="rounded-[12px] bg-red-50 border border-red-100 p-3">
                      <p className="text-[12px] font-semibold text-red-800 mb-0.5">Причина отклонения</p>
                      <p className="text-[13px] text-red-700">{(listing.moderationComment ?? listing.moderation_comment) || '—'}</p>
                    </div>
                  )}
                  <span
                    className={cn(
                      'inline-flex w-fit px-3 py-1 rounded-lg text-[12px] font-medium',
                      listing.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : listing.status === 'PENDING_REVIEW' || listing.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : listing.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {listing.status === 'PUBLISHED' ? 'Опубликовано' : (listing.status === 'PENDING_REVIEW' || listing.status === 'PENDING') ? 'На модерации' : listing.status === 'REJECTED' ? 'Отклонено' : 'Скрыто'}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="px-3 py-2 rounded-[12px] text-center bg-gray-100 text-[#1C1F26] text-[13px] font-medium hover:bg-gray-200 transition-colors"
                    >
                      Открыть
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(listing)}
                      className={cn(
                        'px-3 py-2 rounded-[12px] text-[13px] font-medium transition-colors',
                        listing.status === 'REJECTED' ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-600 text-white hover:bg-violet-500'
                      )}
                    >
                      {listing.status === 'REJECTED' ? 'Исправить' : 'Редактировать'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Удалить объявление без возможности восстановления?')) return
                        await apiFetch(`/listings/${encodeURIComponent(listing.id)}`, { method: 'DELETE' })
                        await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
                      }}
                      className="px-3 py-2 rounded-[12px] bg-red-100 text-red-700 text-[13px] font-medium hover:bg-red-200 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
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
  return (
    <ListingWizard
      onSuccess={onSuccess}
      onCancel={onCancel}
      initialListing={initialListing}
      onLimitReached={onLimitReached}
    />
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
// СООБЩЕНИЯ — тот же список, что на /messages (имя, квартира, фото в круге)
// ═══════════════════════════════════════════════════════════════
type ChatItem = {
  id: string
  listingTitle?: string
  listingPhotoUrl?: string
  host: { id: string; profile?: { name?: string | null; avatarUrl?: string | null } | null }
  guest: { id: string; profile?: { name?: string | null; avatarUrl?: string | null } | null }
  messages: Array<{ text: string; createdAt: string; senderId: string }>
  unreadCount?: number
  updatedAt: string
}

function MessagesTab() {
  const { user } = useAuthStore()
  const currentUserId = user?.id ?? ''
  const { data: chats, isLoading } = useFetch<ChatItem[]>(['chats'], '/chats', { enabled: !!currentUserId })

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1C1F26]">Сообщения</h1>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-[18px] animate-pulse" />
          ))}
        </div>
      ) : Array.isArray(chats) && chats.length > 0 ? (
        <div className="space-y-2">
          {chats.map((c) => {
            const last = c.messages?.[0]
            const isHost = c.host?.id === currentUserId
            const other = isHost ? c.guest : c.host
            const name = other?.profile?.name?.trim() || 'Пользователь'
            const avatarUrl = other?.profile?.avatarUrl
            const photoUrl = avatarUrl || c.listingPhotoUrl
            return (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-[18px] bg-white border border-gray-100/80',
                  'shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-violet-200'
                )}
              >
                <div className="relative w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {photoUrl ? (
                    <Image src={photoUrl} alt="" fill className="object-cover" sizes="56px" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-[20px]">💬</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#1C1F26] truncate">{name}</div>
                  {c.listingTitle && (
                    <div className="text-[13px] text-[#6B7280] truncate">{c.listingTitle}</div>
                  )}
                  {last && (
                    <div className="text-[13px] text-[#9CA3AF] truncate mt-0.5">{last.text}</div>
                  )}
                </div>
                {(c.unreadCount ?? 0) > 0 && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-[12px] font-bold flex items-center justify-center">
                    {c.unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className={cn(
          'bg-white rounded-[18px] p-8 text-center',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-gray-100/80'
        )}>
          <p className="text-[15px] text-[#6B7280]">
            Чаты появятся, когда гости напишут вам по объявлению (кнопка «Написать» на странице объявления).
          </p>
        </div>
      )}
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
