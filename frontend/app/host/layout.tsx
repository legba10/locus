"use client";

import { ProtectedRoute } from "@/domains/auth";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["host", "admin"]}>
      {children}
    </ProtectedRoute>
  );
}
