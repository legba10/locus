/**
 * Единственный источник API URL. Запрещён hardcode URL.
 * Backend: Railway. Render исключён.
 */

const raw = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : "";
export const API_URL = raw?.trim() ?? "";
export const API_PREFIX = "/api/v1";
export const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}${API_PREFIX}` : "";

/**
 * Полный URL для пути к backend.
 * path может быть: "/listings", "/api/listings", "/api/v1/listings" → всегда /api/v1/listings на API_BASE.
 */
export function getApiUrl(path: string): string {
  if (!API_BASE) {
    if (typeof window !== "undefined") {
      console.error("[API] NEXT_PUBLIC_API_URL is missing");
    }
    throw new Error("NEXT_PUBLIC_API_URL is missing");
  }
  let p = path.startsWith("/") ? path.slice(1) : path;
  if (p.startsWith("api/v1/")) p = p.slice(7);
  else if (p.startsWith("api/")) p = p.slice(4);
  return `${API_BASE}/${p}`.replace(/\/+/g, "/");
}
