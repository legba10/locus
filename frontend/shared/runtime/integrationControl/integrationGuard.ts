/**
 * LOCUS Integration Guard
 *
 * PATCH 11: Controlled Production Integration Layer
 */

import { IntegrationMatrix } from './integrationMatrix'
import { FeatureFlags } from '../featureFlags'

const flagMap = {
  AI: 'AI_ENABLED',
  TELEGRAM: 'TELEGRAM_ENABLED',
  AUTH: 'REAL_AUTH_ENABLED',
  REAL_USERS: 'REAL_PIPELINE_ENABLED',
} as const

export function checkIntegrationSafety(): void {
  const errors: string[] = []

  for (const [key, rule] of Object.entries(IntegrationMatrix)) {
    const integration = key as keyof typeof flagMap
    const flag = flagMap[integration]
    if (FeatureFlags.isEnabled(flag)) {
      for (const dep of rule.dependsOn) {
        const depFlag = flagMap[dep]
        if (!FeatureFlags.isEnabled(depFlag)) {
          errors.push(`${integration} cannot be enabled before ${dep}`)
        }
      }
    }
  }

  if (errors.length) {
    throw new Error('[LOCUS Integration Guard] ' + errors.join(', '))
  }
}

export const IntegrationGuard = {
  check: checkIntegrationSafety,
}

export default IntegrationGuard
