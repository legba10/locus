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
  const warnings: string[] = []

  for (const [key, rule] of Object.entries(IntegrationMatrix)) {
    const integration = key as keyof typeof flagMap
    const flag = flagMap[integration]
    if (FeatureFlags.isEnabled(flag)) {
      for (const dep of rule.dependsOn) {
        const depFlag = flagMap[dep]
        if (!FeatureFlags.isEnabled(depFlag)) {
          warnings.push(`${integration} recommended to have ${dep} enabled`)
        }
      }
    }
  }

  if (warnings.length) {
    // eslint-disable-next-line no-console
    console.warn('[LOCUS Integration Guard]', warnings.join('; '))
  }
}

export const IntegrationGuard = {
  check: checkIntegrationSafety,
}

export default IntegrationGuard
