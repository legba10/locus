/**
 * LOCUS Telegram Adapter
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Converts Telegram data to/from LOCUS domain models.
 * ❌ Cannot mutate domain models directly
 */

import type { User } from '../../domain/user.model'
import type { ListingCard } from '../../domain/listing.model'
import type { RawEvent } from '../../events/event.types'
import type {
  TelegramUser,
  TelegramUpdate,
  TelegramMessage,
  TelegramCommand,
  TelegramResponse,
  TelegramNotification,
  TelegramInlineButton,
} from './telegram.types'

/**
 * Adapt Telegram user to LOCUS user lookup
 */
export function adaptTelegramUser(tgUser: TelegramUser): {
  telegramId: number
  name: string
  username?: string
} {
  return {
    telegramId: tgUser.id,
    name: [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' '),
    username: tgUser.username,
  }
}

/**
 * Adapt Telegram update to raw event
 */
export function adaptUpdateToEvent(update: TelegramUpdate): RawEvent {
  const baseEvent = {
    source: 'telegram' as const,
    timestamp: Date.now(),
  }

  switch (update.type) {
    case 'message':
      return {
        ...baseEvent,
        type: 'telegram_message',
        data: {
          chatId: update.message?.chatId,
          userId: update.message?.from.id,
          text: update.message?.text,
        },
      }

    case 'callback_query':
      return {
        ...baseEvent,
        type: 'telegram_callback',
        data: {
          chatId: update.callback?.chatId,
          userId: update.callback?.from.id,
          action: update.callback?.data,
        },
      }

    case 'command':
      return {
        ...baseEvent,
        type: 'telegram_command',
        data: update.message,
      }

    default:
      return {
        ...baseEvent,
        type: 'telegram_unknown',
        data: update,
      }
  }
}

/**
 * Parse command from message
 */
export function parseCommand(message: TelegramMessage): TelegramCommand | null {
  if (!message.text || !message.text.startsWith('/')) {
    return null
  }

  const parts = message.text.slice(1).split(' ')
  const command = parts[0].split('@')[0] // Remove @botname

  return {
    command,
    args: parts.slice(1),
    chatId: message.chatId,
    userId: message.from.id,
  }
}

/**
 * Format listing for Telegram
 */
export function formatListingForTelegram(listing: ListingCard): string {
  const lines = [
    `🏠 <b>${escapeHtml(listing.title)}</b>`,
    '',
    `💰 ${listing.price.toLocaleString('ru-RU')} ₽/мес`,
    `📍 ${escapeHtml(listing.city)}${listing.district ? `, ${escapeHtml(listing.district)}` : ''}`,
  ]

  if (listing.rooms) {
    lines.push(`🚪 ${listing.rooms} комн.`)
  }

  if (listing.area) {
    lines.push(`📐 ${listing.area} м²`)
  }

  return lines.join('\n')
}

/**
 * Create listing buttons
 */
export function createListingButtons(
  listingId: string,
  isFavorited: boolean
): TelegramInlineButton[][] {
  return [
    [
      {
        text: 'Подробнее',
        callbackData: `view_${listingId}`,
      },
      {
        text: isFavorited ? 'В избранном' : 'В избранное',
        callbackData: isFavorited ? `unfav_${listingId}` : `fav_${listingId}`,
      },
    ],
    [
      {
        text: 'Контакты',
        callbackData: `contact_${listingId}`,
      },
    ],
  ]
}

/**
 * Create notification response
 */
export function createNotificationResponse(
  notification: TelegramNotification
): TelegramResponse {
  let text = ''

  switch (notification.type) {
    case 'listing_new':
      text = `🆕 <b>Новое объявление!</b>\n\n${notification.body}`
      break
    case 'favorite_update':
      text = `<b>Обновление избранного</b>\n\n${notification.body}`
      break
    case 'promo':
      text = `🎁 <b>${notification.title}</b>\n\n${notification.body}`
      break
    default:
      text = `${notification.title}\n\n${notification.body}`
  }

  return {
    chatId: notification.chatId,
    text,
    parseMode: 'HTML',
    disableNotification: notification.type === 'promo',
  }
}

/**
 * Escape HTML for Telegram
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Validate callback data
 */
export function parseCallbackData(data: string): {
  action: string
  id?: string
} | null {
  const parts = data.split('_')
  if (parts.length < 1) return null

  return {
    action: parts[0],
    id: parts.slice(1).join('_') || undefined,
  }
}

export default {
  adaptTelegramUser,
  adaptUpdateToEvent,
  parseCommand,
  formatListingForTelegram,
  createListingButtons,
  createNotificationResponse,
  escapeHtml,
  parseCallbackData,
}
