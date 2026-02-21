import { ListingStatus } from "@prisma/client";

export type CanonicalListingStatus =
  | "draft"
  | "moderation"
  | "published"
  | "rejected"
  | "archived";

export function toCanonicalListingStatus(status: ListingStatus | string | null | undefined): CanonicalListingStatus {
  const raw = String(status ?? "").toUpperCase();
  if (raw === ListingStatus.PUBLISHED) return "published";
  if (raw === ListingStatus.PENDING_REVIEW || raw === ListingStatus.AWAITING_PAYMENT) return "moderation";
  if (raw === ListingStatus.REJECTED) return "rejected";
  if (raw === ListingStatus.ARCHIVED || raw === ListingStatus.BLOCKED) return "archived";
  return "draft";
}

export function fromCanonicalListingStatus(status: CanonicalListingStatus): ListingStatus {
  if (status === "published") return ListingStatus.PUBLISHED;
  if (status === "moderation") return ListingStatus.PENDING_REVIEW;
  if (status === "rejected") return ListingStatus.REJECTED;
  if (status === "archived") return ListingStatus.ARCHIVED;
  return ListingStatus.DRAFT;
}
