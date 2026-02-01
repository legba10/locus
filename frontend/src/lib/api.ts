/**
 * Legacy API helper — redirects to proxy
 * 
 * IMPORTANT: All API calls MUST go through the Next.js proxy (/api/*)
 * Frontend NEVER talks to Railway directly to avoid CORS issues.
 */

export async function api(path: string, options?: RequestInit) {
  // Ensure path starts with /api
  const normalizedPath = path.startsWith("/api") ? path : `/api${path}`;
  
  // Use relative URL — goes through Next.js proxy
  const res = await fetch(normalizedPath, options);
  return res.json();
}

export async function getHealth() {
  return api("/api/health");
}
