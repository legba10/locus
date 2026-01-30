/**
 * LOCUS Media Service
 * 
 * ARCHITECTURE LOCK:
 * Single entry point for all media operations.
 * 
 * RULES:
 * - UI receives ONLY resolved URLs
 * - No direct Supabase storage access in components
 * - All media goes through this service
 */

import type { ListingMedia, MediaStorage } from '../domain/listing.model'
import { logger } from '../utils/logger'

// Constants
const PLACEHOLDER_URL = '/placeholder.svg'
const SUPABASE_DOMAIN = '.supabase.co'
const BLOCKED_DOMAINS = ['unsplash.com', 'picsum.photos']

/**
 * Media validation result
 */
export interface MediaValidation {
  isValid: boolean
  storage: MediaStorage
  reason?: string
}

/**
 * Resolved media for UI
 */
export interface ResolvedMedia {
  url: string
  storage: MediaStorage
  isPlaceholder: boolean
}

/**
 * Validate media URL
 */
export function validateMedia(url: string | null | undefined): MediaValidation {
  // Empty or invalid
  if (!url || typeof url !== 'string' || url.length === 0) {
    return { isValid: false, storage: 'placeholder', reason: 'Empty URL' }
  }

  // Check for blocked domains in production
  if (process.env.NODE_ENV !== 'development') {
    for (const domain of BLOCKED_DOMAINS) {
      if (url.includes(domain)) {
        return { 
          isValid: false, 
          storage: 'placeholder', 
          reason: `Blocked domain: ${domain}` 
        }
      }
    }
  }

  // Supabase Storage
  if (url.includes(SUPABASE_DOMAIN)) {
    return { isValid: true, storage: 'supabase' }
  }

  // External URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return { isValid: true, storage: 'external' }
  }

  // Local path
  if (url.startsWith('/')) {
    return { isValid: true, storage: 'external' }
  }

  return { isValid: false, storage: 'placeholder', reason: 'Invalid URL format' }
}

/**
 * Resolve media URL for UI rendering
 * Always returns a valid URL (placeholder if invalid)
 */
export function resolveMedia(url: string | null | undefined): ResolvedMedia {
  const validation = validateMedia(url)

  if (!validation.isValid) {
    if (validation.reason) {
      logger.debug('Media', `Invalid media: ${validation.reason}`)
    }
    return {
      url: PLACEHOLDER_URL,
      storage: 'placeholder',
      isPlaceholder: true,
    }
  }

  return {
    url: url!,
    storage: validation.storage,
    isPlaceholder: false,
  }
}

/**
 * Get fallback media (placeholder)
 */
export function fallbackMedia(): ResolvedMedia {
  return {
    url: PLACEHOLDER_URL,
    storage: 'placeholder',
    isPlaceholder: true,
  }
}

/**
 * Resolve array of media
 */
export function resolveMediaArray(
  urls: Array<string | null | undefined>
): ResolvedMedia[] {
  const resolved = urls
    .map(url => resolveMedia(url))
    .filter(m => !m.isPlaceholder)

  // If all invalid, return single placeholder
  if (resolved.length === 0) {
    return [fallbackMedia()]
  }

  return resolved
}

/**
 * Convert to ListingMedia domain object
 */
export function toListingMedia(
  url: string | null | undefined,
  index = 0
): ListingMedia {
  const resolved = resolveMedia(url)
  
  return {
    id: `media-${index}`,
    url: resolved.url,
    storage: resolved.storage,
    isMain: index === 0,
    sortOrder: index,
  }
}

/**
 * Check if URL is from Supabase
 */
export function isSupabaseMedia(url: string | null | undefined): boolean {
  return validateMedia(url).storage === 'supabase'
}

/**
 * Check if should skip Next.js image optimization
 * (for external non-Supabase URLs to avoid timeout)
 */
export function shouldSkipOptimization(url: string | null | undefined): boolean {
  const validation = validateMedia(url)
  return validation.storage === 'external' && !isSupabaseMedia(url)
}

/**
 * Get cover photo from media array
 */
export function getCoverMedia(
  media: ListingMedia[] | null | undefined
): ResolvedMedia {
  if (!media || media.length === 0) {
    return fallbackMedia()
  }

  const mainPhoto = media.find(m => m.isMain) || media[0]
  return resolveMedia(mainPhoto?.url)
}

/**
 * MediaService interface for dependency injection
 */
export interface IMediaService {
  validate(url: string | null | undefined): MediaValidation
  resolve(url: string | null | undefined): ResolvedMedia
  resolveArray(urls: Array<string | null | undefined>): ResolvedMedia[]
  fallback(): ResolvedMedia
  isSupabase(url: string | null | undefined): boolean
  shouldSkipOptimization(url: string | null | undefined): boolean
}

/**
 * Default MediaService instance
 */
export const MediaService: IMediaService = {
  validate: validateMedia,
  resolve: resolveMedia,
  resolveArray: resolveMediaArray,
  fallback: fallbackMedia,
  isSupabase: isSupabaseMedia,
  shouldSkipOptimization,
}

export default MediaService
