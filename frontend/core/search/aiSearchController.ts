'use client'

import type { FilterState } from '@/core/filters'
import { apiFetchJson } from '@/shared/api/client'
import { buildAiHintFromFilters, buildSearchQuery } from '@/core/search/buildQuery'
import type { SearchListingResponse } from '@/core/search/searchController'

function buildUserAiContextHint(): string {
  if (typeof window === 'undefined') return ''
  const parts: string[] = []
  const viewed = window.localStorage.getItem('locus_last_viewed_cities')
  const favorite = window.localStorage.getItem('locus_last_favorite_city')
  if (viewed) parts.push(viewed)
  if (favorite) parts.push(favorite)
  return parts.join(' ').trim()
}

export async function runAiSearch(filters: FilterState, page = 1): Promise<SearchListingResponse> {
  const hint = [buildAiHintFromFilters(filters), buildUserAiContextHint()].filter(Boolean).join(' ')
  const { queryString } = buildSearchQuery(filters, {
    mode: 'ai',
    page,
    limit: 20,
    aiHint: hint,
  })
  return apiFetchJson<SearchListingResponse>(`/search?${queryString}`)
}
