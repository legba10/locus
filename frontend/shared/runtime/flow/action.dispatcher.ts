/**
 * LOCUS Action Dispatcher
 *
 * PATCH 10: Real Product Activation
 *
 * UI can only dispatch actions here.
 */

import type { RuntimeAction } from '../execution.model'
import { FeatureFlags } from '../featureFlags'
import { logger } from '../../utils/logger'
import type { FlowAction } from './realFlow.engine'
import { RealFlowEngine } from './realFlow.engine'

export async function dispatchAction(action: FlowAction): Promise<RuntimeAction[]> {
  if (!FeatureFlags.isEnabled('REAL_PIPELINE_ENABLED')) {
    logger.warn('ActionDispatcher', 'Pipeline disabled, action ignored', { type: action.type })
    return []
  }

  const result = await RealFlowEngine.handleAction(action)
  return result.actions
}

export async function dispatchAuthAction(
  type: 'login' | 'logout' | 'register',
  user: FlowAction['user']
): Promise<RuntimeAction[]> {
  const result = await RealFlowEngine.dispatchAuthEvent(type, user || null)
  return result.actions
}

export const ActionDispatcher = {
  dispatch: dispatchAction,
  dispatchAuth: dispatchAuthAction,
}

export default ActionDispatcher
