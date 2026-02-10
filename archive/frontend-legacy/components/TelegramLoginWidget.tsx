"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { apiFetchRaw } from "@/shared/api/client";
import { useAuthStore } from "@/domains/auth";

type TelegramAuthPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    locusTelegramAuth?: (user: TelegramAuthPayload) => void;
  }
}

const REQUEST_TIMEOUT_MS = 7000;

export function TelegramLoginWidget({
  className,
  redirectTo = "/profile",
}: {
  className?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const refresh = useAuthStore((s) => s.refresh);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const botName = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "";
    return raw.replace("@", "");
  }, []);

  useEffect(() => {
    if (!botName) return;
    if (!containerRef.current) return;

    setError(null);

    window.locusTelegramAuth = async (user: TelegramAuthPayload) => {
      setLoading(true);
      setError(null);
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res: Response;
        try {
          res = await apiFetchRaw("/auth/telegram", {
            method: "POST",
            body: JSON.stringify(user),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(t);
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          setError(text || "Не удалось войти через Telegram");
          setLoading(false);
          return;
        }

        const ok = await refresh();
        if (!ok) {
          setError("Не удалось обновить профиль после входа");
          setLoading(false);
          return;
        }

        router.replace(redirectTo);
      } catch (e) {
        const isTimeout = e instanceof DOMException && e.name === "AbortError";
        setError(isTimeout ? "Сервер долго отвечает (7 сек). Попробуйте ещё раз." : "Ошибка входа через Telegram");
        setLoading(false);
      }
    };

    // Clean container and inject widget script
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-radius", "14");
    script.setAttribute("data-onauth", "locusTelegramAuth(user)");
    script.onerror = () => setError("Не удалось загрузить Telegram виджет");
    containerRef.current.appendChild(script);

    return () => {
      if (window.locusTelegramAuth) {
        delete window.locusTelegramAuth;
      }
    };
  }, [botName, refresh, router, redirectTo]);

  if (!botName) return null;

  return (
    <div className={className}>
      <div
        className={cn(
          "rounded-[14px]",
          loading && "opacity-60 pointer-events-none"
        )}
      >
        <div ref={containerRef} />
      </div>
      {error && <p className="mt-2 text-[12px] text-red-600 text-center">{error}</p>}
      {loading && <p className="mt-2 text-[12px] text-[#6B7280] text-center">Вход через Telegram…</p>}
    </div>
  );
}

