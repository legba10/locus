"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

/**
 * TZ-2: обёртка для корневого layout — ловит все непойманные ошибки рендера.
 */
export default function ErrorBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
