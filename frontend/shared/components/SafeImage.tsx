'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { resolveMediaUrl, isSupabaseUrl as checkSupabase } from '@/shared/utils/mediaResolver'
import { logger } from '@/shared/utils/logger'

/**
 * SafeImage — CENTRAL Image component for LOCUS
 * 
 * ALL images must use this component. Direct next/image is forbidden.
 * 
 * Features:
 * - Hydration-safe (no SSR/CSR mismatch)
 * - Automatic fallback to placeholder
 * - MediaResolver integration
 * - Supabase URL optimization
 * - Error handling with fallback
 * 
 * Usage:
 *   <SafeImage src={photo?.url} alt="Photo" fill />
 *   <SafeImage src={listing.images?.[0]?.url} alt={listing.title} width={400} height={300} />
 */
export function SafeImage({
  src,
  alt,
  onError,
  ...props
}: ImageProps) {
  // HYDRATION-SAFE: Initial state must match server render
  const [hasError, setHasError] = useState(false)

  // Use MediaResolver for URL normalization
  const resolved = resolveMediaUrl(src as string | null | undefined)
  
  // If error occurred, use placeholder
  const effectiveSrc = hasError ? '/placeholder.svg' : resolved.url
  
  // Optimize Supabase URLs, skip optimization for external to avoid timeout
  const isSupabase = checkSupabase(src as string)
  const shouldUnoptimize = resolved.type === 'external' && !isSupabase

  return (
    <Image
      src={effectiveSrc}
      alt={alt || 'image'}
      unoptimized={shouldUnoptimize}
      onError={(e) => {
        logger.warn('SafeImage', `Error loading: ${src}`)
        setHasError(true)
        onError?.(e)
      }}
      {...props}
    />
  )
}

export default SafeImage
