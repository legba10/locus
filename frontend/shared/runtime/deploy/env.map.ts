/**
 * LOCUS Deploy Env Map
 *
 * PATCH 12: Deploy & Integration Ready Layer
 */

import type { AppEnv } from '../env/env.model'

export interface DeployEnvMap {
  env: AppEnv
  flags: {
    telegramEnabled: boolean
    aiEnabled: boolean
    authEnabled: boolean
  }
}

function toBool(value?: string): boolean {
  return value === 'true' || value === '1'
}

export function mapDeployEnv(env: AppEnv): DeployEnvMap {
  return {
    env,
    flags: {
      telegramEnabled: toBool(process.env.NEXT_PUBLIC_TELEGRAM_ENABLED),
      aiEnabled: toBool(process.env.NEXT_PUBLIC_AI_ENABLED),
      authEnabled: toBool(process.env.NEXT_PUBLIC_AUTH_ENABLED),
    },
  }
}

export default { mapDeployEnv }
