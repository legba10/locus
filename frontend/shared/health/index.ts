/**
 * LOCUS Health Module
 * 
 * PATCH 4: System Health & Monitoring
 */

export type {
  ServiceStatus,
  ServiceHealth,
  SystemHealth,
  HealthCheckResult,
} from './health.service'

export {
  checkApiHealth,
  checkAuthHealth,
  checkMediaHealth,
  checkSystemHealth,
  getSystemHealth,
  getStatusEmoji,
  getStatusColor,
} from './health.service'
