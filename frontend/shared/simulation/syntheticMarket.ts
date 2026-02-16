/**
 * LOCUS Synthetic Market Generator
 *
 * PATCH 9: Real World Simulation Engine
 */

import type { ListingCard } from '../domain/listing.model'
import type { UserProfile } from '../domain/userProfile.model'
import type { RawEvent } from '../events/event.types'
import { cityIn } from '@/shared/lib/cityDeclension'

export interface SyntheticMarketConfig {
  city: string
  count: number
  priceMin?: number
  priceMax?: number
  rooms?: number[]
}

export function createSyntheticListings(
  config: SyntheticMarketConfig,
  random: () => number
): ListingCard[] {
  const listings: ListingCard[] = []
  const priceMin = config.priceMin || 25000
  const priceMax = config.priceMax || 80000
  const rooms = config.rooms || [1, 2, 3]

  for (let i = 0; i < config.count; i += 1) {
    const price = Math.round(priceMin + random() * (priceMax - priceMin))
    const roomsCount = rooms[Math.floor(random() * rooms.length)]
    listings.push({
      id: `listing_${config.city}_${i}`,
      title: `Квартира ${roomsCount}к ${cityIn(config.city)}`,
      price,
      city: config.city,
      district: random() > 0.7 ? `Район ${Math.ceil(random() * 5)}` : undefined,
      coverPhoto: null,
      rooms: roomsCount,
      area: Math.round(30 + random() * 50),
    views: 0,
      isNew: random() > 0.6,
      isVerified: random() > 0.5,
    })
  }

  return listings
}

export function createSyntheticUsers(
  count: number,
  city: string
): UserProfile[] {
  const users: UserProfile[] = []
  for (let i = 0; i < count; i += 1) {
    users.push({
      userId: `synthetic_${city}_${i}`,
      intent: {
        rent: true,
        city,
        confidence: 0.3 + (i % 5) * 0.1,
      },
      behavior: {
        viewedListings: [],
        favoriteListings: [],
        contactedListings: [],
        sessionCount: 1,
        totalTimeSpent: 0,
        lastActiveAt: new Date().toISOString(),
      },
      signals: {
        activityScore: 20 + (i % 10) * 5,
        priceSensitivity: 0.4,
        locationAffinity: { [city]: 0.6 },
        typePreference: {},
        engagementLevel: 'cold',
        conversionProbability: 0.1,
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  return users
}

export function createSyntheticEvent(
  source: RawEvent['source'],
  type: string,
  data?: Record<string, unknown>
): RawEvent {
  return {
    source,
    type,
    data,
    timestamp: Date.now(),
  }
}
