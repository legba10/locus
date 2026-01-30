/**
 * LOCUS Shared Hooks
 * 
 * PATCH 4: SSR-safe hooks for hydration stability
 */

// Client Ready
export { 
  useClientReady,
  useClientValue,
  useWindow,
  useLocalStorage,
  useClientTimestamp,
} from './useClientReady'

// Data Fetching
export { useFetch } from './useFetch'
