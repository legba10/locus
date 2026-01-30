export type AdminOverview = {
  usersTotal: number
  listingsTotal: number
  bookingsTotal: number
  moderationQueueCount: number
}

export type ModerationItem = {
  id: string
  type: 'LISTING' | 'USER' | 'BOOKING'
  title: string
  reason: string
  createdAt: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

export type AdminSignal = {
  id: string
  title: string
  detail: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

export type AdminAiRecommendation = {
  id: string
  title: string
  action: string
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
}

