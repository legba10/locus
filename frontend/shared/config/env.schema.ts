/**
 * LOCUS Environment Configuration
 * 
 * ARCHITECTURE LOCK:
 * Validates required environment variables at startup.
 */

import { logger } from '../utils/logger'

/**
 * Environment variable definition
 */
interface EnvVar {
  key: string
  required: boolean
  defaultValue?: string
  validate?: (value: string) => boolean
}

/**
 * Required environment variables
 */
const ENV_SCHEMA: EnvVar[] = [
  // API
  {
    key: 'NEXT_PUBLIC_API_URL',
    required: true,
    validate: (v) => v.startsWith('http'),
  },
  
  // Supabase
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    validate: (v) => v.includes('supabase'),
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    validate: (v) => v.length > 20,
  },
]

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate environment configuration
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const envVar of ENV_SCHEMA) {
    const value = process.env[envVar.key]

    if (!value) {
      if (envVar.required && !envVar.defaultValue) {
        errors.push(`Missing required env: ${envVar.key}`)
      } else if (envVar.defaultValue) {
        warnings.push(`Using default for ${envVar.key}: ${envVar.defaultValue}`)
      }
      continue
    }

    if (envVar.validate && !envVar.validate(value)) {
      errors.push(`Invalid env value for ${envVar.key}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get environment value with fallback
 */
export function getEnv(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || ''
}

/**
 * Get required environment value (throws if missing)
 */
export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Check if running in production
 */
export function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Log environment validation on startup
 */
export function logEnvValidation(): void {
  const result = validateEnv()

  if (result.warnings.length > 0) {
    result.warnings.forEach(w => logger.warn('Config', w))
  }

  if (!result.valid) {
    result.errors.forEach(e => logger.error('Config', e))
    if (isProd()) {
      throw new Error('Environment validation failed. Check logs.')
    }
  } else {
    logger.info('Config', 'Environment validation passed')
  }
}

/**
 * App configuration (derived from env)
 */
export const config = {
  api: {
    baseUrl: getEnv('NEXT_PUBLIC_API_URL'),
    timeout: 10000,
  },
  supabase: {
    url: getEnv('NEXT_PUBLIC_SUPABASE_URL', ''),
    anonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),
  },
  features: {
    aiMatching: getEnv('NEXT_PUBLIC_FEATURE_AI_MATCHING', 'true') === 'true',
    phoneAuth: getEnv('NEXT_PUBLIC_FEATURE_PHONE_AUTH', 'false') === 'true',
    telegramAuth: getEnv('NEXT_PUBLIC_FEATURE_TELEGRAM_AUTH', 'false') === 'true',
  },
  isProd: isProd(),
  isDev: isDev(),
}

export default config
