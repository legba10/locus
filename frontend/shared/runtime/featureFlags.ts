/**
 * LOCUS Runtime Feature Flags
 *
 * PATCH 10: Real Product Activation
 */

export type FeatureFlag =
  | 'REAL_AUTH_ENABLED'
  | 'TELEGRAM_ENABLED'
  | 'AI_ENABLED'
  | 'REAL_PIPELINE_ENABLED'
  | 'TELEGRAM_SAFE_MODE'
  | 'TELEGRAM_FULL_MODE'
  | 'AI_READ_ONLY'
  | 'SAFETY_CHECK_ENABLED'
  | 'ENVIRONMENT_AWARE_FLAGS'

const flags: Record<FeatureFlag, boolean> = {
  REAL_AUTH_ENABLED: true,
  TELEGRAM_ENABLED: false,
  AI_ENABLED: false,
  REAL_PIPELINE_ENABLED: true,
  TELEGRAM_SAFE_MODE: true,
  TELEGRAM_FULL_MODE: false,
  AI_READ_ONLY: true,
  SAFETY_CHECK_ENABLED: true,
  ENVIRONMENT_AWARE_FLAGS: true,
}

export interface EnvironmentAwareFlags {
  telegram: boolean
  ai: boolean
  auth: boolean
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flags[flag]
}

export function setFeatureFlag(flag: FeatureFlag, enabled: boolean): void {
  flags[flag] = enabled
}

export function getFeatureFlags(): Record<FeatureFlag, boolean> {
  return { ...flags }
}

export function disableAllFeatures(): void {
  Object.keys(flags).forEach((key) => {
    flags[key as FeatureFlag] = false
  })
}

export function getEnvironmentAwareFlags(env: 'LOCAL' | 'STAGING' | 'PROD'): EnvironmentAwareFlags {
  if (env === 'LOCAL') {
    return { telegram: false, ai: false, auth: false }
  }
  if (env === 'STAGING') {
    return { telegram: true, ai: true, auth: true }
  }
  return {
    telegram: flags.TELEGRAM_ENABLED,
    ai: flags.AI_ENABLED,
    auth: flags.REAL_AUTH_ENABLED,
  }
}

export function applyEnvironmentFlags(env: 'LOCAL' | 'STAGING' | 'PROD'): void {
  if (!flags.ENVIRONMENT_AWARE_FLAGS) return

  if (env === 'LOCAL') {
    flags.TELEGRAM_ENABLED = false
    flags.AI_ENABLED = false
    flags.REAL_AUTH_ENABLED = false
    flags.TELEGRAM_SAFE_MODE = true
    flags.TELEGRAM_FULL_MODE = false
    flags.AI_READ_ONLY = true
    return
  }

  if (env === 'STAGING') {
    flags.TELEGRAM_ENABLED = true
    flags.AI_ENABLED = true
    flags.REAL_AUTH_ENABLED = true
    flags.TELEGRAM_SAFE_MODE = true
    flags.TELEGRAM_FULL_MODE = false
    flags.AI_READ_ONLY = true
    return
  }

  // PROD: controlled by env flags already set on FeatureFlags
  return
}

export const FeatureFlags = {
  isEnabled: isFeatureEnabled,
  set: setFeatureFlag,
  getAll: getFeatureFlags,
  disableAll: disableAllFeatures,
  getEnvAware: getEnvironmentAwareFlags,
  applyEnv: applyEnvironmentFlags,
}

export default FeatureFlags
