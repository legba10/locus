/**
 * LOCUS Shared Module
 * 
 * ARCHITECTURE LOCK (Patch 3) + PRODUCTION HARDENING (Patch 4)
 * 
 * Central exports for all shared modules.
 * 
 * Import pattern:
 *   import { Listing, adaptListing, MediaService } from '@/shared'
 *   import { logger, config, useClientReady } from '@/shared'
 */

// Domain Models
export * from './domain'

// Adapters
export * from './adapters'

// API (with Patch 4 stability layer)
export * from './api'

// Auth (with Patch 4 guards)
export * from './auth'

// Media (with Patch 4 cache & validator)
export * from './media'

// Health (Patch 4)
export * from './health'

// Analytics (Patch 5)
export * from './analytics'

// AI (Patch 5 + 6 + 7)
export * from './ai'

// Events (Patch 7.5)
export * from './events'

// Context (Patch 7.5)
export * from './context'

// Integrations (Patch 7.5)
export * from './integrations'

// Runtime (Patch 8)
export * from './runtime'

// Simulation (Patch 9)
export * from './simulation'

// Metrics (Patch 10)
export * from './metrics'

// Config
export * from './config'

// Utils
export { logger } from './utils/logger'
export { apiFetch, apiFetchJson } from './utils/apiFetch'
export { cn } from './utils/cn'

// SSR Utils (Patch 4)
export {
  isClient,
  isServer,
  safeWindow,
  safeDocument,
  safeLocalStorage,
  getLocalStorageItem,
  setLocalStorageItem,
} from './utils/isClient'

// Hooks (Patch 4)
export {
  useClientReady,
  useClientValue,
  useWindow,
  useLocalStorage,
  useClientTimestamp,
} from './hooks/useClientReady'
export { useFetch } from './hooks/useFetch'

// Components
export { SafeImage } from './components/SafeImage'
export { ClientOnly, useClientOnly } from './components/ClientOnly'
