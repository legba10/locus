/**
 * LOCUS Telegram Integration Types
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * ❌ UI cannot call Telegram directly
 * ❌ Telegram cannot mutate domain models
 * ✅ Only through DecisionEngine
 */

/**
 * Telegram user info
 */
export interface TelegramUser {
  id: number
  firstName: string
  lastName?: string
  username?: string
  languageCode?: string
  isPremium?: boolean
}

/**
 * Telegram chat types
 */
export type TelegramChatType = 'private' | 'group' | 'supergroup' | 'channel'

/**
 * Telegram message
 */
export interface TelegramMessage {
  messageId: number
  chatId: number
  chatType: TelegramChatType
  from: TelegramUser
  text?: string
  date: number
}

/**
 * Telegram callback query (button press)
 */
export interface TelegramCallback {
  id: string
  from: TelegramUser
  chatId: number
  messageId: number
  data: string
}

/**
 * Telegram update types
 */
export type TelegramUpdateType =
  | 'message'
  | 'callback_query'
  | 'inline_query'
  | 'command'

/**
 * Telegram update (incoming event)
 */
export interface TelegramUpdate {
  updateId: number
  type: TelegramUpdateType
  message?: TelegramMessage
  callback?: TelegramCallback
}

/**
 * Telegram command
 */
export interface TelegramCommand {
  command: string
  args: string[]
  chatId: number
  userId: number
}

/**
 * Telegram response (outgoing)
 */
export interface TelegramResponse {
  chatId: number
  text: string
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  replyMarkup?: TelegramReplyMarkup
  disableNotification?: boolean
}

/**
 * Telegram reply markup (buttons)
 */
export interface TelegramReplyMarkup {
  inlineKeyboard?: TelegramInlineButton[][]
  keyboard?: TelegramKeyboardButton[][]
  removeKeyboard?: boolean
}

/**
 * Inline button
 */
export interface TelegramInlineButton {
  text: string
  callbackData?: string
  url?: string
}

/**
 * Keyboard button
 */
export interface TelegramKeyboardButton {
  text: string
  requestContact?: boolean
  requestLocation?: boolean
}

/**
 * Telegram notification
 */
export interface TelegramNotification {
  userId: number
  chatId: number
  type: 'listing_new' | 'favorite_update' | 'message' | 'promo'
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Telegram auth result
 */
export interface TelegramAuthResult {
  success: boolean
  telegramUserId?: number
  locusUserId?: string
  error?: string
}

/**
 * Telegram integration status
 */
export interface TelegramIntegrationStatus {
  connected: boolean
  botUsername?: string
  webhookUrl?: string
  lastUpdate?: number
  mode: 'sandbox' | 'production'
}
