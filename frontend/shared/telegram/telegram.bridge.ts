/**
 * Telegram Login Bridge — запрос идёт напрямую в NestJS backend (Railway).
 */

import { apiFetchRaw } from '@/shared/api/client'
import { telegramLogin } from './telegram.login'

export async function handleTelegramLogin() {
  const data = await telegramLogin()
  return apiFetchRaw('/auth/telegram', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
