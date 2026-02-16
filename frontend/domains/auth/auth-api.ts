import { apiFetchRaw } from "@/shared/api/client";
import { logger } from "@/shared/utils/logger";
import type { MeResponse } from "./auth-types";

export class AuthApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.payload = payload;
  }
}

/**
 * Текущий пользователь с бэкенда. Authorization: Bearer берётся из supabase.auth.getSession() в api client.
 */
export async function me(): Promise<MeResponse> {
  const res = await apiFetchRaw("/api/auth/me", { method: "GET", credentials: "include" });

  const text = await res.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = { message: text || `Request failed: ${res.status}` };
  }

  if (!res.ok) {
    const msg =
      (payload as { message?: string })?.message ||
      (res.status === 401 ? "Требуется авторизация" : `Ошибка: ${res.status}`);
    logger.warn("Auth", `me() error: ${msg}`);
    throw new AuthApiError(msg, res.status, payload);
  }

  return payload as MeResponse;
}

/**
 * Установить cookie-сессию из Supabase токенов (Telegram / legacy).
 */
export async function setSession(accessToken: string, refreshToken: string): Promise<MeResponse> {
  const res = await apiFetchRaw("/api/auth/session", {
    method: "POST",
    body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
    credentials: "include",
  });
  const text = await res.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = { message: text || `Request failed: ${res.status}` };
  }
  if (!res.ok) {
    const msg = (payload as { message?: string })?.message ?? "Ошибка установки сессии";
    throw new AuthApiError(msg, res.status, payload);
  }
  return payload as MeResponse;
}
