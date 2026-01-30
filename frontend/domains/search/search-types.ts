export type CitySuggestion = {
  id: string
  label: string
  country?: string
}

export type SearchFilters = {
  city?: string
  from?: string
  to?: string
  guests?: number
  priceMax?: number
}

