"use client";

import { ProtectedRoute } from "@/domains/auth";

/**
 * Admin Layout — Отдельный layout для админки
 * 
 * Особенности:
 * - Тёмная тема
 * - Без основного header/footer
 * - Защита по роли landlord
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="admin-panel min-h-screen">
        {children}
      </div>
    </ProtectedRoute>
  );
}
