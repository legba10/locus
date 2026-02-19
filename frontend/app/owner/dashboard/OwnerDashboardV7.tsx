'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { UpgradeModal } from '@/components/upgradeModal/UpgradeModal'
import type { UserPlan } from '@/shared/contracts/api'
import { PlanBadge } from '@/components/planBadge/PlanBadge'
import { LockedFeatureCard } from '@/components/paywall/LockedFeatureCard'
import { useCreateListingV2 } from '@/config/uiFlags'
import { CreateListingWizardV2 } from '@/domains/listings/CreateListingWizardV2'
import { ListingWizard } from '@/domains/listings/ListingWizard'
import { MyListingCard } from '@/components/listing/MyListingCard'

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-violet-600 hover:text-violet-700 text-[14px]">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ═══════════════════════════════════════════════════════════════
              SIDEBAR
              ═══════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-1">
            <div className={cn(
              'bg-[var(--bg-card)] backdrop-blur-[22px]',
              'rounded-[20px]',
              'border border-[var(--border-main)]',
              'shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
              'p-6 sticky top-6'
            )}>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-6">Кабинет</h2>
              
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
                        ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
                        : isLocked
                          ? 'text-[var(--text-muted)] hover:bg-[var(--bg-input)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]',
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
                onStats={() => setActiveTab('analytics')}
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
// МОИ ОБЪЯВЛЕНИЯ — ТЗ №6: карточки, статусы, пустое состояние, sticky кнопка
// ═══════════════════════════════════════════════════════════════
function MyListingsTab({
  onAdd,
  onEdit,
  onStats,
  plan,
  listingLimit,
  onUpgrade,
}: {
  onAdd: () => void;
  onEdit: (listing: any) => void;
  onStats?: (id: string) => void;
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

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить объявление? Это действие необратимо.')) return
    try {
      await apiFetch(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
    } catch (e) {
      console.error(e)
    }
  }

  const handleHide = async (id: string) => {
    try {
      await apiFetch(`/api/listings/${encodeURIComponent(id)}/unpublish`, { method: 'POST' })
      await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
    } catch (e) {
      console.error(e)
    }
  }

  const toCardData = (item: any) => ({
    id: item.id,
    title: item.title ?? 'Без названия',
    price: Number(item.basePrice ?? item.pricePerNight ?? 0),
    cover: item.photos?.[0]?.url ?? item.images?.[0]?.url ?? null,
    status: item.status ?? 'DRAFT',
    createdAt: item.createdAt,
    viewsCount: item.viewsCount ?? item.views ?? null,
    bookingsCount: item.bookingsCount ?? item.bookings ?? null,
    income: item.income ?? null,
    aiDemand: item.aiDemand ?? item.demand ?? null,
    aiMarketPrice: item.aiMarketPrice ?? item.marketPrice ?? null,
    aiRecommendations: item.aiRecommendations ?? item.recommendations ?? null,
  })

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Мои объявления</h1>
        {!isLoading && listings.length > 0 && (
          <button
            type="button"
            onClick={canCreate ? onAdd : () => onUpgrade("limit")}
            className={cn(
              'px-5 py-2.5 rounded-[14px]',
              canCreate ? 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:opacity-95' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:opacity-90',
              'font-semibold text-[14px] transition-colors'
            )}
          >
            {canCreate ? '+ Добавить объявление' : 'Добавить объявление (тариф)'}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] px-5 py-4">
        <div className="flex items-center gap-3">
          <PlanBadge plan={plan} />
          <div className="text-[13px] text-[var(--text-secondary)]">
            Использовано <span className="font-semibold text-[var(--text-primary)]">{used}</span> из{" "}
            <span className="font-semibold text-[var(--text-primary)]">{listingLimit}</span> объявлений
          </div>
        </div>
        {plan === "FREE" && (
          <button
            type="button"
            onClick={() => onUpgrade("general")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[12px] text-center text-[13px] font-semibold bg-[var(--accent)] text-[var(--text-on-accent)] hover:opacity-95"
          >
            Улучшить тариф
          </button>
        )}
      </div>

      {!canCreate && (
        <div className={cn(
          'bg-[var(--bg-card)] rounded-[16px] p-5',
          'border border-[var(--border-main)]'
        )}>
          <p className="text-[14px] text-[var(--text-secondary)] mb-3">
            У вас бесплатный тариф. Вы уже разместили {used} объявление.
          </p>
          <button
            type="button"
            onClick={() => onUpgrade("limit")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[12px] text-center text-[13px] font-semibold bg-[var(--accent)] text-[var(--text-on-accent)] hover:opacity-95"
          >
            Перейти на тариф
          </button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[120px] bg-[var(--bg-input)] rounded-[16px] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <div className={cn(
          'flex flex-col items-center justify-center py-16 px-4 text-center',
          'bg-[var(--bg-card)] rounded-[18px] border border-[var(--border-main)]'
        )}>
          <p className="text-[16px] text-[var(--text-secondary)] mb-6">У вас пока нет объявлений</p>
          <button
            type="button"
            onClick={canCreate ? onAdd : () => onUpgrade("limit")}
            disabled={!canCreate}
            className={cn(
              'inline-flex items-center justify-center px-6 py-3 rounded-[14px] font-semibold text-[15px] transition-colors',
              canCreate
                ? 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:opacity-95'
                : 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed'
            )}
          >
            Разместить объявление
          </button>
          {!canCreate && (
            <p className="mt-3 text-[13px] text-[var(--text-muted)]">
              Добавление объявлений доступно на платном тарифе.
            </p>
          )}
        </div>
      )}

      {!isLoading && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((item: any) => (
            <MyListingCard
              key={item.id}
              listing={toCardData(item)}
              onEdit={onEdit}
              onDelete={handleDelete}
              onHide={handleHide}
              onStats={onStats}
            />
          ))}
        </div>
      )}

      {/* ТЗ №6: sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-[var(--bg-main)]/95 backdrop-blur border-t border-[var(--border-main)] safe-area-pb">
        <div className="max-w-7xl mx-auto px-4 flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={canCreate ? onAdd : () => onUpgrade("limit")}
            className={cn(
              'w-full sm:w-auto px-6 py-3 rounded-[14px] font-semibold text-[15px] transition-colors',
              canCreate
                ? 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:opacity-95 shadow-[0_4px_14px_rgba(124,58,237,0.25)]'
                : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
            )}
          >
            Разместить объявление
          </button>
        </div>
      </div>
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
  if (useCreateListingV2) {
    return (
      <CreateListingWizardV2
        onSuccess={onSuccess}
        onCancel={onCancel}
        initialListing={initialListing}
        onLimitReached={onLimitReached}
      />
    )
  }
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
      <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Бронирования</h1>
      <div className={cn(
        'bg-[var(--bg-card)] rounded-[18px] p-8 text-center',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-[var(--border-main)]'
      )}>
        <p className="text-[15px] text-[var(--text-secondary)]">
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
      <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Сообщения</h1>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--bg-input)] rounded-[18px] animate-pulse" />
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
                href={`/messages?chat=${c.id}`}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-main)]',
                  'shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-violet-200'
                )}
              >
                <div className="relative w-14 h-14 rounded-full bg-[var(--bg-input)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {photoUrl ? (
                    <Image src={photoUrl} alt="" fill className="object-cover" sizes="56px" />
                  ) : (
                    <span className="text-[16px] font-semibold text-[var(--text-secondary)]">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[var(--text-primary)] truncate">{name}</div>
                  {c.listingTitle && (
                    <div className="text-[13px] text-[var(--text-secondary)] truncate">{c.listingTitle}</div>
                  )}
                  {last && (
                    <div className="text-[13px] text-[var(--text-muted)] truncate mt-0.5">{last.text}</div>
                  )}
                </div>
                {(c.unreadCount ?? 0) > 0 && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] text-[12px] font-bold flex items-center justify-center">
                    {c.unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className={cn(
          'bg-[var(--bg-card)] rounded-[18px] p-8 text-center',
          'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
          'border border-[var(--border-main)]'
        )}>
          <p className="text-[15px] text-[var(--text-secondary)]">
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
      <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Аналитика</h1>
      <div className={cn(
        'bg-[var(--bg-card)] rounded-[18px] p-8 text-center',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-[var(--border-main)]'
      )}>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Данные появятся после первых просмотров и бронирований.
        </p>
      </div>
    </div>
  )
}

function PaidFeatureNotice() {
  return (
    <div className={cn(
      'bg-[var(--bg-card)] rounded-[18px] p-8 text-center',
      'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
      'border border-[var(--border-main)]'
    )}>
      <div className="text-4xl mb-3">🔒</div>
      <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-2">Функция доступна на платном тарифе</h2>
      <p className="text-[14px] text-[var(--text-secondary)]">
        Обновите тариф, чтобы добавлять объявления и смотреть аналитику.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
        <Link
          href="/pricing"
          className="px-4 py-2 rounded-[12px] text-center text-[13px] font-medium border border-[var(--border-main)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
        >
          Посмотреть тарифы
        </Link>
        <Link
          href="/pricing#cta"
          className="px-4 py-2 rounded-[12px] text-center text-[13px] font-medium bg-[var(--accent)] text-[var(--text-on-accent)] hover:opacity-95"
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
    phone: user?.phone || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const isTelegramPhone = Boolean(user?.telegram_id && user?.phone)

  useEffect(() => {
    setFormData({
      fullName: user?.full_name || '',
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
      <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Профиль</h1>
      <div className="rounded-[18px] border border-[var(--border-main)] bg-[var(--bg-card)] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <PlanBadge plan={plan} />
              <div className="text-[14px] font-bold text-[var(--text-primary)]">Ваш тариф: {plan}</div>
            </div>
            <div className="mt-1 text-[13px] text-[var(--text-secondary)]">
              {used} из {listingLimit} объявлений использовано
            </div>
            <div className="mt-2 text-[13px] text-[var(--text-secondary)]">
              Перейти на PRO: до 5 объявлений • аналитика • продвижение
            </div>
          </div>
          {plan === "FREE" && (
            <Link
              href="/pricing?reason=profile_upsell"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-[14px] bg-[var(--accent)] text-[var(--text-on-accent)] text-[14px] font-semibold hover:opacity-95"
            >
              Улучшить тариф
            </Link>
          )}
        </div>
      </div>
      <div className={cn(
        'bg-[var(--bg-card)] rounded-[18px] p-6',
        'shadow-[0_6px_24px_rgba(0,0,0,0.08)]',
        'border border-[var(--border-main)]'
      )}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Имя</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-[var(--border-main)] bg-[var(--bg-input)]',
                'text-[var(--text-primary)] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Тариф</label>
            <input
              type="text"
              value={tariffLabel}
              disabled
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                'border border-[var(--border-main)] bg-[var(--bg-input)]',
                'text-[var(--text-primary)] text-[14px]'
              )}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
              readOnly={isTelegramPhone}
              className={cn(
                'w-full rounded-[14px] px-4 py-3',
                isTelegramPhone ? 'border border-[var(--border-main)] bg-[var(--bg-input)]' : 'border border-[var(--border-main)] bg-[var(--bg-input)]',
                'text-[var(--text-primary)] text-[14px]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]'
              )}
            />
            {isTelegramPhone && (
              <p className="text-[12px] text-[var(--text-secondary)] mt-2">Подтверждён через Telegram</p>
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
              'bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold text-[15px]',
              'hover:opacity-95 transition-opacity',
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
