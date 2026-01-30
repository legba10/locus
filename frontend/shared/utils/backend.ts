import { ApiError } from "./api";

const API_V1 = "/api/v1";

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_URL is missing", 500, undefined);
  }
  return apiBaseUrl.replace(/\/$/, "");
}

function normalizePath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith(API_V1) ? p : `${API_V1}${p}`;
}

/**
 * Full backend URL for a path (for fetch with custom headers).
 */
export function getBackendUrl(path: string): string {
  return `${getApiBaseUrl()}${normalizePath(path)}`;
}

/**
 * Server-side fetch для backend API (используется в API routes и SSR).
 * Path может быть с или без /api/v1 — префикс добавляется автоматически.
 */
export async function backendGetJson<T>(path: string): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${normalizePath(path)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    const payload = text ? (JSON.parse(text) as unknown) : undefined;

    if (!res.ok) {
      throw new ApiError(`Backend request failed: ${res.status}`, res.status, payload);
    }

    return payload as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Backend request timeout", 504, undefined);
    }
    throw error;
  }
}

/**
 * Server-side POST для backend API (proxy для listings и др.).
 */
export async function backendPostJson<T>(path: string, body: unknown): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${normalizePath(path)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    const payload = text ? (JSON.parse(text) as unknown) : undefined;
    if (!res.ok) {
      throw new ApiError(`Backend request failed: ${res.status}`, res.status, payload);
    }
    return payload as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Backend request timeout", 504, undefined);
    }
    throw error;
  }
}
