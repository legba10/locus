"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "./auth-store";
import type { UserRole } from "./auth-types";

type ProtectedRouteProps = {
  children: React.ReactNode;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
};

export function ProtectedRoute({
  children,
  roles,
  fallback,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isInitialized, hasAnyRole } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (roles && roles.length > 0 && !hasAnyRole(roles)) {
      router.replace("/");
    }
  }, [user, isLoading, isInitialized, roles, hasAnyRole, router, redirectTo]);

  // Show loading state
  if (!isInitialized || isLoading) {
    return (
      fallback ?? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-sm text-text-dim">Загрузка...</div>
        </div>
      )
    );
  }

  // Not authenticated
  if (!user) {
    return (
      fallback ?? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-sm text-text-dim">Перенаправление...</div>
        </div>
      )
    );
  }

  // Check roles
  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-300">Доступ запрещён</p>
          <p className="mt-1 text-xs text-text-dim">
            Требуется роль: {roles.join(", ")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
