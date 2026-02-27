/**
 * TZ-80: структура фильтров поиска
 */

export interface Filters {
  city?: string
  priceMin?: number
  priceMax?: number
  rooms?: number
  rentType?: 'daily' | 'monthly'
}

export type SearchMode = 'normal' | 'ai'
