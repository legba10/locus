/**
 * LOCUS Growth Metrics
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * High-level growth metrics for platform management.
 */

import type { UserProfile } from '../domain/userProfile.model'
import type { TrackedEvent } from './events'
import type { ProductState } from '../domain/flows/product.flow'

/**
 * Growth metric types
 */
export type GrowthMetricType =
  | 'activation_rate'
  | 'retention_rate'
  | 'conversion_rate'
  | 'monetization_rate'
  | 'churn_rate'
  | 'viral_coefficient'

/**
 * Time cohort
 */
export type TimeCohort = 'day1' | 'day7' | 'day14' | 'day30' | 'day90'

/**
 * Growth metrics snapshot
 */
export interface GrowthMetrics {
  /** New user → active user rate */
  activationRate: number
  
  /** Returning users rate */
  retentionRate: number
  
  /** User → paying user rate */
  conversionRate: number
  
  /** Revenue per active user */
  arpu: number
  
  /** Monthly monetization pressure */
  monetizationPressure: number
  
  /** Churn risk average */
  avgChurnRisk: number
  
  /** Viral coefficient (users bringing users) */
  viralCoefficient: number
  
  /** Period */
  period: string
  
  /** Timestamp */
  calculatedAt: string
}

/**
 * User growth evaluation
 */
export interface UserGrowthEvaluation {
  userId: string
  
  /** Is user activated (completed key action) */
  isActivated: boolean
  
  /** Activation score (0-100) */
  activationScore: number
  
  /** Retention risk (0-1, higher = more likely to leave) */
  churnRisk: number
  
  /** Conversion probability (0-1) */
  conversionProbability: number
  
  /** Monetization potential (0-100) */
  monetizationPotential: number
  
  /** Days since last activity */
  daysSinceLastActivity: number
  
  /** Cohort (when they joined) */
  cohort: TimeCohort
  
  /** Growth stage */
  stage: 'new' | 'activated' | 'engaged' | 'converted' | 'churning' | 'churned'
}

/**
 * Cohort metrics
 */
export interface CohortMetrics {
  cohort: TimeCohort
  totalUsers: number
  activatedUsers: number
  retainedUsers: number
  convertedUsers: number
  churnedUsers: number
  activationRate: number
  retentionRate: number
  conversionRate: number
}

// ==========================================
// METRIC CALCULATIONS
// ==========================================

/**
 * Calculate activation rate
 * Activated = viewed 3+ listings OR added favorite
 */
export function calculateActivationRate(profiles: UserProfile[]): number {
  if (profiles.length === 0) return 0
  
  const activated = profiles.filter(p => 
    p.behavior.viewedListings.length >= 3 ||
    p.behavior.favoriteListings.length >= 1
  ).length
  
  return Math.round((activated / profiles.length) * 100)
}

/**
 * Calculate retention rate
 * Retained = active in last 7 days
 */
export function calculateRetentionRate(profiles: UserProfile[]): number {
  if (profiles.length === 0) return 0
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const retained = profiles.filter(p => {
    const lastActive = new Date(p.behavior.lastActiveAt)
    return lastActive >= sevenDaysAgo
  }).length
  
  return Math.round((retained / profiles.length) * 100)
}

/**
 * Calculate conversion rate
 * Converted = contacted owner
 */
export function calculateConversionRate(profiles: UserProfile[]): number {
  if (profiles.length === 0) return 0
  
  const converted = profiles.filter(p => 
    p.behavior.contactedListings.length > 0
  ).length
  
  return Math.round((converted / profiles.length) * 100)
}

/**
 * Calculate churn risk for a user
 */
