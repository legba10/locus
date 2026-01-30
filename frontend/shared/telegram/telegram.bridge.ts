/**
 * Telegram Login Bridge
 */

import { telegramLogin } from './telegram.login'

export async function handleTelegramLogin() {
  const data = await telegramLogin()
  // eslint-disable-next-line no-console
  console.log('TELEGRAM DATA:', data)

  return fetch('/api/auth/telegram', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
