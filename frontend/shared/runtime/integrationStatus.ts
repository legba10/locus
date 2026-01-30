/**
 * LOCUS Integration Status
 *
 * PATCH 11: Controlled Production Integration Layer
 */

import { FeatureFlags } from './featureFlags'

export function getIntegrationStatus() {
  return {
    ai: FeatureFlags.isEnabled('AI_ENABLED'),
    telegram: FeatureFlags.isEnabled('TELEGRAM_ENABLED'),
    auth: FeatureFlags.isEnabled('REAL_AUTH_ENABLED'),
    pipeline: FeatureFlags.isEnabled('REAL_PIPELINE_ENABLED'),
  }
}

export const IntegrationStatus = {
  get: getIntegrationStatus,
}

export default IntegrationStatus
