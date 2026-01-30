/**
 * LOCUS Pipeline Safety Layer
 *
 * PATCH 11: Controlled Production Integration Layer
 */

import { FeatureFlags } from '../featureFlags'
import { checkIntegrationSafety } from '../integrationControl/integrationGuard'

export function safetyLayer(): void {
  if (FeatureFlags.isEnabled('SAFETY_CHECK_ENABLED')) {
    checkIntegrationSafety()
  }
}

export const SafetyLayer = {
  run: safetyLayer,
}

export default SafetyLayer
