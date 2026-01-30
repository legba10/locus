"use client";

import { ProtectedRoute } from "@/domains/auth";

/**
 * Admin Layout — Отдельный layout для админки
 * 
 * Особенности:
 * - Тёмная тема
 * - Без основного header/footer
 * - Защита по роли admin
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}>
        {children}
      </div>
    </ProtectedRoute>
  );
}
