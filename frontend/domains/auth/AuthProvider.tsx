"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "./auth-store";
import { logger } from "@/shared/utils/logger";
import { apiFetchRaw, setOn401 } from "@/shared/api/client";
import { supabase } from "@/shared/supabase-client";
import { clearTokens } from "@/shared/auth/token-storage";
import { initAuth } from "./initAuth";
import type { Session } from "@supabase/supabase-js";
import { consumeOAuthLoginIntent, playLoginSoundOnce } from "@/lib/system/soundManager";

/**
 * AuthProvider — блокирующая инициализация auth.
 * Пока authReady === false — контент не рендерится, запросы к backend не делаются.
 * После initAuth() → initialize() только при наличии session; без таймаутов.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initCalled = useRef(false);
  const syncCalled = useRef(false);

  /* ТЗ-9: после логина/загрузки восстанавливать тему из localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved && typeof document !== "undefined") {
      const theme = saved === "dark" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, []);

  /* Единый источник auth: при смене сессии Supabase синхронизируем store. */
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        if (event === "SIGNED_IN" && consumeOAuthLoginIntent()) {
          playLoginSoundOnce();
        }
        useAuthStore.getState().refresh();
      } else {
        clearTokens();
        useAuthStore.setState({ user: null, accessToken: null });
      }
    });
    const unsub = (sub as { data?: { subscription?: { unsubscribe?: () => void } } })?.data?.subscription?.unsubscribe;
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  /* Блокирующая инициализация: сначала getSession, потом рендер контента. */
  useEffect(() => {
    initAuth()
      .then((s) => {
        setSession(s);
        setAuthReady(true);
      })
      .catch((err) => {
        logger.error("Auth", "initAuth failed", err);
        setAuthReady(true);
      });
  }, []);

  /* initialize() только после authReady; вызов /me только при session (внутри store). Без таймаутов. */
  useEffect(() => {
    if (!authReady) return;
    if (initCalled.current) return;
    initCalled.current = true;
    initialize()
      .then(() => logger.debug("Auth", "Initialize complete"))
      .catch((err) => logger.error("Auth", "Initialize error", err));
  }, [authReady, initialize]);

  // Sync user on each visit when session exists (best-effort, non-blocking).
  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return;
    if (syncCalled.current) return;
    syncCalled.current = true;
    apiFetchRaw("/sync-user", { method: "POST" }).catch(() => undefined);
  }, [isInitialized, user]);

  // ТЗ-6: при 401 редирект на login только с защищённых маршрутов. Главная и публичные страницы — без редиректа (нет цикла).
  const PROTECTED_PATHS = ["/profile", "/owner", "/favorites", "/messages", "/bookings", "/admin", "/ai-params"]
  useEffect(() => {
    setOn401(() => {
      const pathname = typeof window !== "undefined" ? window.location.pathname : ""
      if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register") || pathname.startsWith("/auth/telegram")) return
      const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
      useAuthStore.getState().logout().then(() => {
        if (typeof window !== "undefined" && isProtected) window.location.href = "/auth/login"
      })
    })
  }, [])

  /* Пока authReady === false — не делаем запросы к backend (контент не монтируется). */
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-main)]" aria-busy="true">
        <span className="text-[var(--text-secondary)]">Загрузка...</span>
      </div>
    );
  }
  return <>{children}</>;
}
