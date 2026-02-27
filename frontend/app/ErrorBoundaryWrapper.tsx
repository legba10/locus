"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ErrorBoundaryFallback } from "@/components/ui/ErrorBoundaryFallback";

/**
 * TZ-2: обёртка для корневого layout — ловит все непойманные ошибки рендера.
 * TZ-67: fallback без window.location.reload — только router.refresh().
 */
export default function ErrorBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary fallback={<ErrorBoundaryFallback />}>{children}</ErrorBoundary>;
}
