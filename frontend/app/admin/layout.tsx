"use client";

import { ProtectedRoute } from "@/domains/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * Admin Layout — Отдельный layout для админки
 * TZ-1: AdminSidebar + защита по роли admin
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="admin-panel min-h-screen flex">
        <aside className="admin-sidebar hidden lg:flex flex-col w-[240px] shrink-0 border-r border-[var(--admin-card-border)] pt-4 pb-4">
          <AdminSidebar />
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
