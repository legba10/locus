/**
 * LOCUS Runtime Environment Validator
 *
 * PATCH 12: Deploy & Integration Ready Layer
 */

import type { AppEnv } from './env.model'

export type EnvTarget = 'frontend' | 'backend'

const REQUIRED_COMMON = ['APP_ENV'] as const
const REQUIRED_BACKEND = [
  'PORT',
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'TELEGRAM_BOT_TOKEN',
] as const
const REQUIRED_FRONTEND = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_TELEGRAM_BOT_NAME',
  'NEXT_PUBLIC_ENV',
] as const

export function validateEnv(target: EnvTarget, env: AppEnv, throwOnProd = true): string[] {
  const missing: string[] = []

  for (const key of REQUIRED_COMMON) {
    if (!process.env[key]) missing.push(key)
  }

  if (target === 'backend') {
    for (const key of REQUIRED_BACKEND) {
      if (!process.env[key]) missing.push(key)
    }
  }

  if (target === 'frontend') {
    for (const key of REQUIRED_FRONTEND) {
      if (!process.env[key]) missing.push(key)
    }
  }

  if (env === 'PROD' && throwOnProd && missing.length > 0) {
    throw new Error(`[LOCUS ENV] Missing required vars: ${missing.join(', ')}`)
  }

  return missing
}

export default { validateEnv }
