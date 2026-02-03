/**
 * Telegram Login Bridge — вход через бота без ввода номера
 * 
 * Flow:
 * 1. Инициализируем сессию на бэкенде → получаем токен и URL бота
 * 2. Открываем Telegram бота в новой вкладке
 * 3. Пользователь нажимает Start в боте
 * 4. Опрашиваем статус авторизации
 * 5. При успехе — редиректим на главную
 */

import { apiFetch } from '@/shared/api/client'

interface LoginInitResponse {
  ok: boolean
  token: string
  botUrl: string
  botName: string
}

interface LoginCheckResponse {
  ok: boolean
  status: 'pending' | 'completed' | 'expired' | 'not_found'
  user?: {
    id: string
    telegramId: string
    username?: string
    firstName?: string
  }
}

const POLL_INTERVAL = 2000 // 2 seconds
const MAX_POLL_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Начать процесс входа через Telegram
 */
export async function handleTelegramLogin(): Promise<boolean> {
  try {
    // Step 1: Initialize login session
    const initResponse = await apiFetch<LoginInitResponse>('/telegram/login/init')
    
    if (!initResponse?.ok || !initResponse.token || !initResponse.botUrl) {
      console.error('Failed to initialize Telegram login')
      alert('Не удалось инициализировать вход через Telegram. Попробуйте позже.')
      return false
    }

    const { token, botUrl } = initResponse

    // Step 2: Open Telegram bot in new tab
    window.open(botUrl, '_blank')

    // Show instruction to user
    const confirmed = confirm(
      '📱 Telegram открыт в новой вкладке.\n\n' +
      '1. Нажмите "Start" в боте\n' +
      '2. Вернитесь на эту страницу\n' +
      '3. Нажмите OK для завершения входа\n\n' +
      'Нажмите OK когда завершите действия в Telegram.'
    )

    if (!confirmed) {
      return false
    }

    // Step 3: Poll for login status
    const result = await pollLoginStatus(token)

    if (result?.status === 'completed' && result.user) {
      // Login successful!
      console.log('Telegram login success:', result.user)
      
      // Reload page to refresh auth state
      window.location.href = '/'
      return true
    }

    if (result?.status === 'expired') {
      alert('Время входа истекло. Попробуйте ещё раз.')
    } else if (result?.status === 'not_found') {
      alert('Сессия не найдена. Попробуйте ещё раз.')
    } else {
      alert('Вход не завершён. Убедитесь, что вы нажали Start в боте.')
    }

    return false

  } catch (error) {
    console.error('Telegram login error:', error)
    alert('Ошибка входа через Telegram. Попробуйте позже.')
    return false
  }
}

/**
 * Опрашиваем статус авторизации
 */
async function pollLoginStatus(token: string): Promise<LoginCheckResponse | null> {
  const startTime = Date.now()

  while (Date.now() - startTime < MAX_POLL_TIME) {
    try {
      const response = await apiFetch<LoginCheckResponse>(`/telegram/login/check?token=${token}`)

      if (response?.status === 'completed') {
        return response
      }

      if (response?.status === 'expired' || response?.status === 'not_found') {
        return response
      }

      // Still pending, wait and retry
      await sleep(POLL_INTERVAL)

    } catch (error) {
      console.error('Poll error:', error)
      await sleep(POLL_INTERVAL)
    }
  }

  // Timeout
  return { ok: false, status: 'expired' }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Быстрый вход (без confirm диалога) — для продвинутых пользователей
 */
export async function handleTelegramLoginQuick(): Promise<void> {
  try {
    const initResponse = await apiFetch<LoginInitResponse>('/telegram/login/init')
    
    if (initResponse?.ok && initResponse.botUrl) {
      // Просто открываем Telegram — пользователь сам вернётся
      window.location.href = initResponse.botUrl
    }
  } catch (error) {
    console.error('Quick login error:', error)
  }
}
