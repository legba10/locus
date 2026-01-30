/**
 * LOCUS Deploy Config
 *
 * PATCH 12: Deploy & Integration Ready Layer
 */

import type { AppEnv } from '../env/env.model'
import { getAppEnv } from '../env/env.resolver'
import { mapDeployEnv } from './env.map'
import { validateEnv } from '../env/env.validator'

export interface DeployConfig {
  env: AppEnv
  flags: {
    telegramEnabled: boolean
    aiEnabled: boolean
    authEnabled: boolean
  }
  missingVars: string[]
}

export function getDeployConfig(target: 'frontend' | 'backend'): DeployConfig {
  const env = getAppEnv()
  const missingVars = validateEnv(target, env, env === 'PROD')
  const mapped = mapDeployEnv(env)

  return {
    env,
    flags: mapped.flags,
    missingVars,
  }
}

export default { getDeployConfig }
