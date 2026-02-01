import { ApiError } from "./api";
import { getApiUrl } from "@/shared/config/api";

/**
 * Normalize path to include /api/ prefix
 */
function normalizePath(path: string): string {
  if (path.startsWith('http')) return path;
  
  let p = path.startsWith('/') ? path : `/${path}`;
  if (!p.startsWith('/api/') && !p.startsWith('/api?')) {
    p = `/api${p}`;
  }
  return p;
}

/**
 * Full backend URL
 */
export function getBackendUrl(path: string): string {
  return getApiUrl(normalizePath(path));
}

/**
 * Server-side GET for backend API
 */
export async function backendGetJson<T>(path: string): Promise<T> {
  const url = getBackendUrl(path);

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
 * Server-side POST for backend API
 */
export async function backendPostJson<T>(path: string, body: unknown): Promise<T> {
  const url = getBackendUrl(path);
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
