'use client'

import type { FilterState } from '@/core/filters'
import { apiFetchJson } from '@/shared/api/client'
import { buildSearchQuery } from '@/core/search/buildQuery'

export interface SearchListingResponse {
  items: any[]
  total?: number
  page?: number
  limit?: number
}

export async function runManualSearch(filters: FilterState, page = 1): Promise<SearchListingResponse> {
  const { queryString } = buildSearchQuery(filters, { mode: 'manual', page, limit: 20 })
  return apiFetchJson<SearchListingResponse>(`/search?${queryString}`)
}
