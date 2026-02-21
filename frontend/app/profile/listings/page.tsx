'use client'

/** TZ-30: Мои объявления — /profile/listings. Список, статус, просмотры, кнопки редактировать/продвинуть/скрыть, пустое состояние. */

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/domains/auth'
import { useFetch } from '@/shared/hooks/useFetch'
import { apiFetch } from '@/shared/utils/apiFetch'
import { ListingCardCabinetV2 } from '@/components/cabinet'
import { AiHostPanel } from '@/components/ai/AiHostPanel'
import type { ListingPlan } from '@/shared/contracts/api'
import { cn } from '@/shared/utils/cn'

export default function ProfileListingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()
  const [aiPanelListingId, setAiPanelListingId] = useState<string | null>(null)

  const { data, isLoading } = useFetch<{ items: any[] }>(['profile-listings'], '/api/listings/my', { enabled: isAuthenticated() })
  const items = data?.items ?? []
  const canUseOwnerAi = user?.role === 'landlord' || user?.role === 'admin' || Boolean((user as any)?.isAdmin)

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить объявление? Это действие необратимо.')) return
    try {
      await apiFetch(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await queryClient.invalidateQueries({ queryKey: ['profile-listings'] })
    } catch (e) {
      console.error(e)
    }
  }

  const handleHide = async (id: string) => {
    try {
      await apiFetch(`/api/listings/${encodeURIComponent(id)}/unpublish`, { method: 'POST' })
      await queryClient.invalidateQueries({ queryKey: ['profile-listings'] })
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/owner/dashboard?tab=edit&id=${id}`)
  }

  const toCardData = (item: any) => ({
    id: item.id,
    title: item.title ?? 'Без названия',
    price: Number(item.basePrice ?? item.pricePerNight ?? 0),
    cover: item.photos?.[0]?.url ?? item.images?.[0]?.url ?? null,
    status: item.statusCanonical ?? item.status ?? 'DRAFT',
    plan: (item.plan as ListingPlan) ?? 'free',
    createdAt: item.createdAt,
    views: (item as any).viewsCount ?? (item as any).views ?? 0,
    favorites: (item as any).favoritesCount ?? 0,
  })

  const activeAiListing = items.find((item) => item.id === aiPanelListingId) ?? null
  const activeAiListingPayload = activeAiListing
    ? {
        id: String(activeAiListing.id),
        title: activeAiListing.title ?? '',
        description: activeAiListing.description ?? '',
        photosCount: (activeAiListing.photos?.length ?? activeAiListing.images?.length ?? 0) as number,
        price: Number(activeAiListing.basePrice ?? activeAiListing.pricePerNight ?? 0),
        city: activeAiListing.city ?? '',
        district: (activeAiListing as any).district ?? '',
        floor: (activeAiListing as any).floor ?? null,
        amenities: Array.isArray(activeAiListing.amenities) ? activeAiListing.amenities.map((x: unknown) => String(x)) : [],
        metroDistanceMin: (activeAiListing as any).metroDistanceMin ?? null,
      }
    : null

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Требуется авторизация</p>
          <Link href="/auth/login" className="text-[var(--accent)] font-medium">Войти</Link>
        </div>
      </div>
    )
  }

  return (
    <>
        <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-6">Мои объявления</h1>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-[16px] bg-[var(--bg-input)] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[32px] mx-auto mb-4" aria-hidden>
              📋
            </div>
            <p className="text-[16px] text-[var(--text-secondary)] mb-2">У вас пока нет объявлений</p>
            <p className="text-[14px] text-[var(--text-muted)] mb-6">Добавьте первое — его увидят тысячи пользователей</p>
            <Link
              href="/profile/listings/create"
              className={cn(
                'inline-flex items-center justify-center px-6 py-3 rounded-[14px]',
                'font-semibold text-[15px] bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95'
              )}
            >
              Добавить объявление
            </Link>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="space-y-3">
                <ListingCardCabinetV2
                  listing={toCardData(item)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onHide={handleHide}
                  onPromote={(id) => router.push(`/owner/dashboard?tab=promotion&promote=${id}`)}
                />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item.id)}
                    className="h-10 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/owner/dashboard?tab=promotion&promote=${item.id}`)}
                    className="h-10 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                  >
                    Продвижение
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/profile/calendar')}
                    className="h-10 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                  >
                    Календарь
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/profile/analytics')}
                    className="h-10 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                  >
                    Аналитика
                  </button>
                  {canUseOwnerAi && (
                    <button
                      type="button"
                      onClick={() => setAiPanelListingId(item.id)}
                      className="h-10 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                    >
                      AI-помощник
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Link
              href="/profile/listings/create"
              className={cn(
                'flex items-center justify-center gap-2 w-full py-4 rounded-[16px] border-2 border-dashed border-[var(--border-main)]',
                'text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-input)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-colors'
              )}
            >
              + Добавить объявление
            </Link>
          </div>
        )}
        {canUseOwnerAi && activeAiListingPayload && (
          <AiHostPanel
            open={Boolean(aiPanelListingId)}
            onClose={() => setAiPanelListingId(null)}
            listing={activeAiListingPayload}
            isAdmin={Boolean((user as any)?.isAdmin || user?.role === 'admin')}
          />
        )}
    </>
  )
}
