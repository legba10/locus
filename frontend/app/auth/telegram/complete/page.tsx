"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { pollTelegramLoginStatus } from "@/shared/telegram/telegram.bridge";
import { useAuthStore } from "@/domains/auth";
import Loader from "@/components/ui/Loader";
import LottieIcon from "@/components/ui/LottieIcon";
import checkAnim from "@/public/lottie/check.json";
import errorAnim from "@/public/lottie/Error.json";

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const refresh = useAuthStore((s) => s.refresh);
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

        // Tokens are now stored in httpOnly cookies by backend/proxy.
        // We only need to refresh profile and redirect.
        if (res?.access_token || res?.refresh_token || res?.user) {
          try {
            const ok = await refresh();
            if (!ok) throw new Error("refresh failed");
            setStatus("success");
            setMessage("Вход выполнен. Перенаправление...");
            router.replace("/");
            return;
          } catch {
            setStatus("error");
            setMessage("Не удалось подтвердить профиль. Попробуйте войти ещё раз.");
            return;
          }
        }

        setStatus("error");
        if (res?.status === "expired") {
          setMessage("Сессия истекла. Попробуйте войти заново.");
        } else if (res?.status === "not_found") {
          setMessage("Сессия не найдена. Начните вход с сайта.");
        } else if (res?.status === "not_confirmed") {
          setMessage("Вход не подтверждён. Вернитесь в бота и подтвердите.");
        } else if (res?.status === "timeout") {
          setMessage("Сервер долго отвечает (7 сек). Проверьте связь и нажмите «Повторить».");
        } else {
          setMessage("Вход не завершён. Отправьте номер и подтвердите политику в боте.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Ошибка подключения. Попробуйте позже.");
      }
    }

    completeAuth();
  }, [token, refresh, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 w-fit">
              <Loader size={48} />
            </div>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 w-fit">
              <LottieIcon animationData={checkAnim} size={56} loop={false} />
            </div>
            <p className="text-gray-700">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 w-fit">
              <LottieIcon animationData={errorAnim} size={56} loop />
            </div>
            <p className="text-gray-700 mb-6">{message}</p>
            <div className="flex flex-col gap-3 items-center">
              {token && (
                <button
                  type="button"
                  className="inline-block px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500"
                  onClick={() => {
                    setStatus("loading");
                    setMessage("Повторяем попытку...");
                    // Re-run by simulating effect re-entry:
                    // easiest is full reload keeping token in URL
                    window.location.reload();
                  }}
                >
                  Повторить
                </button>
              )}
              <a
                href="/auth/login"
                className="inline-block px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-medium hover:bg-gray-50"
              >
                Вернуться к входу
              </a>
            </div>
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
          <Loader size={48} />
        </div>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
