/**
 * LOCUS API Client
 * 
 * ARCHITECTURE:
 * - Auth & Profiles live in Supabase
 * - Business data lives in Neon (via Railway backend)
 * - Frontend NEVER talks to Railway directly
 * - All API calls go through Next.js API proxy to avoid CORS
 * 
 * Flow: Browser → /api/* (Next.js proxy) → Railway → Neon
 */

import { getApiUrl } from "@/shared/config/api";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { getAccessToken, clearTokens } from "@/shared/auth/token-storage";

/**
 * Normalize path to ensure it starts with /api/
 */
function normalizePath(path: string): string {
  // Already a full URL
  if (path.startsWith("http")) return path;
  
  // Ensure leading slash
  let p = path.startsWith("/") ? path : `/${path}`;
  
  // Ensure /api/ prefix
  if (!p.startsWith("/api/") && !p.startsWith("/api?")) {
    p = `/api${p}`;
  }
  
  return p;
}

let on401Handler: (() => void) | null = null;
/** TZ-3: регистрация обработчика 401 (logout). Без авто-refresh — проверка сессии один раз при загрузке. */
export function setOn401(handler: () => void) {
  on401Handler = handler;
}

/**
 * Low-level fetch — returns raw Response.
 * TZ-3: при 401 НЕ вызываем refresh (избегаем auth-loop). Только clearTokens + on401Handler.
 */
export async function apiFetchRaw(path: string, options?: RequestInit): Promise<Response> {
  const fullPath = normalizePath(path);
  const url = fullPath.startsWith("http") ? fullPath : getApiUrl(fullPath);

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const accessToken = getAccessToken();
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearTokens();
    if (typeof window !== "undefined" && on401Handler) {
      on401Handler();
    }
  }

  return response;
}

/**
 * Main API fetch — returns parsed JSON or throws on error
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
    let serverCode: string | undefined;
    let serverPayload: any = undefined;
    try {
      const json = text ? JSON.parse(text) : {};
      serverPayload = json;
      serverMsg = json.message ?? json.error;
      serverCode = json.code;
    } catch {
      serverMsg = text || undefined;
    }
    
    const msg = getApiErrorMessage(res.status, serverMsg);
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Error:", path, res.status, msg);
    }
    const err: any = new Error(msg);
    err.status = res.status;
    if (serverCode) err.code = serverCode;
    if (serverPayload) err.payload = serverPayload;
    throw err;
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
 * Typed JSON fetch
 */
export async function apiFetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(path, options);
}
