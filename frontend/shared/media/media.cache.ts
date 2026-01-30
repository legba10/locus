/**
 * LOCUS Media Cache
 * 
 * PATCH 4: Media System Hardening
 * 
 * Provides:
 * - In-memory cache for resolved URLs
 * - TTL-based expiration
 * - Cache invalidation
 */

import { logger } from '../utils/logger'
import type { ResolvedMedia } from './media.service'

// Configuration
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 500

/**
 * Cache entry
 */
interface CacheEntry {
  value: ResolvedMedia
  expiresAt: number
}

/**
 * Media cache store
 */
const cache = new Map<string, CacheEntry>()

/**
 * Get cached media
 */
export function getCachedMedia(url: string): ResolvedMedia | null {
  const entry = cache.get(url)
  
  if (!entry) {
    return null
  }

  // Check expiration
  if (Date.now() > entry.expiresAt) {
    cache.delete(url)
    return null
  }

  return entry.value
}

/**
 * Set cached media
 */
export function setCachedMedia(url: string, resolved: ResolvedMedia): void {
  // Enforce max cache size
  if (cache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entries (first 10%)
    const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.1)
    const keys = Array.from(cache.keys())
    for (let i = 0; i < entriesToRemove; i++) {
      cache.delete(keys[i])
    }
    logger.debug('MediaCache', `Evicted ${entriesToRemove} entries`)
  }

  cache.set(url, {
    value: resolved,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

/**
 * Invalidate cached media
 */
export function invalidateCachedMedia(url: string): void {
  cache.delete(url)
}

/**
 * Clear entire cache
 */
export function clearMediaCache(): void {
  cache.clear()
  logger.debug('MediaCache', 'Cache cleared')
}

/**
 * Get cache stats
 */
export function getMediaCacheStats(): {
  size: number
  maxSize: number
  hitRate: number
} {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    hitRate: 0, // Would need tracking for real hit rate
  }
}

/**
 * Resolve with cache
 */
export function resolveWithCache(
  url: string,
  resolver: (url: string) => ResolvedMedia
): ResolvedMedia {
  // Check cache first
  const cached = getCachedMedia(url)
  if (cached) {
    return cached
  }

  // Resolve and cache
  const resolved = resolver(url)
  setCachedMedia(url, resolved)
  return resolved
}

export default {
  getCachedMedia,
  setCachedMedia,
  invalidateCachedMedia,
  clearMediaCache,
  getMediaCacheStats,
  resolveWithCache,
}
