"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/shared/supabase-client";
import { pollTelegramLoginStatus } from "@/shared/telegram/telegram.bridge";

function CompleteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Завершение входа...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Токен не найден. Начните вход заново.");
      return;
    }

    async function completeAuth() {
      try {
        const res = await pollTelegramLoginStatus(token);

        const session = res?.session;
        if (res?.authenticated && session?.access_token && session?.refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });

          if (error) {
            setStatus("error");
            setMessage("Ошибка сессии. Попробуйте войти ещё раз.");
            return;
          }

          if (data?.session) {
            setStatus("success");
            setMessage("Вход выполнен. Перенаправление...");
            window.location.href = "/";
            return;
          }
        }

        setStatus("error");
        if (res?.status === "expired") {
          setMessage("Сессия истекла. Попробуйте войти заново.");
        } else if (res?.status === "not_found") {
          setMessage("Сессия не найдена. Начните вход с сайта.");
        } else if (res?.status === "used") {
          setMessage("Ссылка уже использована. Попробуйте войти заново.");
        } else {
          setMessage("Вход не завершён. Отправьте номер и подтвердите политику в боте.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Ошибка подключения. Попробуйте позже.");
      }
    }

    completeAuth();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <p className="text-gray-700">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <p className="text-gray-700 mb-6">{message}</p>
            <a
              href="/auth/login"
              className="inline-block px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500"
            >
              Вернуться к входу
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function TelegramCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
