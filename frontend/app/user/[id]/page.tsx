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
  const ownerPercent =
    summary && summary.count > 0 && summary.distribution
      ? Math.round((((summary.distribution[4] ?? 0) + (summary.distribution[5] ?? 0)) / summary.count) * 100)
      : null

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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          className={cn(
            'bg-white rounded-[18px] p-6 mb-8',
            'shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-gray-100/80'
          )}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {profile.avatar ? (
                <Image src={profile.avatar} alt={profile.name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#1C1F26]">{profile.name}</h1>
              {!isOwnProfile && (summary?.avg != null || profile.rating_avg != null) && (
                <p className="text-[14px] mt-0.5 flex items-baseline gap-2 flex-wrap">
                  <span className="text-amber-500">★</span>
                  <span className="font-semibold text-[#1C1F26]">{(summary?.avg ?? profile.rating_avg ?? 0).toFixed(1)}</span>
                  {ownerPercent != null && <span className="text-violet-600 font-medium tabular-nums">{ownerPercent}%</span>}
                  {((summary?.count ?? profile.reviews_count) ?? 0) > 0 && (
                    <span className="text-[#6B7280]">
                      {(summary?.count ?? profile.reviews_count)} отзывов
                    </span>
                  )}
                </p>
              )}
              {isOwnProfile && profile.rating_avg != null && (
                <p className="text-[14px] text-[#6B7280] mt-0.5">
                  Рейтинг {profile.rating_avg.toFixed(1)} · {profile.reviews_count} отзывов
                </p>
              )}
              <p className="text-[14px] text-[#6B7280]">{profile.listingsCount} объявлений</p>
              {profile.created_at && (
                <p className="text-[13px] text-[#6B7280]">
                  На LOCUS с {new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </p>
              )}
              <p className="text-[13px] text-emerald-600 mt-1">Отвечает быстро</p>
            </div>
          </div>
        </div>

        <h2 className="text-[20px] font-bold text-[var(--text-main)] mb-4">Объявления</h2>
        {profile.listings.length === 0 ? (
          <p className="text-[var(--text-secondary)]">Пока нет опубликованных объявлений</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.listings.map((listing) => (
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
