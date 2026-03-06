/**
 * TZ-2: API поиска объявлений
 * Backend: GET /api/search (city, q, priceMin, priceMax, rooms, type, ai, page, limit)
 */

import { apiFetchJson } from '@/shared/api/client'
import type { SearchFilters } from './FiltersState'

const TYPE_MAP: Record<string, string> = {
  apartment: 'APARTMENT',
  room: 'ROOM',
  studio: 'STUDIO',
}

export interface SearchListingsResponse {
  items: Array<{
    id: string
    title?: string
    basePrice?: number
    city?: string
    photos?: Array<{ url: string }>
    images?: Array<{ url: string }>
    bedrooms?: number
    district?: string
    area?: number
  }>
  total?: number
  page?: number
  limit?: number
}

export async function searchListings(filters: SearchFilters, page = 1): Promise<SearchListingsResponse> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', '20')

  if (filters.query) params.set('q', filters.query)
  if (filters.city) params.set('city', filters.city)
  if (filters.rooms != null) params.set('rooms', String(filters.rooms))
  if (filters.priceMin != null) params.set('priceMin', String(filters.priceMin))
  if (filters.priceMax != null) params.set('priceMax', String(filters.priceMax))
  if (filters.type) params.set('type', TYPE_MAP[filters.type] ?? filters.type.toUpperCase())
  if (filters.radius != null) params.set('radiusKm', String(filters.radius))
  if (filters.mode === 'ai') params.set('ai', '1')

  const res = await apiFetchJson<SearchListingsResponse>(`/api/search?${params.toString()}`)
  return res ?? { items: [], total: 0 }
}