export function calculateChurnRisk(profile: UserProfile): number {
  const now = new Date()
  const lastActive = new Date(profile.behavior.lastActiveAt)
  const daysSinceActive = Math.floor(
    (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Base risk from inactivity
  let risk = Math.min(1, daysSinceActive / 30) * 0.5
  
  // Low engagement increases risk
  if (profile.signals.engagementLevel === 'cold') {
    risk += 0.3
  } else if (profile.signals.engagementLevel === 'warm') {
    risk += 0.1
  }
  
  // No favorites = higher risk
  if (profile.behavior.favoriteListings.length === 0) {
    risk += 0.2
  }
  
  // Contact = very engaged, low risk
  if (profile.behavior.contactedListings.length > 0) {
    risk -= 0.3
  }
  
  return Math.max(0, Math.min(1, risk))
}

/**
 * Calculate monetization potential
 */
export function calculateMonetizationPotential(profile: UserProfile): number {
  let score = 0
  
  // Active users have potential
  score += profile.signals.activityScore * 0.3
  
  // High intent = valuable
  score += profile.intent.confidence * 30
  
  // Engaged users more likely to pay
  if (profile.signals.engagementLevel === 'hot') {
    score += 30
  } else if (profile.signals.engagementLevel === 'warm') {
    score += 15
  }
  
  // Near conversion = high potential
  score += profile.signals.conversionProbability * 30
  
  return Math.min(100, Math.round(score))
}

/**
 * Evaluate user growth stage
 */
export function evaluateUserGrowth(profile: UserProfile): UserGrowthEvaluation {
  const now = new Date()
  const lastActive = new Date(profile.behavior.lastActiveAt)
  const daysSinceActive = Math.floor(
    (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const isActivated = 
    profile.behavior.viewedListings.length >= 3 ||
    profile.behavior.favoriteListings.length >= 1
  
  const activationScore = Math.min(100,
    profile.behavior.viewedListings.length * 10 +
    profile.behavior.favoriteListings.length * 20 +
    profile.behavior.sessionCount * 5
  )
  
  const churnRisk = calculateChurnRisk(profile)
  const monetizationPotential = calculateMonetizationPotential(profile)
  
  // Determine cohort
  const created = new Date(profile.createdAt)
  const daysOnPlatform = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  )
  const cohort: TimeCohort = 
    daysOnPlatform <= 1 ? 'day1' :
    daysOnPlatform <= 7 ? 'day7' :
    daysOnPlatform <= 14 ? 'day14' :
    daysOnPlatform <= 30 ? 'day30' : 'day90'
  
  // Determine stage
  let stage: UserGrowthEvaluation['stage']
  if (daysSinceActive > 30) {
    stage = 'churned'
  } else if (churnRisk > 0.7) {
    stage = 'churning'
  } else if (profile.behavior.contactedListings.length > 0) {
    stage = 'converted'
  } else if (profile.signals.engagementLevel === 'hot') {
    stage = 'engaged'
  } else if (isActivated) {
    stage = 'activated'
  } else {
    stage = 'new'
  }
  
  return {
    userId: profile.userId,
    isActivated,
    activationScore,
    churnRisk,
    conversionProbability: profile.signals.conversionProbability,
    monetizationPotential,
    daysSinceLastActivity: daysSinceActive,
    cohort,
    stage,
  }
}

/**
 * Calculate full growth metrics
 */
export function calculateGrowthMetrics(
  profiles: UserProfile[],
  period: string = 'last_30_days'
): GrowthMetrics {
  const activationRate = calculateActivationRate(profiles)
  const retentionRate = calculateRetentionRate(profiles)
  const conversionRate = calculateConversionRate(profiles)
  
  const churnRisks = profiles.map(calculateChurnRisk)
  const avgChurnRisk = churnRisks.length > 0
    ? churnRisks.reduce((a, b) => a + b, 0) / churnRisks.length
    : 0
  
  const monetizationPotentials = profiles.map(calculateMonetizationPotential)
  const monetizationPressure = monetizationPotentials.length > 0
    ? monetizationPotentials.reduce((a, b) => a + b, 0) / monetizationPotentials.length / 100
    : 0
  
  return {
    activationRate,
    retentionRate,
    conversionRate,
    arpu: 0, // Would need payment data
    monetizationPressure,
    avgChurnRisk,
    viralCoefficient: 0.1, // Placeholder
    period,
    calculatedAt: new Date().toISOString(),
  }
}

/**
 * Calculate cohort metrics
 */
export function calculateCohortMetrics(
  profiles: UserProfile[],
  cohort: TimeCohort
): CohortMetrics {
  // Filter profiles by cohort
  const now = new Date()
  const cohortProfiles = profiles.filter(p => {
    const created = new Date(p.createdAt)
    const daysOnPlatform = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    switch (cohort) {
      case 'day1': return daysOnPlatform <= 1
      case 'day7': return daysOnPlatform > 1 && daysOnPlatform <= 7
      case 'day14': return daysOnPlatform > 7 && daysOnPlatform <= 14
      case 'day30': return daysOnPlatform > 14 && daysOnPlatform <= 30
      case 'day90': return daysOnPlatform > 30 && daysOnPlatform <= 90
    }
  })
  
  const evaluations = cohortProfiles.map(evaluateUserGrowth)
  
  return {
    cohort,
    totalUsers: cohortProfiles.length,
    activatedUsers: evaluations.filter(e => e.isActivated).length,
    retainedUsers: evaluations.filter(e => e.daysSinceLastActivity <= 7).length,
    convertedUsers: evaluations.filter(e => e.stage === 'converted').length,
    churnedUsers: evaluations.filter(e => e.stage === 'churned').length,
    activationRate: calculateActivationRate(cohortProfiles),
    retentionRate: calculateRetentionRate(cohortProfiles),
    conversionRate: calculateConversionRate(cohortProfiles),
  }
}

// ==========================================
// EXPORTS
// ==========================================

export const GrowthMetrics = {
  calculateActivationRate,
  calculateRetentionRate,
  calculateConversionRate,
  calculateChurnRisk,
  calculateMonetizationPotential,
  evaluateUserGrowth,
  calculateGrowthMetrics,
  calculateCohortMetrics,
}

export default GrowthMetrics
