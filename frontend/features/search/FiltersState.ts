/**
 * TZ-2: состояние фильтров поиска
 */

export type SearchFilters = {
  city?: string
  query?: string
  priceMin?: number
  priceMax?: number
  rooms?: number
  type?: 'apartment' | 'room' | 'studio'
  radius?: number
  mode?: 'manual' | 'ai'
}
