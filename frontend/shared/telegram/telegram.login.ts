/**
 * Telegram Login (client-side).
 * Optional: only runs when TELEGRAM is enabled and NEXT_PUBLIC_TELEGRAM_BOT_ID is set.
 * Auth works without Telegram (Supabase only).
 */

export async function telegramLogin(): Promise<unknown> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Telegram login is client-only");
  }

  const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;
  if (!botId) {
    throw new Error("Telegram is disabled: NEXT_PUBLIC_TELEGRAM_BOT_ID is not set");
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tg = (window as any).Telegram;
      if (!tg) return reject(new Error("Telegram SDK not loaded"));

      tg.Login.auth({ bot_id: botId }, (data: unknown) => resolve(data));
    };
    script.onerror = () => reject(new Error("Telegram SDK load failed"));
    document.body.appendChild(script);
  });
}
