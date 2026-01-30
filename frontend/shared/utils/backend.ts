import { ApiError } from "./api";
import { getApiUrl } from "@/shared/config/api";

/**
 * Full backend URL (server-side). Uses NEXT_PUBLIC_API_URL + /api/v1.
 */
export function getBackendUrl(path: string): string {
  return getApiUrl(path);
}

/**
 * Server-side fetch для backend API (используется в API routes и SSR).
 */
export async function backendGetJson<T>(path: string): Promise<T> {
  const url = getApiUrl(path);

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
 * Server-side POST для backend API.
 */
export async function backendPostJson<T>(path: string, body: unknown): Promise<T> {
  const url = getApiUrl(path);
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
