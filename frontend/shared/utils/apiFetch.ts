"use client";

/**
 * Re-export единого API client.
 * Все вызовы идут на Railway: NEXT_PUBLIC_API_URL + /api
 * Реализация: shared/api/client.ts
 */
export { apiFetch, apiFetchJson, apiFetchRaw } from "@/shared/api/client";
