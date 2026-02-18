'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { cn } from '@/shared/utils/cn'
import { apiFetch, apiFetchJson } from '@/shared/utils/apiFetch'
import { UpgradeModal } from '@/components/upgradeModal/UpgradeModal'
import type { UserPlan } from '@/shared/contracts/api'
import { PlanBadge } from '@/components/planBadge/PlanBadge'
import { useCreateListingV2 } from '@/config/uiFlags'
import { CreateListingWizardV2 } from '@/domains/listings/CreateListingWizardV2'
import { ListingWizard } from '@/domains/listings/ListingWizard'
import type { ListingPlan } from '@/shared/contracts/api'
import { PromoteListingModal } from '@/components/monetization'
import { TariffCard, type TariffCardOption } from '@/components/monetization/TariffCard'
import { ThemeSettings } from '@/components/ui/ThemeSettings'
import type { CabinetTab } from './SidebarV2'
import { ListingCardCabinetV2 } from '@/components/cabinet'

export function DashboardV2() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<CabinetTab>('home')
  const [editingListing, setEditingListing] = useState<any | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'limit' | 'analytics' | 'ai' | 'general'>('general')
  const [promoteModalListing, setPromoteModalListing] = useState<{ id: string; plan: ListingPlan } | null>(null)
  const [promotePlanLoading, setPromotePlanLoading] = useState(false)

  const tariff = user?.tariff ?? 'free'
  const plan: UserPlan = (user?.plan as UserPlan) ?? (tariff === 'landlord_pro' ? 'AGENCY' : tariff === 'landlord_basic' ? 'PRO' : 'FREE')
  const listingLimit = user?.listingLimit ?? 1
  const listingUsed = (user as any)?.listingUsed ?? 0
  const isFreePlan = plan === 'FREE'
  const canCreate = listingUsed < listingLimit
  const isAdmin = Boolean((user as any)?.isAdmin) || user?.role === 'admin'

  useEffect(() => {
    const tab = searchParams.get('tab') as string | null
    if (!tab) {
      router.replace('/profile')
      return
    }
    if (tab === 'add') {
      router.replace('/create-listing')
      return
    }
    if (tab === 'messages') {
      router.replace('/messages')
      return
    }
    if (tab === 'profile' || tab === 'home') {
      router.replace('/profile')
      return
    }
    if (tab === 'settings') {
      router.replace('/profile/settings')
      return
    }
    const map: Record<string, CabinetTab> = {
      listings: 'listings',
      add: 'listings',
      promotion: 'promotion',
      bookings: 'bookings',
      finances: 'finances',
      profile: 'profile',
      settings: 'settings',
    }
    if (tab === 'add' || tab === 'listings') setActiveTab('listings')
    else if (tab === 'promotion') setActiveTab('promotion')
    else if (tab === 'finances') setActiveTab('finances')
    else if (tab === 'settings') setActiveTab('settings')
    else if (tab && map[tab]) setActiveTab(map[tab])
  }, [searchParams, router])

  const handleTabChange = (tab: CabinetTab) => {
    if (tab === 'messages') {
      router.push('/messages')
      return
    }
    if (tab === 'admin') {
      router.push('/admin')
      return
    }
    setActiveTab(tab)
    if (tab === 'listings') router.push('/owner/dashboard?tab=listings')
    else if (tab === 'promotion') router.push('/owner/dashboard?tab=promotion')
    else if (tab === 'bookings') router.push('/owner/dashboard?tab=bookings')
    else if (tab === 'finances') router.push('/owner/dashboard?tab=finances')
    else if (tab === 'profile') router.push('/owner/dashboard?tab=profile')
    else if (tab === 'settings') router.push('/owner/dashboard?tab=settings')
    else router.push('/owner/dashboard')
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4">Требуется авторизация</h2>
          <Link href="/auth/login" className="text-[var(--accent)] hover:opacity-90 text-[14px]">Войти в аккаунт</Link>
        </div>
      </div>
    )
  }

  const goToAdd = () => {
    setEditingListing(null)
    setActiveTab('listings')
    router.push('/create-listing')
  }

  /** ТЗ-8: Единый кабинет — сайдбар в layout (ProfileLayoutV2), здесь только контент раздела. */
  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-20 lg:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <main className="space-y-6">
            {activeTab === 'home' && (
              <DashboardHomeTab
                canCreate={canCreate}
                onAddListing={canCreate ? goToAdd : () => { setUpgradeReason('limit'); setUpgradeOpen(true); }}
                onUpgrade={() => { setUpgradeReason('general'); setUpgradeOpen(true); }}
                onGoToListings={() => { setActiveTab('listings'); router.push('/owner/dashboard?tab=listings'); }}
                onGoToBookings={() => { setActiveTab('bookings'); router.push('/owner/dashboard?tab=bookings'); }}
                onGoToPromotion={() => { setActiveTab('promotion'); router.push('/owner/dashboard?tab=promotion'); }}
              />
            )}
            {searchParams.get('tab') === 'add' ? (
              <AddListingTab
                onSuccess={(listingId) => {
                  setEditingListing(null)
                  setActiveTab('listings')
                  router.push('/owner/dashboard?tab=listings')
                  if (listingId) setPromoteModalListing({ id: listingId, plan: 'free' })
                }}
                onCancel={() => { setEditingListing(null); router.push('/owner/dashboard?tab=listings'); }}
                initialListing={editingListing}
                onLimitReached={() => router.push('/pricing?reason=limit')}
              />
            ) : activeTab === 'listings' ? (
              <ListingsTabV2
                onAdd={goToAdd}
                onEdit={(listing) => { setEditingListing(listing); router.push(`/create-listing/draft/${listing.id}`); }}
                onPromote={(id, listingPlan) => setPromoteModalListing({ id, plan: listingPlan ?? 'free' })}
                onStats={() => { setActiveTab('home'); router.push('/owner/dashboard'); }}
                plan={plan}
                listingLimit={listingLimit}
                canCreate={canCreate}
                onUpgrade={(r) => { setUpgradeReason(r); setUpgradeOpen(true); }}
                queryClient={queryClient}
              />
            ) : activeTab === 'promotion' ? (
              <PromotionTab
                onPromote={(id, listingPlan) => setPromoteModalListing({ id, plan: listingPlan ?? 'free' })}
                onEdit={(listing) => { setEditingListing(listing); router.push(`/create-listing/draft/${listing.id}`); }}
                onDelete={async (id) => {
                  if (!confirm('Удалить объявление?')) return
                  try {
                    await apiFetch(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' })
                    await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
                  } catch (e) { console.error(e) }
                }}
                onHide={async (id) => {
                  try {
                    await apiFetch(`/api/listings/${encodeURIComponent(id)}/unpublish`, { method: 'POST' })
                    await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
                  } catch (e) { console.error(e) }
                }}
              />
            ) : null}
            {activeTab === 'bookings' && <BookingsTabV2 />}
            {/* ТЗ 14: сообщения — один центр, только /messages; из кабинета редирект по клику и по ?tab=messages */}
            {activeTab === 'finances' && <FinancesTabV2 isFreePlan={isFreePlan} />}
            {activeTab === 'profile' && <ProfileTabV2 />}
            {activeTab === 'settings' && <SettingsTabV2 />}
        </main>
      </div>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} currentPlan={plan} reason={upgradeReason} />
      <PromoteListingModal
        open={!!promoteModalListing}
        onClose={() => setPromoteModalListing(null)}
        listingId={promoteModalListing?.id ?? null}
        currentPlan={promoteModalListing?.plan ?? 'free'}
        isLoading={promotePlanLoading}
        onSelectPlan={async (id, selectedPlan) => {
          setPromotePlanLoading(true)
          try {
            await apiFetchJson(`/api/listings/${encodeURIComponent(id)}`, {
              method: 'PATCH',
              body: JSON.stringify({ plan: selectedPlan }),
            })
            await queryClient.invalidateQueries({ queryKey: ['owner-listings'] })
            setPromoteModalListing(null)
          } catch {
            // keep modal open on error
          } finally {
            setPromotePlanLoading(false)
          }
        }}
      />

      {/* ТЗ-4: Нижнее меню только глобальное (BottomNavGlobal). Не дублируем табы здесь. */}
    </div>
  )
}

