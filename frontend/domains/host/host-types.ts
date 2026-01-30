export type HostOverview = {
  totalListings: number
  occupancyRate: number // 0..1
  revenueMonth: number
  currency: 'USD' | 'EUR' | 'RUB'
}

export type HostListingStats = {
  listingId: string
  nightsBookedMonth: number
  occupancyRate: number // 0..1
  revenueMonth: number
}

export type HostRiskSignal = {
  id: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  title: string
  description: string
}

export type HostAiRecommendation = {
  id: string
  title: string
  reason: string
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
}

