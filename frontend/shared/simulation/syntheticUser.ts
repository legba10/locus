/**
 * LOCUS Synthetic User Generator
 *
 * PATCH 9: Real World Simulation Engine
 */

import type { User } from '../domain/user.model'
import type { UserProfile } from '../domain/userProfile.model'
import { createEmptyProfile } from '../domain/userProfile.model'

export interface SyntheticUserConfig {
  id: string
  role?: User['role']
  city?: string
  intentConfidence?: number
}

export function createSyntheticUser(config: SyntheticUserConfig): User {
  return {
    id: config.id,
    supabaseId: `sb_${config.id}`,
    role: config.role || 'user',
    roles: [config.role || 'user'],
    name: `User ${config.id}`,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  }
}

export function createSyntheticProfile(
  userId: string,
  config?: { city?: string; intentConfidence?: number }
): UserProfile {
  const profile = createEmptyProfile(userId)
  profile.intent.city = config?.city || 'Москва'
  profile.intent.confidence = config?.intentConfidence ?? 0.4
  profile.behavior.sessionCount = 1
  profile.behavior.lastActiveAt = new Date().toISOString()
  profile.signals.activityScore = 30
  profile.signals.engagementLevel = 'warm'
  return profile
}
