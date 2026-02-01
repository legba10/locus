/**
 * API Configuration — единственный источник URL для backend
 * Backend: Railway (https://locus-production-xxx.up.railway.app)
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Build full backend URL
 * @param path - API path, e.g., "/api/listings" or "/api/auth/me"
 * @returns Full URL, e.g., "https://backend.railway.app/api/listings"
 */
export function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Simple concatenation
  return `${API_URL}${normalizedPath}`;
}
