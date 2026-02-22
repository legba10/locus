'use client'

import type { FilterState } from '@/core/filters'

export type SearchMode = 'manual' | 'ai'

export interface SearchQueryOptions {
  mode: SearchMode
  page: number
  limit?: number
  expand?: boolean
  aiHint?: string
}

export interface BuiltSearchQuery {
  params: URLSearchParams
  queryString: string
}

function asPositiveInt(n: unknown, fallback: number): number {
  const x = Number(n)
  if (!Number.isFinite(x) || x < 1) return fallback
  return Math.floor(x)
}

export function buildSearchQuery(filters: FilterState, options: SearchQueryOptions): BuiltSearchQuery {
  const params = new URLSearchParams()
  const page = asPositiveInt(options.page, 1)
  const limit = asPositiveInt(options.limit ?? 20, 20)
  const roomsMin = Array.isArray(filters.rooms) && filters.rooms.length > 0 ? Math.max(...filters.rooms) : null

  if (filters.city) params.set('city', filters.city)
  if (filters.priceFrom != null) params.set('priceMin', String(filters.priceFrom))
  if (filters.priceTo != null) params.set('priceMax', String(filters.priceTo))
  if (roomsMin != null) params.set('rooms', String(roomsMin))
  if (Array.isArray(filters.type) && filters.type.length > 0) {
    params.set('types', filters.type.map((x) => x.toUpperCase()).join(','))
  }
  if (filters.radius > 0) params.set('radiusKm', String(Math.round(filters.radius / 1000)))
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.duration) params.set('duration', filters.duration)
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (options.expand) params.set('expand', '1')

  if (options.mode === 'ai') {
    params.set('ai', '1')
    params.set('q', options.aiHint?.trim() || buildAiHintFromFilters(filters))
  }

  return { params, queryString: params.toString() }
}

export function buildAiHintFromFilters(filters: FilterState): string {
  const chunks: string[] = []
  if (filters.city) chunks.push(filters.city)
  if (filters.priceFrom != null || filters.priceTo != null) {
    const min = filters.priceFrom != null ? `от ${filters.priceFrom}` : ''
    const max = filters.priceTo != null ? `до ${filters.priceTo}` : ''
    chunks.push([min, max].filter(Boolean).join(' '))
  }
  if (Array.isArray(filters.rooms) && filters.rooms.length > 0) {
    chunks.push(`${Math.max(...filters.rooms)}+ комнаты`)
  }
  if (Array.isArray(filters.type) && filters.type.length > 0) {
    chunks.push(filters.type.join(', '))
  }
  return chunks.join(' ').trim() || 'подбери жилье по моим фильтрам'
}
