/**
 * Telegram Login Bridge — вход через бота с номером телефона и политикой
 *
 * Flow:
 * 1. POST /api/auth/telegram/start → loginToken
 * 2. Открыть Telegram: tg://resolve?domain=BOT&start=loginToken (mobile) или https://t.me/BOT?start=loginToken (desktop)
 * 3. Пользователь в боте: отправляет номер → подтверждает политику
 * 4. Poll GET /api/auth/telegram/status?token=... каждые 1.5 сек
 * 5. При authenticated: verifyOtp(tokenHash) → сохранить сессию → редирект
 */

import { apiFetch } from "@/shared/api/client";

interface StartResponse {
  loginToken: string;
}

interface StatusResponse {
  authenticated?: boolean;
  status?: string;
  tokenHash?: string;
  supabaseToken?: string;
  user?: { id: string };
}

const POLL_INTERVAL = 1500; // 1.5 sec
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 min

function getBotName(): string {
  return (process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "Locusnext_bot").replace("@", "");
}

function getBotUrl(loginToken: string): string {
  const botName = getBotName();
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone/i.test(navigator.userAgent);
  if (isMobile) {
    return `tg://resolve?domain=${botName}&start=${loginToken}`;
  }
  return `https://t.me/${botName}?start=${loginToken}`;
}

/**
 * Начать процесс входа через Telegram.
 * Переход в бота (мобилка — tg://, десктоп — t.me).
 * После возврата — страница /auth/telegram/complete обрабатывает авторизацию.
 */
export async function handleTelegramLogin(): Promise<void> {
  try {
    const startRes = await apiFetch<StartResponse>("/auth/telegram/start", { method: "POST" });

    if (!startRes?.loginToken) {
      console.error("Failed to start Telegram login");
      alert("Не удалось инициализировать вход. Попробуйте позже.");
      return;
    }

    const botUrl = getBotUrl(startRes.loginToken);
    window.location.href = botUrl;
  } catch (error) {
    console.error("Telegram login error:", error);
    alert("Ошибка входа через Telegram. Попробуйте позже.");
  }
}

/**
 * Опрос статуса — используется на странице /auth/telegram/complete при возврате пользователя.
 */
export async function pollTelegramLoginStatus(
  loginToken: string
): Promise<StatusResponse | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME) {
    try {
      const res = await apiFetch<StatusResponse>(
        `/auth/telegram/status?token=${encodeURIComponent(loginToken)}`
      );

      if (res?.authenticated) {
        return res;
      }

      if (res?.status === "expired" || res?.status === "not_found") {
        return res;
      }

      await sleep(POLL_INTERVAL);
    } catch (error) {
      console.error("Poll error:", error);
      await sleep(POLL_INTERVAL);
    }
  }

  return { status: "expired" };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
