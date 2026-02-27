/**
 * TZ-79: типы страницы объявления (нормализованные из API)
 */

export interface ListingItem {
  id: string
  title: string
  description: string
  city: string
  addressLine?: string
  district?: string
  bedrooms?: number
  area?: number
  lat?: number
  lng?: number
  pricePerNight: number
  photos: Array<{ url: string; alt?: string }>
  amenities: string[]
  status?: string
  statusCanonical?: string
  owner?: {
    id: string
    name: string
    avatar: string | null
    rating?: number | null
    reviewsCount?: number | null
    listingsCount?: number
  }
}

export type ListingRole = 'user' | 'owner' | 'admin'
