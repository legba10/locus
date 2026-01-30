/**
 * LOCUS Logger Service
 * 
 * Unified logging with environment-aware behavior:
 * - debug() only in development
 * - info/warn/error always (but can be configured)
 * 
 * Usage:
 *   import { logger } from '@/shared/utils/logger'
 *   logger.debug('Auth', 'Session loaded')
 *   logger.error('API', 'Request failed', error)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  debugEnabled: boolean
  prefix: string
}

const config: LoggerConfig = {
  enabled: true,
  debugEnabled: process.env.NODE_ENV === 'development',
  prefix: '[LOCUS]',
}

/**
 * Format log message with timestamp and context
 */
function formatMessage(level: LogLevel, context: string, message: string): string {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  return `${config.prefix} ${timestamp} [${level.toUpperCase()}] [${context}] ${message}`
}

/**
 * Logger instance
 */
export const logger = {
  /**
   * Debug log - ONLY in development
   */
  debug(context: string, message: string, ...args: unknown[]): void {
    if (!config.enabled || !config.debugEnabled) return
    console.log(formatMessage('debug', context, message), ...args)
  },

  /**
   * Info log
   */
  info(context: string, message: string, ...args: unknown[]): void {
    if (!config.enabled) return
    console.info(formatMessage('info', context, message), ...args)
  },

  /**
   * Warning log
   */
  warn(context: string, message: string, ...args: unknown[]): void {
    if (!config.enabled) return
    console.warn(formatMessage('warn', context, message), ...args)
  },

  /**
   * Error log - always enabled
   */
  error(context: string, message: string, ...args: unknown[]): void {
    console.error(formatMessage('error', context, message), ...args)
  },

  /**
   * Configure logger (use sparingly)
   */
  configure(options: Partial<LoggerConfig>): void {
    Object.assign(config, options)
  },

  /**
   * Disable all logging (for tests)
   */
  disable(): void {
    config.enabled = false
  },

  /**
   * Enable logging
   */
  enable(): void {
    config.enabled = true
  },
}

export default logger
