/**
 * LOCUS Media Module
 * 
 * ARCHITECTURE LOCK:
 * Central media exports. All media operations go through here.
 * 
 * PATCH 4: Media Hardening
 * - Cache with TTL
 * - URL validation
 * - Existence checking
 */

export type { 
  MediaValidation, 
  ResolvedMedia, 
  IMediaService 
} from './media.service'

export {
  validateMedia,
  resolveMedia,
  resolveMediaArray,
  fallbackMedia,
  toListingMedia,
  isSupabaseMedia,
  shouldSkipOptimization,
  getCoverMedia,
  MediaService,
} from './media.service'

// Cache (PATCH 4)
export {
  getCachedMedia,
  setCachedMedia,
  invalidateCachedMedia,
  clearMediaCache,
  getMediaCacheStats,
  resolveWithCache,
} from './media.cache'

// Validator (PATCH 4)
export type { MediaValidationResult } from './media.validator'
export {
  validateUrlFormat,
  validateExtension,
  checkImageExists,
  validateMediaFull,
  validateMediaBatch,
} from './media.validator'
