import type { Listing, ListingSearchQuery } from '@/domains/listing'
import type {
  HostAiRecommendation,
  HostListingStats,
  HostOverview,
  HostRiskSignal,
} from '@/domains/host'
import type { AdminAiRecommendation, AdminOverview, AdminSignal, ModerationItem } from '@/domains/admin'

/**
 * AI-ready extension points.
 * Replace implementations with real model / analytics endpoints later.
 */

function hashToUnit(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 0xffffffff
}

export function rankListings(listings: Listing[], query: ListingSearchQuery): Listing[] {
  // Stub: deterministic ranking by (city match + rating + price).
  const city = query.city?.toLowerCase().trim()
  return [...listings].sort((a, b) => {
    const aCity = city && a.city.toLowerCase().includes(city) ? 1 : 0
    const bCity = city && b.city.toLowerCase().includes(city) ? 1 : 0
    const aScore = aCity * 2 + a.rating - a.pricePerNight / 200
    const bScore = bCity * 2 + b.rating - b.pricePerNight / 200
    return bScore - aScore
  })
}

export function getHostOverview(hostId: string, listingCount: number): HostOverview {
  const u = hashToUnit(hostId)
  const occupancyRate = 0.55 + u * 0.35
  const revenueMonth = Math.round((1200 + u * 1800) * Math.max(1, listingCount / 2))
  return {
    totalListings: listingCount,
    occupancyRate,
    revenueMonth,
    currency: 'USD',
  }
}

export function getHostListingStats(hostId: string, listingIds: string[]): HostListingStats[] {
  return listingIds.map((id) => {
    const u = hashToUnit(`${hostId}:${id}`)
    const occupancyRate = 0.35 + u * 0.55
    const nightsBookedMonth = Math.round(30 * occupancyRate)
    const revenueMonth = Math.round(nightsBookedMonth * (55 + u * 90))
    return { listingId: id, nightsBookedMonth, occupancyRate, revenueMonth }
  })
}

export function getHostAiRecommendations(hostId: string): HostAiRecommendation[] {
  const u = hashToUnit(`rec:${hostId}`)
  return [
    {
      id: 'rec_price_weekend',
      title: `Raise weekend price +${Math.round(5 + u * 8)}%`,
      reason: 'Demand spike detected in your area for the next two weekends.',
      impact: 'HIGH',
    },
    {
      id: 'rec_photos_cover',
      title: 'Refresh cover photo',
      reason: 'Listings with brighter covers convert better in your city segment.',
      impact: 'MEDIUM',
    },
    {
      id: 'rec_min_stay',
      title: 'Try 2-night minimum for peak dates',
      reason: 'Reduces turnover costs without hurting occupancy for high demand windows.',
      impact: 'LOW',
    },
  ]
}

export function getHostRiskSignals(hostId: string): HostRiskSignal[] {
  const u = hashToUnit(`risk:${hostId}`)
  return [
    {
      id: 'risk_cancel',
      severity: u > 0.6 ? 'HIGH' : 'MEDIUM',
      title: 'Cancellation risk',
      description: 'Last-minute booking patterns increased for one of your listings.',
    },
    {
      id: 'risk_identity',
      severity: 'LOW',
      title: 'Identity verification',
      description: 'Enable extra verification on high-value weekends.',
    },
  ]
}

export function getAdminOverview(): AdminOverview {
  return {
    usersTotal: 1284,
    listingsTotal: 542,
    bookingsTotal: 3901,
    moderationQueueCount: 17,
  }
}

export function getAdminModerationQueue(): ModerationItem[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'mod_1',
      type: 'LISTING',
      title: 'Listing: “Sea view family home”',
      reason: 'Suspicious photo set',
      createdAt: now,
      priority: 'HIGH',
    },
    {
      id: 'mod_2',
      type: 'USER',
      title: 'User: new host account',
      reason: 'Rapid listing creation',
      createdAt: now,
      priority: 'MEDIUM',
    },
    {
      id: 'mod_3',
      type: 'BOOKING',
      title: 'Booking: last-minute high value',
      reason: 'Risk score elevated',
      createdAt: now,
      priority: 'MEDIUM',
    },
  ]
}

export function getAdminSignals(): AdminSignal[] {
  return [
    {
      id: 'sig_booking_velocity',
      title: 'Anomaly in booking velocity',
      detail: 'Unusual booking spikes across a cluster of users.',
      severity: 'HIGH',
    },
    {
      id: 'sig_price_outliers',
      title: 'Pricing outliers',
      detail: 'Multiple new listings priced far above comparable market rates.',
      severity: 'MEDIUM',
    },
  ]
}

export function getAdminAiRecommendations(): AdminAiRecommendation[] {
  return [
    {
      id: 'admin_rec_verify',
      title: 'Enable extra verification for affected users',
      action: 'Turn on step-up verification for high-risk bookings.',
      impact: 'HIGH',
    },
    {
      id: 'admin_rec_host_alerts',
      title: 'Send host pricing insights',
      action: 'Notify hosts about comparable rates to reduce price outliers.',
      impact: 'MEDIUM',
    },
  ]
}

