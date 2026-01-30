import { apiFetch } from "@/shared/utils/apiFetch";
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
 * Fetch current user from backend
 * Token is automatically injected from Supabase session via apiFetch
 */
export async function me(): Promise<MeResponse> {
  const res = await apiFetch("/auth/me", { method: "GET" });
  
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
    logger.warn('Auth', `me() error: ${msg}`);
    throw new AuthApiError(msg, res.status, payload);
  }
  
  return payload as MeResponse;
}
