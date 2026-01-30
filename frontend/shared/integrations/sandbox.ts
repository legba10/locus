/**
 * LOCUS Integration Sandbox Mode
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Controls sandbox mode for all integrations.
 * When integrations break, they run in sandbox.
 */

import { logger } from '../utils/logger'
import { setTelegramMode } from './telegram'
import { setAIMode } from './ai'
import { setPaymentsMode } from './payments'

/**
 * Integration modes
 */
export type IntegrationMode = 'sandbox' | 'production'

/**
 * Integration status
 */
export interface IntegrationModes {
  telegram: IntegrationMode
  ai: IntegrationMode
  payments: IntegrationMode
}

/**
 * Current modes
 */
const currentModes: IntegrationModes = {
  telegram: 'sandbox',
  ai: 'sandbox',
  payments: 'sandbox',
}

/**
 * Set mode for specific integration
 */
export function setIntegrationMode(
  integration: keyof IntegrationModes,
  mode: IntegrationMode
): void {
  currentModes[integration] = mode
  
  switch (integration) {
    case 'telegram':
      setTelegramMode(mode)
      break
    case 'ai':
      setAIMode(mode)
      break
    case 'payments':
      setPaymentsMode(mode)
      break
  }
  
  logger.info('IntegrationSandbox', `${integration} mode set to: ${mode}`)
}

/**
 * Set all integrations to mode
 */
export function setAllModes(mode: IntegrationMode): void {
  setIntegrationMode('telegram', mode)
  setIntegrationMode('ai', mode)
  setIntegrationMode('payments', mode)
}

/**
 * Get current modes
 */
export function getModes(): IntegrationModes {
  return { ...currentModes }
}

/**
 * Check if any integration is in production
 */
export function hasProductionIntegration(): boolean {
  return Object.values(currentModes).some(m => m === 'production')
}

/**
 * Check if all integrations are in sandbox
 */
export function allInSandbox(): boolean {
  return Object.values(currentModes).every(m => m === 'sandbox')
}

/**
 * Integration feature flags
 */
export const IntegrationFlags = {
  /** Allow Telegram login */
  TELEGRAM_AUTH: false,
  
  /** Allow Telegram notifications */
  TELEGRAM_NOTIFICATIONS: false,
  
  /** Allow external AI for matching */
  AI_MATCHING: false,
  
  /** Allow external AI for descriptions */
  AI_DESCRIPTIONS: false,
  
  /** Allow real payments */
  PAYMENTS_LIVE: false,
  
  /** Allow subscriptions */
  SUBSCRIPTIONS: false,
}

/**
 * Check feature flag
 */
export function isFeatureEnabled(flag: keyof typeof IntegrationFlags): boolean {
  return IntegrationFlags[flag]
}

/**
 * Enable feature (for testing)
 */
export function enableFeature(flag: keyof typeof IntegrationFlags): void {
  IntegrationFlags[flag] = true
  logger.info('IntegrationSandbox', `Feature enabled: ${flag}`)
}

/**
 * Disable feature
 */
export function disableFeature(flag: keyof typeof IntegrationFlags): void {
  IntegrationFlags[flag] = false
  logger.info('IntegrationSandbox', `Feature disabled: ${flag}`)
}

/**
 * Reset all to sandbox
 */
export function resetToSandbox(): void {
  setAllModes('sandbox')
  Object.keys(IntegrationFlags).forEach(key => {
    IntegrationFlags[key as keyof typeof IntegrationFlags] = false
  })
  logger.info('IntegrationSandbox', 'All integrations reset to sandbox')
}

export default {
  setIntegrationMode,
  setAllModes,
  getModes,
  hasProductionIntegration,
  allInSandbox,
  IntegrationFlags,
  isFeatureEnabled,
  enableFeature,
  disableFeature,
  resetToSandbox,
}
