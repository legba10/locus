/**
 * LOCUS Shared Utils
 * 
 * Central exports for all utility modules
 */

// Logger
export { logger } from './logger'
export type { } from './logger' // no types to export yet

// API
export { apiFetch, apiFetchJson } from './apiFetch'
export { apiSuccess, apiError, parseApiResponse, getErrorMessage, ERROR_MESSAGES } from './apiResponse'
export type { ApiResponse } from './apiResponse'

// Media
export { 
  resolveMediaUrl, 
  getMediaUrl, 
  isSupabaseUrl, 
  resolveListingPhotos, 
  getCoverPhoto,
  detectMediaType 
} from './mediaResolver'
export type { MediaType, ResolvedMedia, PhotoInput, ResolvedPhoto } from './mediaResolver'

// Other utils
export { cn } from './cn'
