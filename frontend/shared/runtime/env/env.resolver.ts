/**
 * LOCUS Runtime Environment Resolver
 *
 * PATCH 12: Deploy & Integration Ready Layer
 */

import type { AppEnv } from './env.model'

export function getAppEnv(): AppEnv {
  const raw = (process.env.APP_ENV || 'LOCAL').toUpperCase()
  if (raw === 'STAGING' || raw === 'PROD' || raw === 'LOCAL') {
    return raw
  }
  return 'LOCAL'
}

export default { getAppEnv }
