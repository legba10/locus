"use client";

import { supabase } from "@/shared/supabaseClient";
import { logger } from "./logger";

/**
 * UNIFIED API CLIENT
 * Single source of truth for all API calls
 * 
 * Features:
 * - Automatic auth token injection
 * - Timeout handling (10s default)
 * - Retry logic (1 retry on network error)
 * - Graceful error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Safe fallback + logging
if (!API_BASE_URL && typeof window !== 'undefined') {
  logger.error('API', 'CRITICAL: NEXT_PUBLIC_API_BASE_URL is missing! Using fallback.');
}

const EFFECTIVE_API_URL = API_BASE_URL || "http://localhost:4000/api/v1";

// Configuration
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 1;

/**
 * Core fetch with timeout, retry, and auth
 */
export async function apiFetch(
  url: string, 
  options: RequestInit = {},
  config: { timeout?: number; retries?: number } = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES } = config;
  
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // НЕ устанавливаем Content-Type для FormData - браузер сам установит с boundary
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchWithTimeout = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${EFFECTIVE_API_URL}${url}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Retry logic
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on abort (timeout)
      if (lastError.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms: ${url}`);
      }
      
      // Don't retry on last attempt
      if (attempt === retries) {
        throw lastError;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
    }
  }

  throw lastError;
}

/**
 * apiFetch с автоматическим парсингом JSON ответа.
 */
export async function apiFetchJson<T>(
  url: string, 
  options: RequestInit = {},
  config?: { timeout?: number; retries?: number }
): Promise<T> {
  const res = await apiFetch(url, options, config);
  
  const text = await res.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = { message: text || `Request failed: ${res.status}` };
  }

  if (!res.ok) {
    throw new Error((payload as { message?: string })?.message || `Request failed: ${res.status}`);
  }

  return payload as T;
}
