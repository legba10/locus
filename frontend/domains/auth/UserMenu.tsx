"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./auth-store";

export function UserMenu() {
  const router = useRouter();
  const { user, isLoading, isInitialized, error, refresh, clearError, logout } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <div className="h-8 w-20 animate-pulse rounded-lg bg-white/10" />
    );
  }

  if (!user) {
    if (error) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-600">{error}</span>
          <button
            onClick={async () => {
              clearError();
              await refresh();
            }}
            className="rounded-lg border border-red-200 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
          >
            Повторить
          </button>
          <Link
            href="/auth/login"
            className="rounded-lg bg-brand px-2 py-1 text-xs font-medium text-white hover:bg-brand/90"
          >
            Войти
          </Link>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="rounded-lg border border-border bg-white/5 px-3 py-1.5 text-sm font-medium hover:bg-white/10"
        >
          Войти
        </Link>
        <Link
          href="/auth/register"
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand/90"
        >
          Регистрация
        </Link>
      </div>
    );
  }

  const displayName = user.full_name || user.email || "Пользователь";
  const isLandlord = user.role === "landlord" || (user.roles ? user.roles.includes("landlord") : false);
  const tariff = user.tariff ?? "free";
  const isPaidTariff = tariff === "landlord_basic" || tariff === "landlord_pro";
  const canAccessOwner = isLandlord && isPaidTariff;

  const roleBadge = isLandlord ? "Арендодатель" : "Пользователь";
  const tariffBadge =
    tariff === "landlord_basic" ? "Basic" : tariff === "landlord_pro" ? "Pro" : "Free";

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-white/10 flex items-center justify-center">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-text">
            {(displayName?.[0] ?? "U").toUpperCase()}
          </span>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-xs text-text-dim">
          {roleBadge}
          <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px]">{tariffBadge}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="rounded-lg border border-border bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
        >
          Профиль
        </Link>
        {canAccessOwner && (
          <Link
            href="/owner/dashboard"
            className="rounded-lg border border-border bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
          >
            Кабинет
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-border bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
