/**
 * API Contract — единый контракт между frontend и backend.
 * Все DTO и ответы API синхронизированы через shared/contracts.
 */

// ——— Listing (совместимо с backend CreateListingDto, ответы GET /listings, /search)
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
export type AppRole = "guest" | "host" | "admin";

export interface UserProfile {
  fullName?: string;
  avatarUrl?: string;
}

export interface UserContract {
  id: string;
  supabaseId?: string;
  email: string;
  role: AppRole;
  roles?: string[];
  profile?: UserProfile;
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
