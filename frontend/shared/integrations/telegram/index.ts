/**
 * LOCUS Telegram Integration
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * ❌ UI cannot call directly
 * ✅ Only through DecisionEngine
 */

// Types
export type {
  TelegramUser,
  TelegramChatType,
  TelegramMessage,
  TelegramCallback,
  TelegramUpdateType,
  TelegramUpdate,
  TelegramCommand,
  TelegramResponse,
  TelegramReplyMarkup,
  TelegramInlineButton,
  TelegramKeyboardButton,
  TelegramNotification,
  TelegramAuthResult,
  TelegramIntegrationStatus,
} from './telegram.types'

// Adapter
export {
  adaptTelegramUser,
  adaptUpdateToEvent,
  parseCommand,
  formatListingForTelegram,
  createListingButtons,
  createNotificationResponse,
  escapeHtml,
  parseCallbackData,
} from './telegram.adapter'

// Service
export {
  setMode as setTelegramMode,
  getStatus as getTelegramStatus,
  isActive as isTelegramActive,
  processUpdate as processTelegramUpdate,
  handleWebhook as handleTelegramWebhook,
  handleSafe as handleTelegramSafe,
  handleFull as handleTelegramFull,
  handleControlledUpdate as handleTelegramControlledUpdate,
  sendMessage as sendTelegramMessage,
  sendNotification as sendTelegramNotification,
  sendBulkNotifications as sendTelegramBulkNotifications,
  verifyAuth as verifyTelegramAuth,
  getSandboxQueue as getTelegramSandboxQueue,
  clearSandboxQueue as clearTelegramSandboxQueue,
  simulateUpdate as simulateTelegramUpdate,
  TelegramService,
} from './telegram.service'
