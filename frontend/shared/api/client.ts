/**
 * ЕДИНСТВЕННЫЙ API client для LOCUS.
 * Все запросы идут на Railway backend. Запрещено: fetch напрямую, axios, hardcode URL.
 */

"use client";

import { getApiUrl } from "@/shared/config/api";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { supabase } from "@/shared/supabase-client";

/**
 * Низкоуровневый вызов — возвращает Response (для auth/me и др., где нужны status/headers).
 */
export async function apiFetchRaw(path: string, options?: RequestInit): Promise<Response> {
  const url = path.startsWith("http") ? path : getApiUrl(path.startsWith("/") ? path : `/${path}`);
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  let token: string | undefined;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token;
  } catch {
    // no session
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { credentials: "include", ...options, headers });
}

/**
 * Единственный способ вызывать backend API из frontend.
 * path — без ведущего слэша или с ним: "/listings", "auth/me"
 * Добавляет Bearer из Supabase session, credentials: include.
 * При !res.ok бросает Error, иначе возвращает разобранный JSON.
 */
export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetchRaw(path, options);

  if (!res.ok) {
    let text: string;
    try {
      text = await res.text();
    } catch {
      text = "";
    }
    let serverMsg: string | undefined;
    try {
      const json = text ? JSON.parse(text) : {};
      serverMsg = (json as { message?: string }).message ?? (json as { error?: string }).error;
    } catch {
      serverMsg = text || undefined;
    }
    const msg = getApiErrorMessage(res.status, serverMsg);
    if (typeof window !== "undefined") {
      console.error("[API] request failed:", path, res.status, msg);
    }
    throw new Error(msg);
  }

  const contentType = res.headers.get("content-type");
  const text = await res.text();
  if (!text) return undefined as T;
  if (contentType?.includes("application/json")) {
    try {
      return JSON.parse(text) as T;
    } catch {
      return undefined as T;
    }
  }
  return undefined as T;
}

/**
 * Типизированный вызов с явным возвратом JSON.
 */
export async function apiFetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(path, options);
}
