'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useFetch } from '@/shared/hooks/useFetch'
import { useAuthStore } from '@/domains/auth'
import { cn } from '@/shared/utils/cn'
import { ListingCard } from '@/components/listing'

interface PublicProfile {
  id: string
  name: string
  avatar: string | null
  created_at?: string
  listingsCount: number
  rating_avg: number | null
  reviews_count: number
  listings: Array<{
    id: string
    title: string
    city: string
    basePrice: number
    imageUrl: string | null
  }>
}

interface ApiResponse {
  profile: PublicProfile | null
}

export default function UserProfilePage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const currentUser = useAuthStore((s) => s.user)
  const isOwnProfile = !!currentUser?.id && currentUser.id === id

  const { data, isLoading, error } = useFetch<ApiResponse>(
    ['user-public', id],
    `/api/users/${encodeURIComponent(id)}/public`,
    { enabled: !!id }
  )
  const { data: summaryData } = useFetch<{ ok: boolean; summary: { avg: number | null; count: number; distribution: Record<number, number> } }>(
    ['reviews-user-summary', id],
    `/api/reviews/user/${encodeURIComponent(id)}/summary`,
    { enabled: !!id && !isOwnProfile }
  )
  const profile = data?.profile ?? null

  const summary = summaryData?.summary

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <p className="text-[#6B7280]">Не указан пользователь</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-gray-200 rounded-[18px]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 rounded-[18px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-[#1C1F26] mb-2">Профиль не найден</h2>
          <Link href="/listings" className="text-violet-600 hover:text-violet-700 text-[14px]">
            ← К объявлениям
          </Link>
        </div>
      </div>
    )
  }

  const ratingVal = summary?.avg ?? profile.rating_avg ?? null
  const reviewsCount = (summary?.count ?? profile.reviews_count) ?? 0

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="max-w-[900px] mx-auto px-6 py-6">
        {/* ТЗ-7: верх профиля — flex gap 20px, аватар 80px, имя 22px */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
          <div className="profile-header-tz9__avatar relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]">
            {profile.avatar ? (
              <Image src={profile.avatar} alt={profile.name} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--text-secondary)]">
                {(profile.name ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-semibold text-[var(--text-main)]">{profile.name}</h1>
            {ratingVal != null && (
              <p className="profile-rating-tz9 mt-1">
                <svg viewBox="0 0 24 24" aria-hidden><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span>{(Number(ratingVal)).toFixed(1)}</span>
                {reviewsCount > 0 && <span className="text-[var(--text-secondary)] ml-1">{reviewsCount} отзывов</span>}
              </p>
            )}
          </div>
        </div>
        {/* ТЗ-7: блок статистики — grid 3 cols, карточки padding 14px border-radius 14px */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] p-3.5 text-center">
            <div className="text-[18px] font-bold text-[var(--text-main)]">{profile.listingsCount}</div>
            <div className="text-[13px] text-[var(--text-secondary)] mt-1">объявления</div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] p-3.5 text-center">
            <div className="text-[18px] font-bold text-[var(--text-main)]">{reviewsCount}</div>
            <div className="text-[13px] text-[var(--text-secondary)] mt-1">отзывы</div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] p-3.5 text-center">
            <div className="text-[18px] font-bold text-[var(--text-main)]">{ratingVal != null ? (Number(ratingVal)).toFixed(1) : '—'}</div>
            <div className="text-[13px] text-[var(--text-secondary)] mt-1">рейтинг</div>
          </div>
        </div>

        <h2 className="text-[20px] font-bold text-[var(--text-main)] mb-4">Объявления</h2>
        {!(profile.listings?.length) ? (
          <p className="text-[var(--text-secondary)]">Пока нет опубликованных объявлений</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(profile.listings ?? []).map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                photo={listing.imageUrl}
                title={listing.title}
                price={listing.basePrice}
                city={listing.city}
                owner={{ id: profile.id, name: profile.name, avatar: profile.avatar, rating: profile.rating_avg ?? undefined }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
