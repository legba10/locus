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
 * Логин через backend (email + password). Backend ставит cookie, возвращает user.
 * Цепочка: POST /api/auth/login → Set-Cookie → /me с credentials.
 */
export async function loginApi(email: string, password: string): Promise<MeResponse> {
  const res = await apiFetchRaw("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  const text = await res.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = { message: text || `Request failed: ${res.status}` };
  }
  if (!res.ok) {
    const msg = (payload as { message?: string })?.message ?? "Неверный email или пароль";
    throw new AuthApiError(msg, res.status, payload);
  }
  return payload as MeResponse;
}

/**
 * Регистрация через backend (email + password + name, role). Backend создаёт пользователя и сразу логинит (cookie).
 */
export async function registerApi(data: { email: string; password: string; name?: string; role: string }): Promise<MeResponse> {
  const res = await apiFetchRaw("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      name: data.name?.trim() || undefined,
      role: data.role === "landlord" ? "landlord" : "user",
    }),
  });
  const text = await res.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = { message: text || `Request failed: ${res.status}` };
  }
  if (!res.ok) {
    const msg = (payload as { message?: string })?.message ?? "Ошибка регистрации";
    throw new AuthApiError(msg, res.status, payload);
  }
  return payload as MeResponse;
}

/**
 * Установить cookie-сессию из Supabase токенов (для Telegram и legacy flow).
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

/**
 * Fetch current user from backend. Authorization from cookie (proxy) or from storage.
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