/** ТЗ 14: Обзор — метрики (Активные, Бронирования сегодня, Доход месяц, Просмотры), быстрые действия без дубля сообщений */
function DashboardHomeTab({
  canCreate,
  onAddListing,
  onUpgrade,
  onGoToListings,
  onGoToBookings,
  onGoToPromotion,
}: {
  canCreate: boolean
  onAddListing: () => void
  onUpgrade: () => void
  onGoToListings: () => void
  onGoToBookings: () => void
  onGoToPromotion: () => void
}) {
  const { data } = useFetch<{ items: any[] }>(['owner-listings-home'], '/api/listings/my')
  const listings = data?.items ?? []
  const activeCount = listings.filter((l: any) => l.status === 'PUBLISHED' || l.status === 'ACTIVE').length
  const totalViews = listings.reduce((s: number, l: any) => s + ((l as any).viewsCount ?? (l as any).views ?? 0), 0)
  const bookingsCount = 0
  const income = 0

  const cardCls = 'rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
  const metricCls = 'rounded-[12px] p-4 bg-[var(--bg-input)] border border-[var(--border-main)]'

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Обзор</h1>

      {/* Блок 1 — 4 метрики: Активные объявления, Бронирования, Доход, Просмотры */}
      <section className={cardCls}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={metricCls}>
            <p className="text-[12px] text-[var(--text-muted)]">Активные объявления</p>
            <p className="text-[24px] font-bold text-[var(--text-primary)] mt-1">{activeCount}</p>
          </div>
          <div className={metricCls}>
            <p className="text-[12px] text-[var(--text-muted)]">Бронирования сегодня</p>
            <p className="text-[24px] font-bold text-[var(--text-primary)] mt-1">{bookingsCount}</p>
          </div>
          <div className={metricCls}>
            <p className="text-[12px] text-[var(--text-muted)]">Доход месяц</p>
            <p className="text-[24px] font-bold text-[var(--text-primary)] mt-1">{income > 0 ? `${income.toLocaleString('ru-RU')} ₽` : '0 ₽'}</p>
          </div>
          <div className={metricCls}>
            <p className="text-[12px] text-[var(--text-muted)]">Просмотры</p>
            <p className="text-[24px] font-bold text-[var(--text-primary)] mt-1">{totalViews}</p>
          </div>
        </div>
      </section>

      {/* Блок 2 — Быстрые действия */}
      <section className={cardCls}>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={onAddListing}
            className="flex flex-col items-center justify-center gap-2 rounded-[12px] p-4 bg-[var(--accent)] text-[var(--button-primary-text)] font-medium text-[14px] hover:opacity-95 transition-opacity shadow-[0_2px_8px_rgba(124,58,237,0.25)]"
          >
            <span className="text-xl">➕</span>
            Разместить объявление
          </button>
          <button type="button" onClick={onGoToPromotion} className="flex flex-col items-center justify-center gap-2 rounded-[12px] p-4 bg-[var(--bg-input)] border border-[var(--border-main)] text-[var(--text-primary)] font-medium text-[14px] hover:bg-[var(--bg-main)] transition-colors">
            <span className="text-xl">🚀</span>
            Продвинуть объявление
          </button>
          <button type="button" onClick={onGoToBookings} className="flex flex-col items-center justify-center gap-2 rounded-[12px] p-4 bg-[var(--bg-input)] border border-[var(--border-main)] text-[var(--text-primary)] font-medium text-[14px] hover:bg-[var(--bg-main)] transition-colors">
            <span className="text-xl">📅</span>
            Календарь
          </button>
        </div>
      </section>

      {/* Блок 3 — Мои объявления (мини 3) + Все объявления → */}
      <section className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Мои объявления</h2>
          <button type="button" onClick={onGoToListings} className="text-[14px] font-medium text-[var(--accent)] hover:underline">
            Все объявления →
          </button>
        </div>
        {listings.length === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)]">Нет объявлений</p>
        ) : (
          <ul className="space-y-3">
            {listings.slice(0, 3).map((item: any) => (
              <li key={item.id}>
                <Link href={`/listings/${item.id}`} className="flex gap-3 p-3 rounded-[12px] bg-[var(--bg-input)] border border-[var(--border-main)] hover:border-[var(--accent)]/30 transition-colors">
                  <div className="w-16 h-12 rounded-[8px] bg-[var(--bg-card)] overflow-hidden shrink-0">
                    {item.photos?.[0]?.url ? <img src={item.photos[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[12px]">—</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{item.title || 'Без названия'}</p>
                    <p className="text-[13px] text-[var(--text-secondary)]">{Number(item.basePrice ?? 0).toLocaleString('ru-RU')} ₽</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Блок 4 — Последние бронирования (2–3 карточки) */}
      <section className={cardCls}>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Последние бронирования</h2>
        {bookingsCount === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)]">Пока нет бронирований</p>
        ) : (
          <p className="text-[14px] text-[var(--text-secondary)]">Здесь появятся последние заявки.</p>
        )}
      </section>
    </div>
  )
}

function ListingsTabV2({
  onAdd,
  onEdit,
  plan,
  listingLimit,
  canCreate,
  onUpgrade,
  onPromote,
  onStats,
  queryClient,
}: {
  onAdd: () => void
  onEdit: (listing: any) => void
  plan: UserPlan
  listingLimit: number
  canCreate: boolean
  onUpgrade: (reason: 'limit' | 'analytics' | 'ai' | 'general') => void
  onPromote?: (listingId: string, plan?: ListingPlan) => void
  onStats?: (listingId: string) => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const { data, isLoading } = useFetch<{ items: any[] }>(['owner-listings'], '/api/listings/my')
  const allListings = data?.items ?? []
  const used = allListings.length
  /** ТЗ-8: вкладки — Активные, На модерации, Архив, Черновики */
  const [listingsSubTab, setListingsSubTab] = useState<'active' | 'moderation' | 'archive' | 'draft'>('active')
  const listings = (() => {
    if (listingsSubTab === 'active') return allListings.filter((l: any) => l.status === 'PUBLISHED' || l.status === 'ACTIVE')
    if (listingsSubTab === 'moderation') return allListings.filter((l: any) => l.status === 'PENDING' || l.status === 'ON_REVIEW' || l.status === 'MODERATION')
    if (listingsSubTab === 'archive') return allListings.filter((l: any) => l.status === 'ARCHIVED' || l.status === 'UNPUBLISHED' || l.status === 'INACTIVE')
    if (listingsSubTab === 'draft') return allListings.filter((l: any) => l.status === 'DRAFT')
    return allListings
  })()

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

  const toCardData = (item: any): import('@/components/cabinet/ListingCardCabinetV2').ListingCardCabinetV2Data => ({
    id: item.id,
    title: item.title ?? 'Без названия',
    price: Number(item.basePrice ?? item.pricePerNight ?? 0),
    cover: item.photos?.[0]?.url ?? item.images?.[0]?.url ?? null,
    status: item.status ?? 'DRAFT',
    plan: (item.plan as ListingPlan) ?? 'free',
    createdAt: item.createdAt,
    views: (item as any).viewsCount ?? (item as any).views ?? 0,
    favorites: (item as any).favoritesCount ?? 0,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Мои объявления</h1>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] hover:opacity-95 shadow-[0_2px_8px_rgba(124,58,237,0.25)]"
        >
          <span>+</span>
          Добавить объявление
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-secondary)]">
        <PlanBadge plan={plan} />
        <span>Использовано {used} из {listingLimit}</span>
        {plan === 'FREE' && (
          <button type="button" onClick={() => onUpgrade('general')} className="font-semibold text-[var(--accent)] hover:underline">
            Улучшить тариф
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'active' as const, label: 'Активные' },
          { id: 'moderation' as const, label: 'На модерации' },
          { id: 'archive' as const, label: 'Архив' },
          { id: 'draft' as const, label: 'Черновики' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setListingsSubTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-[12px] text-[14px] font-medium transition-colors',
              listingsSubTab === t.id ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!canCreate && used > 0 && (
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5">
          <p className="text-[14px] text-[var(--text-secondary)]">Лимит объявлений исчерпан. Улучшите тариф, чтобы добавлять новые.</p>
          <button type="button" onClick={() => onUpgrade('limit')} className="mt-3 px-4 py-2 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[13px] font-semibold hover:opacity-95">
            Перейти на тариф
          </button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-[16px] bg-[var(--bg-input)] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[16px] text-[var(--text-secondary)] mb-6">У вас пока нет объявлений</p>
          <Link href="/create-listing" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px] hover:opacity-95 transition-opacity">
            Разместить
          </Link>
        </div>
      )}

      {!isLoading && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((item: any) => (
            <ListingCardCabinetV2
              key={item.id}
              listing={toCardData(item)}
              onEdit={onEdit}
              onDelete={handleDelete}
              onHide={handleHide}
              onPromote={onPromote ? () => onPromote(item.id, (item.plan as ListingPlan) ?? 'free') : undefined}
              onStats={onStats}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const PROMOTION_TARIFF_OPTIONS: TariffCardOption[] = [
  {
    plan: 'free',
    title: 'Базовый',
    price: '0 ₽',
    features: ['Обычный показ', 'Без поднятия', 'Без приоритета'],
    ctaLabel: 'По умолчанию',
  },
  {
    plan: 'pro',
    title: 'PRO',
    price: '299 ₽',
    features: ['Показы в 2× выше', 'Значок PRO', 'AI-описание', 'Статистика'],
    ctaLabel: 'Активировать PRO',
  },
  {
    plan: 'top',
    title: 'TOP',
    price: '599 ₽',
    features: ['В топе поиска', 'Бейдж TOP', 'Приоритет', 'Пуш-показы'],
    ctaLabel: 'TOP размещение',
  },
]

function PromotionTab({
  onPromote,
  onEdit,
  onDelete,
  onHide,
}: {
  onPromote: (id: string, plan?: ListingPlan) => void
  onEdit: (listing: any) => void
  onDelete: (id: string) => void
  onHide: (id: string) => void
}) {
  const { data, isLoading } = useFetch<{ items: any[] }>(['owner-listings'], '/api/listings/my')
  const listings = data?.items ?? []

  const toCardData = (item: any): import('@/components/cabinet/ListingCardCabinetV2').ListingCardCabinetV2Data => ({
    id: item.id,
    title: item.title ?? 'Без названия',
    price: Number(item.basePrice ?? item.pricePerNight ?? 0),
    cover: item.photos?.[0]?.url ?? item.images?.[0]?.url ?? null,
    status: item.status ?? 'DRAFT',
    plan: (item.plan as ListingPlan) ?? 'free',
    createdAt: item.createdAt,
    views: (item as any).viewsCount ?? (item as any).views ?? 0,
    favorites: (item as any).favoritesCount ?? 0,
  })

  return (
    <div className="space-y-8">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Продвижение</h1>
      <p className="text-[14px] text-[var(--text-secondary)]">Выберите тариф для каждого объявления ниже.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROMOTION_TARIFF_OPTIONS.map((opt) => (
          <TariffCard
            key={opt.plan}
            option={{ ...opt, active: false }}
            onSelect={() => {}}
            disabled
          />
        ))}
      </div>
      <div>
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-4">Ваши объявления</h2>
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-[16px] bg-[var(--bg-input)] animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && listings.length === 0 && (
          <p className="text-[14px] text-[var(--text-muted)]">Нет объявлений. Создайте объявление во вкладке «Объявления».</p>
        )}
        {!isLoading && listings.length > 0 && (
          <div className="space-y-3">
            {listings.map((item: any) => (
              <ListingCardCabinetV2
                key={item.id}
                listing={toCardData(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.id)}
                onHide={() => onHide(item.id)}
                onPromote={() => onPromote(item.id, (item.plan as ListingPlan) ?? 'free')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AddListingTab({
  onSuccess,
  onCancel,
  initialListing,
  onLimitReached,
}: {
  onSuccess?: (listingId?: string) => void
  onCancel?: () => void
  initialListing?: any | null
  onLimitReached?: () => void
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

/** ТЗ-8: Бронирования — 2 вкладки: Я снимаю, У меня снимают */
function BookingsTabV2() {
  const [subTab, setSubTab] = useState<'guest' | 'host'>('guest')

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Бронирования</h1>
      <div className="flex gap-2">
        {[
          { id: 'guest' as const, label: 'Я снимаю' },
          { id: 'host' as const, label: 'У меня снимают' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-[12px] text-[14px] font-medium transition-colors',
              subTab === t.id ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          {subTab === 'guest' ? 'Пока нет бронирований. Ваши заявки появятся здесь.' : 'Пока нет заявок. Бронирования появятся, когда гости начнут бронировать ваши объявления.'}
        </p>
      </div>
    </div>
  )
}

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

function MessagesTabV2() {
  const { user } = useAuthStore()
  const currentUserId = user?.id ?? ''
  const { data: chats, isLoading } = useFetch<ChatItem[]>(['chats'], '/chats', { enabled: !!currentUserId })

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Сообщения</h1>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-[16px] bg-[var(--bg-input)] animate-pulse" />
          ))}
        </div>
      ) : Array.isArray(chats) && chats.length > 0 ? (
        <div className="space-y-2">
          {chats.map((c) => {
            const isHost = c.host?.id === currentUserId
            const other = isHost ? c.guest : c.host
            const name = other?.profile?.name?.trim() || 'Пользователь'
            const avatarUrl = other?.profile?.avatarUrl
            const photoUrl = avatarUrl || c.listingPhotoUrl
            const last = c.messages?.[0]
            return (
              <Link
                key={c.id}
                href={`/messages?chat=${c.id}`}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-main)]',
                  'hover:border-[var(--accent)]/30 transition-colors'
                )}
              >
                <div className="relative w-12 h-12 rounded-full bg-[var(--bg-input)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {photoUrl ? (
                    <Image src={photoUrl} alt="" fill className="object-cover" sizes="48px" />
                  ) : (
                    <span className="text-[14px] font-semibold text-[var(--text-secondary)]">{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[var(--text-primary)] truncate">{name}</div>
                  {c.listingTitle && <div className="text-[13px] text-[var(--text-secondary)] truncate">{c.listingTitle}</div>}
                  {last && <div className="text-[13px] text-[var(--text-muted)] truncate mt-0.5">{last.text}</div>}
                </div>
                {(c.unreadCount ?? 0) > 0 && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--button-primary-text)] text-[12px] font-bold flex items-center justify-center">
                    {c.unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-8 text-center">
          <p className="text-[var(--text-secondary)]">Чаты появятся, когда гости напишут вам по объявлению.</p>
        </div>
      )}
    </div>
  )
}

/** ТЗ-8: Настройки — только тема, уведомления. Полные настройки (имя, почта, пароль, аватар) на /profile/settings */
function SettingsTabV2() {
  const cardCls = 'rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Настройки</h1>
      <p className="text-[14px] text-[var(--text-secondary)]">
        <Link href="/profile/settings" className="text-[var(--accent)] font-medium hover:underline">
          Открыть все настройки (аккаунт, пароль, уведомления, тема) →
        </Link>
      </p>
      <section className={cardCls}>
        <ThemeSettings />
      </section>
      <section className={cardCls}>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Уведомления</h2>
        <p className="text-[14px] text-[var(--text-secondary)]">Email и push о новых сообщениях и бронированиях.</p>
        <p className="text-[13px] text-[var(--text-muted)] mt-2">Настройки уведомлений — в разделе <Link href="/profile/notifications" className="text-[var(--accent)] hover:underline">Уведомления</Link>.</p>
      </section>
    </div>
  )
}

/** ТЗ 6: Финансы — Доход, Комиссии, Выплаты, История */
function FinancesTabV2({ isFreePlan }: { isFreePlan?: boolean }) {
  const cardCls = 'rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Финансы</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className={cardCls}>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">Доход</h2>
          <p className="text-[28px] font-bold text-[var(--text-primary)]">0 ₽</p>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">За текущий период</p>
        </section>
        <section className={cardCls}>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">Комиссии</h2>
          <p className="text-[28px] font-bold text-[var(--text-primary)]">0 ₽</p>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">Удержано сервисом</p>
        </section>
        <section className={cardCls}>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">Выплаты</h2>
          <p className="text-[14px] text-[var(--text-secondary)]">Запросить выплату можно при достижении минимальной суммы.</p>
        </section>
        <section className={cardCls}>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">История</h2>
          <p className="text-[14px] text-[var(--text-muted)]">Транзакции появятся после первых бронирований.</p>
        </section>
      </div>
      {isFreePlan && (
        <div className={cardCls}>
          <p className="text-[14px] text-[var(--text-secondary)]">Подробная финансовая отчётность доступна на PRO.</p>
          <Link href="/pricing" className="inline-block mt-3 px-4 py-2 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold hover:opacity-95">Узнать больше</Link>
        </div>
      )}
    </div>
  )
}

function ProfileTabV2() {
  const { user, refresh } = useAuthStore()
  const tariff = user?.tariff ?? 'free'
  const plan: UserPlan = (user?.plan as UserPlan) ?? (tariff === 'landlord_pro' ? 'AGENCY' : tariff === 'landlord_basic' ? 'PRO' : 'FREE')
  const listingLimit = user?.listingLimit ?? 1
  const { data: mine } = useFetch<{ items: any[] }>(['owner-listings-profile'], '/api/listings/my')
  const used = mine?.items?.length ?? 0
  const [formData, setFormData] = useState({ fullName: user?.full_name || '', phone: user?.phone || '' })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const isTelegramPhone = Boolean(user?.telegram_id && user?.phone)

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await apiFetchJson('/profile', { method: 'PATCH', body: JSON.stringify({ full_name: formData.fullName.trim() || null, phone: formData.phone.trim() || null }) })
      await refresh()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  const avatarUrl = (user as any)?.avatar_url ?? (user as any)?.profile?.avatarUrl ?? null
  const email = (user as any)?.email ?? ''

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Профиль</h1>

      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Аватар</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-input)] border border-[var(--border-main)] overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={80} height={80} className="object-cover" />
            ) : (
              <span className="text-[24px] font-semibold text-[var(--text-muted)]">{(formData.fullName || email).charAt(0).toUpperCase() || '?'}</span>
            )}
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">Изменить фото можно в настройках аккаунта.</p>
        </div>
      </section>

      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Тариф</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PlanBadge plan={plan} />
          <span className="text-[14px] text-[var(--text-secondary)]">{used} из {listingLimit} объявлений</span>
          {plan === 'FREE' && (
            <Link href="/pricing" className="px-4 py-2 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold hover:opacity-95">Улучшить тариф</Link>
          )}
        </div>
      </section>

      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Имя</h2>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
          className="w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          placeholder="Ваше имя"
        />
      </section>

      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Email</h2>
        <p className="text-[14px] text-[var(--text-primary)]">{email || '—'}</p>
        <p className="text-[12px] text-[var(--text-muted)] mt-1">Изменить email можно в настройках безопасности.</p>
      </section>

      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Телефон</h2>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+7 (999) 123-45-67"
          readOnly={isTelegramPhone}
          className="w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        {isTelegramPhone && <p className="text-[12px] text-[var(--text-muted)] mt-2">Подтверждён через Telegram</p>}
      </section>

      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">Пароль</h2>
        <p className="text-[14px] text-[var(--text-muted)] mb-4">Изменить пароль можно в настройках безопасности.</p>
      </section>

      <section className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">Документы и верификация</h2>
        <p className="text-[14px] text-[var(--text-muted)]">Раздел в разработке.</p>
      </section>

      {error && <p className="text-[14px] text-red-600">{error}</p>}
      {success && <p className="text-[14px] text-emerald-600">Профиль обновлён</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3 rounded-[14px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px] hover:opacity-95 disabled:opacity-70"
      >
        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
    </div>
  )
}
