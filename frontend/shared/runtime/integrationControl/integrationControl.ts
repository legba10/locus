/**
 * LOCUS Integration Control
 *
 * PATCH 11: Controlled Production Integration Layer
 */

import { IntegrationMatrix, type IntegrationKey } from './integrationMatrix'
import { FeatureFlags } from '../featureFlags'
import { checkIntegrationSafety } from './integrationGuard'

const flagMap: Record<IntegrationKey, Parameters<typeof FeatureFlags.isEnabled>[0]> = {
  AI: 'AI_ENABLED',
  TELEGRAM: 'TELEGRAM_ENABLED',
  AUTH: 'REAL_AUTH_ENABLED',
  REAL_USERS: 'REAL_PIPELINE_ENABLED',
}

export function enableIntegration(key: IntegrationKey): void {
  FeatureFlags.set(flagMap[key], true)
  checkIntegrationSafety()
}

export function disableIntegration(key: IntegrationKey): void {
  FeatureFlags.set(flagMap[key], false)
}

export function getIntegrationRules(key: IntegrationKey) {
  return IntegrationMatrix[key]
}

export function canEnableIntegration(key: IntegrationKey): boolean {
  const rule = IntegrationMatrix[key]
  return rule.dependsOn.every(dep => FeatureFlags.isEnabled(flagMap[dep]))
}

export const IntegrationControl = {
  enable: enableIntegration,
  disable: disableIntegration,
  canEnable: canEnableIntegration,
  getRules: getIntegrationRules,
}

export default IntegrationControl
