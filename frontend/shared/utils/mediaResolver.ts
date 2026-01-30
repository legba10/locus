/**
 * LOCUS Media Resolver
 * 
 * Single source of truth for media URL handling:
 * - Normalizes URLs
 * - Handles broken links
 * - Provides fallbacks
 * - Validates Supabase URLs
 * 
 * Usage:
 *   import { resolveMediaUrl, resolveListingPhotos } from '@/shared/utils/mediaResolver'
 *   const url = resolveMediaUrl(photo?.url)
 *   const photos = resolveListingPhotos(listing.photos)
 */

import { logger } from './logger'

// Constants
const PLACEHOLDER_IMAGE = '/placeholder.svg'
const SUPABASE_DOMAIN = '.supabase.co'

/**
 * Media URL type
 */
export type MediaType = 'supabase' | 'external' | 'placeholder' | 'invalid'

/**
 * Resolved media URL
 */
export interface ResolvedMedia {
  type: MediaType
  url: string
  isValid: boolean
}

/**
 * Detect media type from URL
 */
export function detectMediaType(url: string | null | undefined): MediaType {
  if (!url || typeof url !== 'string' || url.length === 0) {
    return 'placeholder'
  }

  // Check for Supabase Storage URL
  if (url.includes(SUPABASE_DOMAIN)) {
    return 'supabase'
  }

  // Check for valid HTTP URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Block known problematic sources in production
    if (process.env.NODE_ENV !== 'development') {
      if (url.includes('unsplash.com') || url.includes('picsum.photos')) {
        logger.warn('MediaResolver', `Blocked non-Supabase URL in prod: ${url}`)
        return 'invalid'
      }
    }
    return 'external'
  }

  // Local path (e.g., /images/photo.jpg)
  if (url.startsWith('/')) {
    return 'external'
  }

  return 'invalid'
}

/**
 * Resolve a single media URL
 * Returns placeholder if URL is invalid or missing
 */
export function resolveMediaUrl(url: string | null | undefined): ResolvedMedia {
  const type = detectMediaType(url)

  switch (type) {
    case 'supabase':
      return { type, url: url!, isValid: true }
    
    case 'external':
      return { type, url: url!, isValid: true }
    
    case 'placeholder':
    case 'invalid':
    default:
      return { type: 'placeholder', url: PLACEHOLDER_IMAGE, isValid: false }
  }
}

/**
 * Get the effective URL for rendering
 * Simple helper that returns just the URL string
 */
export function getMediaUrl(url: string | null | undefined): string {
  return resolveMediaUrl(url).url
}

/**
 * Check if URL is from Supabase Storage
 */
export function isSupabaseUrl(url: string | null | undefined): boolean {
  return detectMediaType(url) === 'supabase'
}

/**
 * Photo object from API
 */
export interface PhotoInput {
  url?: string | null
  sortOrder?: number
  alt?: string
}

/**
 * Resolved photo for rendering
 */
export interface ResolvedPhoto {
  url: string
  alt: string
  type: MediaType
  isValid: boolean
}

/**
 * Resolve listing photos array
 * Filters out invalid photos, provides fallback if empty
 */
export function resolveListingPhotos(
  photos: PhotoInput[] | null | undefined,
  altPrefix = 'Фото'
): ResolvedPhoto[] {
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return [{
      url: PLACEHOLDER_IMAGE,
      alt: altPrefix,
      type: 'placeholder',
      isValid: false,
    }]
  }

  const resolved = photos
    .map((photo, index) => {
      const media = resolveMediaUrl(photo?.url)
      return {
        url: media.url,
        alt: photo?.alt || `${altPrefix} ${index + 1}`,
        type: media.type,
        isValid: media.isValid,
      }
    })
    .filter(photo => photo.isValid || photo.type === 'placeholder')

  // If all photos were invalid, return placeholder
  if (resolved.length === 0 || !resolved.some(p => p.isValid)) {
    return [{
      url: PLACEHOLDER_IMAGE,
      alt: altPrefix,
      type: 'placeholder',
      isValid: false,
    }]
  }

  return resolved
}

/**
 * Get cover photo (first valid photo or placeholder)
 */
export function getCoverPhoto(photos: PhotoInput[] | null | undefined): ResolvedPhoto {
  const resolved = resolveListingPhotos(photos)
  return resolved[0]
}

export default {
  resolveMediaUrl,
  getMediaUrl,
  isSupabaseUrl,
  resolveListingPhotos,
  getCoverPhoto,
  detectMediaType,
}
