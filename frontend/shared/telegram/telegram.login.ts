/**
 * Telegram Login (client-side)
 */

export async function telegramLogin(): Promise<unknown> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Telegram login is client-only')
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tg = (window as any).Telegram
      if (!tg) return reject('Telegram SDK not loaded')

      tg.Login.auth(
        { bot_id: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID },
        (data: unknown) => resolve(data)
      )
    }
    script.onerror = () => reject('Telegram SDK load failed')
    document.body.appendChild(script)
  })
}
