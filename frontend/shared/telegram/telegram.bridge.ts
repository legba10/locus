/**
 * Telegram Login Bridge — вход через бота с номером телефона и политикой
 *
 * Flow:
 * 1. POST /api/auth/telegram/start → loginToken
 * 2. Открыть Telegram: tg://resolve?domain=BOT&start=loginToken (mobile) или https://t.me/BOT?start=loginToken (desktop)
 * 3. Пользователь в боте: отправляет номер → подтверждает политику
 * 4. Poll POST /api/auth/telegram/complete { token } каждые 1.5 сек
 * 5. При authenticated: setSession(access_token, refresh_token) → редирект
 */

import { apiFetch, apiFetchRaw } from "@/shared/api/client";

interface StartResponse {
  loginToken: string;
}

interface StatusResponse {
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: string;
    phone: string | null;
    telegram_id: string | null;
    full_name: string | null;
    role: string;
    tariff: string;
  };
  status?: "expired" | "not_found" | "not_confirmed" | "timeout" | string;
}

const POLL_INTERVAL = 1500; // 1.5 sec
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 min
const REQUEST_TIMEOUT_MS = 7000; // 7 sec per request (UX requirement)

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
 * Опрос завершения — используется на странице /auth/telegram/complete при возврате пользователя.
 */
export async function pollTelegramLoginStatus(
  loginToken: string
): Promise<StatusResponse | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let res: Response;
      try {
        res = await apiFetchRaw("/auth/telegram/complete", {
          method: "POST",
          body: JSON.stringify({ token: loginToken }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(t);
      }

      const text = await res.text();
      const payload = text ? (JSON.parse(text) as StatusResponse | { message?: string }) : {};

      if (res.ok) {
        return payload as StatusResponse;
      }

      if (res.status === 409) {
        const msg = (payload as { message?: string })?.message || "";
        if (msg === "TOKEN_EXPIRED") return { status: "expired" };
        if (msg === "USER_NOT_FOUND") return { status: "not_found" };
        return { status: "expired" };
      }
      if (res.status === 400) {
        const msg = (payload as { message?: string })?.message || "";
        if (msg === "TOKEN_EXPIRED") return { status: "expired" };
        if (msg === "TOKEN_NOT_FOUND") return { status: "not_found" };
        if (msg === "SESSION_NOT_CONFIRMED") return { status: "not_confirmed" };
      }

      await sleep(POLL_INTERVAL);
    } catch (error) {
      console.error("Poll error:", error);
      // Timeout/network issues: stop polling and let UI show Retry
      if (error instanceof DOMException && error.name === "AbortError") {
        return { status: "timeout" };
      }
      return { status: "timeout" };
    }
  }

  return { status: "expired" };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
