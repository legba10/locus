'use client'

import { useMemo } from 'react'

function mapAmenities(arr: unknown): ('wifi' | 'parking' | 'center' | 'metro')[] {
  if (!Array.isArray(arr)) return []
  const out: ('wifi' | 'parking' | 'center' | 'metro')[] = []
  const s = arr.join(' ').toLowerCase()
  if (s.includes('wifi') || s.includes('wi-fi') || s.includes('интернет')) out.push('wifi')
  if (s.includes('parking') || s.includes('парковк')) out.push('parking')
  if (s.includes('center') || s.includes('центр')) out.push('center')
  if (s.includes('metro') || s.includes('метро')) out.push('metro')
  return out.slice(0, 3)
}

interface ListingsResponse {
  items?: any[]
}

export function useHomeListingCards(data: ListingsResponse | undefined) {
  return useMemo(() => (data?.items || []).map((listing: any, index: number) => {
    const photo = listing.photos?.[0]?.url || listing.images?.[0]?.url || null
    const district = listing.district || null
    const views = listing.viewsCount || listing.views || 0
    const isNew = listing.isNew || false
    const isVerified = (listing.score || 0) >= 70
    const tags = (listing.reasons || []).slice(0, 2).map((reason: string) => {
      if (reason.includes('ниже рынка') || reason.includes('Выгодная')) return 'Выгодная цена'
      if (reason.includes('метро') || reason.includes('транспорт')) return 'Рядом метро'
      if (reason.includes('спрос') || reason.includes('Популярное')) return 'Популярное'
      return null
    }).filter(Boolean) as string[]
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
    const cache = listing.ratingCache as { rating?: number; positive_ratio?: number; cleanliness?: number; noise?: number } | null | undefined
    const score = listing.score || 50
    const badgeList: ('verified' | 'ai' | 'top' | 'new')[] = []
    if (isVerified) badgeList.push('verified')
    if (listing.aiRecommended || listing.isAiMatch) badgeList.push('ai')
    if (score >= 75) badgeList.push('top')
    if (isNew) badgeList.push('new')
    const badges = badgeList.slice(0, 2)
    const rentalType = (listing.rentPeriod || listing.rentType || '').toString().toLowerCase().includes('month') ? 'month' : 'night'
    return {
      id: listing.id ?? `listing-${index}`,
      photo,
      title: cleanTitle,
      price: listing.pricePerNight || listing.basePrice || 0,
      city: listing.city || 'Не указан',
      district,
      metro: listing.metro || listing.metroStation || null,
      rentalType,
      rooms: listing.bedrooms ?? listing.rooms ?? 1,
      area: listing.area ?? 40,
      guests: listing.maxGuests ?? listing.guests ?? null,
      floor: listing.floor ?? null,
      totalFloors: listing.totalFloors ?? null,
      views,
      isNew,
      isVerified,
      score,
      verdict: listing.verdict || 'Средний вариант',
      reasons: listing.reasons || [],
      tags: tags.length > 0 ? tags : (score >= 70 ? ['Рекомендуем'] : []),
      badges,
      aiReasons: (listing.reasons || []).length > 0 ? listing.reasons : (listing.verdict ? [listing.verdict] : null),
      rating: cache?.rating ?? null,
      reviewPercent: cache?.positive_ratio != null ? Math.round(cache.positive_ratio * 100) : null,
      reviewCount: listing.reviewCount ?? listing.reviewsCount ?? null,
      propertyType: (listing.type || 'apartment').toString().toLowerCase(),
      amenities: mapAmenities(listing.amenities),
      cleanliness: cache?.cleanliness ?? null,
      noise: cache?.noise ?? null,
    }
  }), [data?.items])
}
