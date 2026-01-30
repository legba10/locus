/**
 * LOCUS Integration Matrix
 *
 * PATCH 11: Controlled Production Integration Layer
 *
 * Defines safe activation order.
 */

export type IntegrationKey = 'AI' | 'TELEGRAM' | 'AUTH' | 'REAL_USERS'

export interface IntegrationRule {
  dependsOn: IntegrationKey[]
  safeMode: boolean
}

export const IntegrationMatrix: Record<IntegrationKey, IntegrationRule> = {
  AI: {
    dependsOn: [],
    safeMode: true,
  },
  TELEGRAM: {
    dependsOn: ['AI'],
    safeMode: true,
  },
  AUTH: {
    dependsOn: [],
    safeMode: true,
  },
  REAL_USERS: {
    dependsOn: ['AUTH'],
    safeMode: false,
  },
}

export default IntegrationMatrix
