/**
 * API Configuration
 * 
 * ARCHITECTURE:
 * - Auth & Profiles live in Supabase
 * - Business data lives in Neon (via Railway backend)
 * - Frontend NEVER talks to Railway directly from browser
 * - All browser API calls go through Next.js API proxy to avoid CORS
 * 
 * Flow: Browser → /api/* (Next.js proxy) → Railway → Neon
 */

// Railway backend URL (used for server-side requests only)
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Check if code is running in browser
 */
const isBrowser = typeof window !== "undefined";

/**
 * Get API URL for a path
 * 
 * - Browser: uses relative /api/* (proxied by Next.js)
 * - Server: uses full Railway URL
 * 
 * @param path - API path, e.g., "/api/listings" or "/api/auth/me"
 */
export function getApiUrl(path: string): string {
  // Normalize path to start with /
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Ensure path starts with /api/
  if (!normalizedPath.startsWith("/api/") && !normalizedPath.startsWith("/api?")) {
    normalizedPath = `/api${normalizedPath}`;
  }

  // Browser: use relative URL (goes through Next.js proxy)
  if (isBrowser) {
    return normalizedPath;
  }

  // Server-side: use full Railway URL
  if (!BACKEND_URL) {
    console.warn("[API] NEXT_PUBLIC_API_URL not set, using relative path");
    return normalizedPath;
  }

  return `${BACKEND_URL}${normalizedPath}`;
}

/**
 * Legacy export for backward compatibility
 */
export const API_URL = BACKEND_URL;
