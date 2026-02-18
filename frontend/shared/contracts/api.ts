/**
 * API Contract — единый контракт между frontend и backend.
 * Все DTO и ответы API синхронизированы через shared/contracts.
 */

// ——— Listing (совместимо с backend CreateListingDto, ответы GET /listings, /search)
/** Тариф размещения объявления (ТЗ 5). Backend: listing.plan */
export type ListingPlan = "free" | "pro" | "top";

export interface Listing {
  id: string;
  title: string;
  description?: string;
  city: string;
  addressLine?: string;
  lat?: number;
  lng?: number;
  basePrice: number;
  pricePerNight?: number;
  currency?: string;
  capacityGuests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  ownerId?: string;
  hostId?: string;
  createdAt?: string;
  photos?: ListingPhoto[];
  amenities?: string[];
  houseRules?: Record<string, unknown>;
  /** Тариф продвижения: free (базовый), pro, top. ТЗ 5. */
  plan?: ListingPlan;
}

export interface ListingPhoto {
  url: string;
  sortOrder?: number;
  id?: string;
}

export type ListingBadge = string;

export type ListingImage = { url: string; alt?: string };

export interface ListingAiScores {
  qualityScore?: number | null;
  demandScore?: number | null;
  riskScore?: number | null;
  priceScore?: number | null;
}

export type DemandLevel = "low" | "medium" | "high";

export interface EnrichedListing extends Listing {
  score?: number;
  aiScore?: number;
  verdict?: string;
  explanation?: string;
  demandLevel?: DemandLevel;
  reasons?: string[];
  aiReasons?: string[];
  badges?: string[];
  images?: ListingImage[];
}

// ——— Create/Update (совместимо с backend DTO)
export interface CreateListingInput {
  title: string;
  description: string;
  city: string;
  addressLine?: string;
  lat?: number;
  lng?: number;
  basePrice: number;
  currency?: string;
  capacityGuests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  houseRules?: Record<string, unknown>;
  photos?: ListingPhoto[];
}

export interface UpdateListingInput extends Partial<CreateListingInput> {}

// ——— Booking
export interface Booking {
  id: string;
  listingId: string;
  userId?: string;
  from: string;
  to: string;
  guests: number;
  totalPrice?: number;
  currency?: string;
  status: string;
  createdAt?: string;
}

// ——— User / Auth (совместимо с backend /auth/me)
export type AppRole = "user" | "landlord" | "admin";
export type UserTariff = "free" | "landlord_basic" | "landlord_pro";
export type UserPlan = "FREE" | "PRO" | "AGENCY";
export interface UserProfile {
  full_name?: string | null;
  phone?: string | null;
  telegram_id?: string | null;
  role?: string | null;
  tariff?: UserTariff | null;
}

export interface UserContract {
  id: string;
  email?: string;
  role: AppRole | "admin";
  plan?: UserPlan;
  listingLimit?: number;
  listingUsed?: number;
  isAdmin?: boolean;
  profileCompleted?: boolean;
  /**
   * Raw role stored in Supabase `public.profiles.role`.
   * For Telegram onboarding we use:
   * - "user" (default) => role not selected yet
   * - "renter" => selected "Ищу жильё" (maps to business role "user")
   * - "landlord" => selected "Сдаю жильё"
   */
  profile_role_raw?: string | null;
  /**
   * True for Telegram users who still have default role ("user") and must pick renter/landlord.
   */
  needsRoleSelection?: boolean;
  // Legacy fields (still used in parts of UI)
  phone?: string | null;
  telegram_id?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
  tariff?: UserTariff;
  supabaseId?: string;
  roles?: Array<AppRole | "admin">;
}

// ——— API responses
export interface ApiListingsResponse {
  items: Listing[] | EnrichedListing[];
}

export interface ApiListingResponse {
  item: Listing | EnrichedListing;
}

export interface ApiBookingResponse {
  item: Booking;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

// Алиасы для совместимости с domains
export type ListingContract = Listing;
export type EnrichedListingContract = EnrichedListing;
