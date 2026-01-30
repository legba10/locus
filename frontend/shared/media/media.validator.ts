/**
 * LOCUS Media Validator
 * 
 * PATCH 4: Media System Hardening
 * 
 * Provides:
 * - URL validation
 * - Async existence check
 * - Fallback on 404/timeout
 */

import { logger } from '../utils/logger'

// Configuration
const VALIDATION_TIMEOUT_MS = 3000
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']
const BLOCKED_DOMAINS = ['unsplash.com', 'picsum.photos']

/**
 * Validation result
 */
export interface MediaValidationResult {
  isValid: boolean
  exists: boolean | null // null if not checked
  reason?: string
  url: string
}

/**
 * Validate URL format
 */
export function validateUrlFormat(url: string | null | undefined): MediaValidationResult {
  // Empty check
  if (!url || typeof url !== 'string' || url.length === 0) {
    return { isValid: false, exists: null, reason: 'Empty URL', url: '' }
  }

  // Placeholder is always valid
  if (url.startsWith('/placeholder') || url === '/placeholder.svg') {
    return { isValid: true, exists: true, url }
  }

  // Local path
  if (url.startsWith('/')) {
    return { isValid: true, exists: null, url }
  }

  // HTTP(S) URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Check blocked domains in production
    if (process.env.NODE_ENV !== 'development') {
      for (const domain of BLOCKED_DOMAINS) {
        if (url.includes(domain)) {
          return { 
            isValid: false, 
            exists: null, 
            reason: `Blocked domain: ${domain}`, 
            url 
          }
        }
      }
    }
    return { isValid: true, exists: null, url }
  }

  return { isValid: false, exists: null, reason: 'Invalid URL format', url }
}

/**
 * Validate file extension
 */
export function validateExtension(url: string): boolean {
  try {
    const urlObj = new URL(url, 'https://example.com')
    const pathname = urlObj.pathname
    const ext = pathname.split('.').pop()?.toLowerCase()
    
    if (!ext) return true // No extension = might be valid (API endpoints, etc)
    return ALLOWED_EXTENSIONS.includes(ext)
  } catch {
    return true // If URL parsing fails, let it through
  }
}

/**
 * Check if image exists (async)
 * Uses HEAD request to avoid downloading entire image
 */
export async function checkImageExists(url: string): Promise<boolean> {
  // Don't check local paths or placeholders
  if (url.startsWith('/')) {
    return true
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    logger.debug('MediaValidator', `Check failed for ${url}`, error)
    return false
  }
}

/**
 * Full validation with existence check
 */
export async function validateMediaFull(
  url: string | null | undefined
): Promise<MediaValidationResult> {
  // Format validation first
  const formatResult = validateUrlFormat(url)
  if (!formatResult.isValid) {
    return formatResult
  }

  // Skip existence check for local paths
  if (formatResult.url.startsWith('/')) {
    return { ...formatResult, exists: true }
  }

  // Check existence
  const exists = await checkImageExists(formatResult.url)
  return {
    ...formatResult,
    exists,
    reason: exists ? undefined : 'Image not found (404)',
  }
}

/**
 * Batch validate URLs
 */
export async function validateMediaBatch(
  urls: string[]
): Promise<Map<string, MediaValidationResult>> {
  const results = new Map<string, MediaValidationResult>()

  // Run validations in parallel with concurrency limit
  const CONCURRENCY = 5
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map(url => validateMediaFull(url))
    )
    batch.forEach((url, idx) => {
      results.set(url, batchResults[idx])
    })
  }

  return results
}

export default {
  validateUrlFormat,
  validateExtension,
  checkImageExists,
  validateMediaFull,
  validateMediaBatch,
}
