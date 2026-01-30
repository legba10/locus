/**
 * LOCUS UI Bridge
 *
 * PATCH 10: Real Product Activation
 *
 * UI can only subscribe to actions and execute them.
 */

import type { RuntimeAction } from '../execution.model'

export type UIActionHandler = (action: RuntimeAction) => void

const handlers: UIActionHandler[] = []

export function subscribeToActions(handler: UIActionHandler): () => void {
  handlers.push(handler)
  return () => {
    const index = handlers.indexOf(handler)
    if (index >= 0) handlers.splice(index, 1)
  }
}

export function dispatchToUI(actions: RuntimeAction[]): void {
  for (const action of actions) {
    for (const handler of handlers) {
      try {
        handler(action)
      } catch {
        // UI handlers should never break the flow
      }
    }
  }
}

export const UIBridge = {
  subscribe: subscribeToActions,
  dispatch: dispatchToUI,
}

export default UIBridge
