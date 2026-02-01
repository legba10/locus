/**
 * ЕДИНСТВЕННЫЙ API client для LOCUS
 * Все запросы идут через Railway backend
 */

"use client";

import { getApiUrl } from "@/shared/config/api";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { supabase } from "@/shared/supabase-client";

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

/**
 * Low-level fetch — returns raw Response
 * Use for cases where you need status/headers (like auth/me)
 */
export async function apiFetchRaw(path: string, options?: RequestInit): Promise<Response> {
  const fullPath = normalizePath(path);
  const url = fullPath.startsWith("http") ? fullPath : getApiUrl(fullPath);
  
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  
  // Set Content-Type for JSON (not for FormData)
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  // Get Supabase token if available
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
    }
  } catch {
    // No session - continue without auth
  }
  
  return fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });
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
    try {
      const json = text ? JSON.parse(text) : {};
      serverMsg = json.message ?? json.error;
    } catch {
      serverMsg = text || undefined;
    }
    
    const msg = getApiErrorMessage(res.status, serverMsg);
    console.error("[API] Error:", path, res.status, msg);
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
 * Typed JSON fetch
 */
export async function apiFetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(path, options);
}
