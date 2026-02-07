export type LegacyTariff = "free" | "landlord_basic" | "landlord_pro";

export type Plan = "FREE" | "PRO" | "AGENCY";

export function planFromLegacyTariff(tariff: string | null | undefined): { plan: Plan; listingLimit: number } {
  const t = (tariff ?? "free").toLowerCase();
  if (t === "landlord_pro") return { plan: "AGENCY", listingLimit: 10 };
  if (t === "landlord_basic") return { plan: "PRO", listingLimit: 5 };
  return { plan: "FREE", listingLimit: 1 };
}

