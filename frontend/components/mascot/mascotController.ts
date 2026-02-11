/**
 * Global mascot state controller. Call from anywhere to drive mascot animation.
 * States: idle | hoverAI | thinking | error | hidden
 */

export type MascotState = 'idle' | 'hoverAI' | 'thinking' | 'error' | 'hidden'

type Listener = (state: MascotState) => void

let state: MascotState = 'idle'
const listeners = new Set<Listener>()

function getState(): MascotState {
  return state
}

function setState(next: MascotState) {
  if (state === next) return
  state = next
  listeners.forEach((fn) => fn(state))
}

function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const mascotController = {
  getState,
  subscribe,
  setIdle: () => setState('idle'),
  setHover: () => setState('hoverAI'),
  setThinking: () => setState('thinking'),
  setError: () => setState('error'),
  setHidden: () => setState('hidden'),
}
