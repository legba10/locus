import { ApiError } from "./api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

/**
 * Server-side fetch для backend API (используется в API routes и SSR).
 * 
 * @param path - путь с /api/v1 префиксом (например "/api/v1/search")
 * @returns Promise<T>
 */
export async function backendGetJson<T>(path: string): Promise<T> {
  // Если путь уже содержит /api/v1, используем базовый URL без него
  let url: string;
  if (path.startsWith("/api/v1")) {
    const baseUrl = API_BASE_URL.replace("/api/v1", "");
    url = `${baseUrl}${path}`;
  } else {
    url = `${API_BASE_URL}${path}`;
  }

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
