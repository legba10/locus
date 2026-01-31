/**
 * Single API client for LOCUS frontend.
 * All requests go to Railway backend via NEXT_PUBLIC_API_URL only.
 * No hardcoded URLs. Routes use prefix /api (e.g. /api/listings).
 */

import { apiFetch, apiFetchJson } from "@/shared/utils/apiFetch";

/**
 * Paths are relative; apiFetch adds /api prefix and NEXT_PUBLIC_API_URL base.
 */
export { apiFetch, apiFetchJson };

// ——— Typed helpers (all go to backend GET/POST /api/listings, GET /api/auth/me)

export async function getListings(params?: { city?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.city) qs.set("city", params.city);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetchJson<{ items: unknown[] }>(
    `/listings${query ? `?${query}` : ""}`,
    { method: "GET" }
  );
}

export async function getListing(id: string) {
  return apiFetchJson<{ item: unknown }>(`/listings/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function postListing(body: Record<string, unknown>) {
  return apiFetchJson<{ item: unknown; listing: unknown }>("/listings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getAuthMe() {
  const res = await apiFetch("/auth/me", { method: "GET" });
  const text = await res.text();
  const payload = text ? (JSON.parse(text) as unknown) : undefined;
  if (!res.ok) {
    const msg = (payload as { message?: string })?.message || `Auth error: ${res.status}`;
    if (typeof window !== "undefined") {
      console.error("[API] auth/me failed:", res.status, msg);
    }
    throw new Error(msg);
  }
  return payload;
}
