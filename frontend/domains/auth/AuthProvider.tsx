"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "./auth-store";
import { logger } from "@/shared/utils/logger";
import { apiFetchRaw, setOn401 } from "@/shared/api/client";
import { supabase } from "@/shared/supabase-client";
import { setTokens, clearTokens } from "@/shared/auth/token-storage";

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

  // TZ-9: при 401 только logout, без редиректа — иначе при открытии главной уводит в логин
  useEffect(() => {
    setOn401(() => {
      useAuthStore.getState().logout();
    });
  }, []);

  // TZ-6: Safari — persist session, синхронизация при смене auth state
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearTokens();
        useAuthStore.getState().logout();
      } else if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.access_token && session?.refresh_token) {
        setTokens(session.access_token, session.refresh_token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Always render children immediately - don't block on auth
  return <>{children}</>;
}
