/**
 * LOCUS Real User Flow Layer
 *
 * PATCH 10: Real Product Activation
 */

export type { FlowAction, FlowActionType } from './realFlow.engine'

export {
  handleAction,
  handleTelegramUpdate,
  dispatchAuthEvent,
  getProfile,
  setProfile,
  RealFlowEngine,
} from './realFlow.engine'

export { dispatchAction, dispatchAuthAction, ActionDispatcher } from './action.dispatcher'

export { subscribeToActions, dispatchToUI, UIBridge } from './ui.bridge'
export type { UIActionHandler } from './ui.bridge'
