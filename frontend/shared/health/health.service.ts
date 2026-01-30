/**
 * LOCUS System Health Service
 * 
 * PATCH 4: System Health & Monitoring
 * 
 * Provides:
 * - System status checks
 * - Health endpoints
 * - Error tracking
 * - Status indicators
 */

import { logger } from '../utils/logger'
import { config } from '../config'

/**
 * Service status
 */
export type ServiceStatus = 'ok' | 'degraded' | 'fail' | 'unknown'

/**
 * Service health info
 */
export interface ServiceHealth {
  status: ServiceStatus
  latency?: number
  lastChecked?: string
  error?: string
}

/**
 * System health status
 */
export interface SystemHealth {
  api: ServiceHealth
  auth: ServiceHealth
  media: ServiceHealth
  db: ServiceHealth
  overall: ServiceStatus
  timestamp: string
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  name: string
  status: ServiceStatus
  latency: number
  error?: string
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const response = await fetch(`${config.api.baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    
    const latency = Date.now() - start
    
    if (response.ok) {
      return { name: 'api', status: 'ok', latency }
    }
    
    return { 
      name: 'api', 
      status: 'degraded', 
      latency, 
      error: `HTTP ${response.status}` 
    }
  } catch (error) {
    return {
      name: 'api',
      status: 'fail',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check auth service health
 */
export async function checkAuthHealth(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    // Just check if auth endpoint is reachable
    const response = await fetch(`${config.api.baseUrl}/auth/me`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    
    const latency = Date.now() - start
    
    // 401 is expected without token - means auth is working
    if (response.ok || response.status === 401) {
      return { name: 'auth', status: 'ok', latency }
    }
    
    return { 
      name: 'auth', 
      status: 'degraded', 
      latency, 
      error: `HTTP ${response.status}` 
    }
  } catch (error) {
    return {
      name: 'auth',
      status: 'fail',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check media storage health
 */
export async function checkMediaHealth(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    // Check if Supabase storage is reachable
    const response = await fetch(
      `${config.supabase.url}/storage/v1/object/info/public/locus-listings`,
      {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      }
    )
    
    const latency = Date.now() - start
    
    // 404 on info is OK - means storage is working
    if (response.ok || response.status === 404) {
      return { name: 'media', status: 'ok', latency }
    }
    
    return { 
      name: 'media', 
      status: 'degraded', 
      latency, 
      error: `HTTP ${response.status}` 
    }
  } catch (error) {
    return {
      name: 'media',
      status: 'fail',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Full system health check
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  logger.debug('Health', 'Running system health check')
  
  const [api, auth, media] = await Promise.all([
    checkApiHealth(),
    checkAuthHealth(),
    checkMediaHealth(),
  ])
  
  const toServiceHealth = (result: HealthCheckResult): ServiceHealth => ({
    status: result.status,
    latency: result.latency,
    lastChecked: new Date().toISOString(),
    error: result.error,
  })
  
  // Determine overall status
  const statuses = [api.status, auth.status, media.status]
  let overall: ServiceStatus = 'ok'
  if (statuses.includes('fail')) {
    overall = 'fail'
  } else if (statuses.includes('degraded')) {
    overall = 'degraded'
  }
  
  return {
    api: toServiceHealth(api),
    auth: toServiceHealth(auth),
    media: toServiceHealth(media),
    db: { status: 'unknown' }, // DB check would need backend support
    overall,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Get status emoji
 */
export function getStatusEmoji(status: ServiceStatus): string {
  switch (status) {
    case 'ok': return '✅'
    case 'degraded': return '⚠️'
    case 'fail': return '❌'
    default: return '❓'
  }
}

/**
 * Get status color
 */
export function getStatusColor(status: ServiceStatus): string {
  switch (status) {
    case 'ok': return 'green'
    case 'degraded': return 'yellow'
    case 'fail': return 'red'
    default: return 'gray'
  }
}

/**
 * Last known system health
 */
let lastHealth: SystemHealth | null = null
let lastCheckTime: number = 0
const CACHE_TTL = 30000 // 30 seconds

/**
 * Get cached or fresh system health
 */
export async function getSystemHealth(forceRefresh = false): Promise<SystemHealth> {
  const now = Date.now()
  
  if (!forceRefresh && lastHealth && (now - lastCheckTime) < CACHE_TTL) {
    return lastHealth
  }
  
  lastHealth = await checkSystemHealth()
  lastCheckTime = now
  return lastHealth
}

export default {
  checkApiHealth,
  checkAuthHealth,
  checkMediaHealth,
  checkSystemHealth,
  getSystemHealth,
  getStatusEmoji,
  getStatusColor,
}
