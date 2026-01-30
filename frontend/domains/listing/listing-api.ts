import type { Listing, ListingDetail, ListingSearchQuery } from './listing-types'
import { apiGet } from '@/shared/utils/api'

export type ListingsResponse = { items: Listing[] }
export type ListingDetailResponse = { item: ListingDetail }

export function buildListingsQuery(query: ListingSearchQuery) {
  const params = new URLSearchParams()
  if (query.city) params.set('city', query.city)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  if (query.guests) params.set('guests', String(query.guests))
  if (query.priceMin != null) params.set('priceMin', String(query.priceMin))
  if (query.priceMax != null) params.set('priceMax', String(query.priceMax))
  return params.toString()
}

export async function fetchListings(query: ListingSearchQuery) {
  const qs = buildListingsQuery(query)
  return apiGet<ListingsResponse>(`/api/listings${qs ? `?${qs}` : ''}`)
}

export async function fetchListingDetail(id: string) {
  return apiGet<ListingDetailResponse>(`/api/listings/${encodeURIComponent(id)}`)
}

