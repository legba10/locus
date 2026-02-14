"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "./auth-store";
import { logger } from "@/shared/utils/logger";
import { apiFetchRaw, setOn401 } from "@/shared/api/client";

/**
 * AuthProvider — CLIENT-ONLY auth initialization
 * 
 * RULES:
 * - Auth is CLIENT ONLY (no SSR)
 * - Session loading pipeline: mount → getSession → /auth/me → update store
 * - Never blocks render
 * - Single initialization (ref guard)
 * - Abort controller for cleanup
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initCalled = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const syncCalled = useRef(false);

  useEffect(() => {
    // Guard against multiple calls (strict mode, re-renders)
    if (initCalled.current) {
      logger.debug('Auth', 'Initialize already called, skipping');
      return;
    }
    initCalled.current = true;
    
    // Create abort controller for cleanup
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    // Non-blocking initialize with timeout
    const timeoutId = setTimeout(() => {
      if (!signal.aborted) {
        logger.warn('Auth', 'Initialize timeout (5s), proceeding without auth');
      }
    }, 5000);

    initialize()
      .then(() => {
        clearTimeout(timeoutId);
        if (!signal.aborted) {
          logger.debug('Auth', 'Initialize complete');
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (!signal.aborted) {
          logger.error('Auth', 'Initialize error', err);
        }
      });

    // Cleanup on unmount
    return () => {
      abortRef.current?.abort();
    };
  }, [initialize]);

  // Sync user on each visit when session exists (best-effort, non-blocking).
  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return;
    if (syncCalled.current) return;
    syncCalled.current = true;
    apiFetchRaw("/sync-user", { method: "POST" }).catch(() => undefined);
  }, [isInitialized, user]);

  // При 401 — logout и редирект на /auth/login, но не если уже на странице входа (убираем redirect loop)
  useEffect(() => {
    setOn401(() => {
      const pathname = typeof window !== "undefined" ? window.location.pathname : ""
      if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register") || pathname.startsWith("/auth/telegram")) {
        return
      }
      useAuthStore.getState().logout().then(() => {
        if (typeof window !== "undefined") window.location.href = "/auth/login"
      })
    })
  }, [])

  // Always render children immediately - don't block on auth
  return <>{children}</>;
}
