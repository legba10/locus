/**
 * Telegram Login Bridge — запрос идёт напрямую в NestJS backend (Railway)
 */

import { apiFetchRaw } from '@/shared/api/client'
import { telegramLogin } from './telegram.login'

export async function handleTelegramLogin() {
  const data = await telegramLogin()
  if (data == null) return null
  
  // Path will be normalized to /api/auth/telegram by apiFetchRaw
  return apiFetchRaw('/auth/telegram', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
