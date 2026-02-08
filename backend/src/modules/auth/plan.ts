export type LegacyTariff = "free" | "landlord_basic" | "landlord_pro";

export type Plan = "FREE" | "PRO" | "AGENCY";

export function planFromLegacyTariff(tariff: string | null | undefined): { plan: Plan; listingLimit: number } {
  const t = (tariff ?? "free").toLowerCase();
  // Final business logic:
  // - FREE: 1 listing
  // - landlord_basic: 10 listings
  // - landlord_pro: unlimited (represented as a very large limit)
  if (t === "landlord_pro") return { plan: "AGENCY", listingLimit: 1_000_000 };
  if (t === "landlord_basic") return { plan: "PRO", listingLimit: 10 };
  return { plan: "FREE", listingLimit: 1 };
}

