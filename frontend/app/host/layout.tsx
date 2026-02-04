"use client";

import { ProtectedRoute } from "@/domains/auth";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["landlord"]}>
      {children}
    </ProtectedRoute>
  );
}
