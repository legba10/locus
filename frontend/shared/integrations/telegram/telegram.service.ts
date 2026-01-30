/**
 * LOCUS Telegram Service
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * ❌ Cannot be called from UI directly
 * ❌ Cannot mutate domain models
 * ✅ Only through DecisionEngine
 */

import { logger } from '../../utils/logger'
import { FeatureFlags } from '../../runtime/featureFlags'
import type {
  TelegramUpdate,
  TelegramResponse,
  TelegramNotification,
  TelegramIntegrationStatus,
  TelegramAuthResult,
} from './telegram.types'
import {
  adaptUpdateToEvent,
  parseCommand,
  createNotificationResponse,
} from './telegram.adapter'
import type { RawEvent } from '../../events/event.types'

/**
 * Integration mode
 */
let integrationMode: 'sandbox' | 'production' = 'sandbox'

/**
 * Sandbox response queue (for testing)
 */
const sandboxQueue: TelegramResponse[] = []

// ==========================================
// INTEGRATION CONTROL
// ==========================================

/**
 * Set integration mode
 */
export function setMode(mode: 'sandbox' | 'production'): void {
  integrationMode = mode
  logger.info('TelegramService', `Mode set to: ${mode}`)
}

/**
 * Get integration status
 */
export function getStatus(): TelegramIntegrationStatus {
  return {
    connected: integrationMode === 'production',
    mode: integrationMode,
    botUsername: process.env.TELEGRAM_BOT_USERNAME,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  }
}

/**
 * Check if integration is active
 */
export function isActive(): boolean {
  return integrationMode === 'production'
}

// ==========================================
// INBOUND (Telegram → LOCUS)
// ==========================================

/**
 * Process incoming update
 * Returns normalized event for DecisionEngine
 */
export function processUpdate(update: TelegramUpdate): RawEvent {
  logger.debug('TelegramService', 'Processing update', { type: update.type })

  // Check for commands
  if (update.type === 'message' && update.message?.text?.startsWith('/')) {
    const command = parseCommand(update.message)
    if (command) {
      return {
        source: 'telegram',
        type: 'telegram_command',
        data: command,
      }
    }
  }

  return adaptUpdateToEvent(update)
}

/**
 * Safe mode handler (read-only)
 */
export function handleSafe(update: TelegramUpdate): RawEvent {
  const event = processUpdate(update)
  return {
    ...event,
    data: {
      ...event.data,
      safeMode: true,
    },
  }
}

/**
 * Full mode handler (pipeline actions allowed)
 */
export function handleFull(update: TelegramUpdate): RawEvent {
  return processUpdate(update)
}

/**
 * Controlled handler (Patch 11)
 */
export function handleControlledUpdate(update: TelegramUpdate): RawEvent | null {
  if (!FeatureFlags.isEnabled('TELEGRAM_ENABLED')) {
    return null
  }

  if (FeatureFlags.isEnabled('TELEGRAM_SAFE_MODE')) {
    return handleSafe(update)
  }

  if (FeatureFlags.isEnabled('TELEGRAM_FULL_MODE')) {
    return handleFull(update)
  }

  return handleSafe(update)
}

/**
 * Handle webhook (entry point)
 */
export async function handleWebhook(body: unknown): Promise<{
  ok: boolean
  event?: RawEvent
  error?: string
}> {
  try {
    const update = body as TelegramUpdate
    const event = processUpdate(update)
    
    return { ok: true, event }
  } catch (error) {
    logger.error('TelegramService', 'Webhook error', error)
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// ==========================================
// OUTBOUND (LOCUS → Telegram)
// ==========================================

/**
 * Send message
 */
export async function sendMessage(response: TelegramResponse): Promise<boolean> {
  if (integrationMode === 'sandbox') {
    logger.debug('TelegramService', '[SANDBOX] Would send message', response)
    sandboxQueue.push(response)
    return true
  }

  // Production: would call Telegram API
  logger.info('TelegramService', 'Sending message', { chatId: response.chatId })
  
  try {
    // const result = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     chat_id: response.chatId,
    //     text: response.text,
    //     parse_mode: response.parseMode,
    //     reply_markup: response.replyMarkup,
    //     disable_notification: response.disableNotification,
    //   }),
    // })
    // return result.ok
    
    // For now, just log
    return true
  } catch (error) {
    logger.error('TelegramService', 'Send message failed', error)
    return false
  }
}

/**
 * Send notification
 */
export async function sendNotification(
  notification: TelegramNotification
): Promise<boolean> {
  const response = createNotificationResponse(notification)
  return sendMessage(response)
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(
  notifications: TelegramNotification[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  for (const notification of notifications) {
    const success = await sendNotification(notification)
    if (success) {
      sent++
    } else {
      failed++
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 50))
  }

  return { sent, failed }
}

// ==========================================
// AUTH
// ==========================================

/**
 * Verify Telegram auth data
 */
export function verifyAuth(authData: Record<string, string>): TelegramAuthResult {
  if (integrationMode === 'sandbox') {
    logger.debug('TelegramService', '[SANDBOX] Auth verification')
    return {
      success: true,
      telegramUserId: parseInt(authData.id || '0'),
    }
  }

  // Production: verify hash
  // const { hash, ...data } = authData
  // const checkString = Object.keys(data)
  //   .sort()
  //   .map(k => `${k}=${data[k]}`)
  //   .join('\n')
  // const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest()
  // const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')
  // if (hmac !== hash) return { success: false, error: 'Invalid hash' }

  return {
    success: true,
    telegramUserId: parseInt(authData.id || '0'),
  }
}

// ==========================================
// SANDBOX HELPERS
// ==========================================

/**
 * Get sandbox queue (for testing)
 */
export function getSandboxQueue(): TelegramResponse[] {
  return [...sandboxQueue]
}

/**
 * Clear sandbox queue
 */
export function clearSandboxQueue(): void {
  sandboxQueue.length = 0
}

/**
 * Simulate incoming update (for testing)
 */
export function simulateUpdate(update: Partial<TelegramUpdate>): RawEvent {
  const fullUpdate: TelegramUpdate = {
    updateId: Date.now(),
    type: 'message',
    ...update,
  }
  return processUpdate(fullUpdate)
}

// ==========================================
// SERVICE NAMESPACE
// ==========================================

export const TelegramService = {
  // Control
  setMode,
  getStatus,
  isActive,
  
  // Inbound
  processUpdate,
  handleWebhook,
  
  // Outbound
  sendMessage,
  sendNotification,
  sendBulkNotifications,
  
  // Auth
  verifyAuth,
  
  // Sandbox
  getSandboxQueue,
  clearSandboxQueue,
  simulateUpdate,
}

export default TelegramService
