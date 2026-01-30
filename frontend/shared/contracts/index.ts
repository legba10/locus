/**
 * LOCUS Shared Contracts
 * 
 * Единственный источник истины для типов между frontend и backend.
 * 
 * ПРАВИЛА:
 * 1. НЕ дублировать типы в других файлах
 * 2. НЕ удалять поля без согласования с UI
 * 3. Расширять типы через extends, а не переопределение
 */

// Re-export AppRole from roles.ts (source of truth)
export type { AppRole } from "../utils/roles";
import type { AppRole } from "../utils/roles";

// ═══════════════════════════════════════════════════════════════
// USER CONTRACT
// ═══════════════════════════════════════════════════════════════

export type UserProfile = {
  id?: string;
  name?: string;
  avatarUrl?: string;
};

/**
 * Единый контракт пользователя
 * 
 * Backend /auth/me возвращает этот тип
 * Frontend использует этот тип как базовый User
 */
export type UserContract = {
  id: string;
  email: string;
  role: AppRole;
  roles: AppRole[];
  supabaseId: string;
  profile?: UserProfile;
};

// ═══════════════════════════════════════════════════════════════
// REASON CONTRACT
// ═══════════════════════════════════════════════════════════════

export type ReasonType = "positive" | "warning" | "negative" | "neutral";

/**
 * Единый контракт причины AI-решения
 * 
 * UI принимает как string, так и Reason object
 */
export type Reason = {
  text: string;
  type: ReasonType;
};

/**
 * Тип для props компонентов, которые принимают reasons
 * Поддерживает как string[], так и Reason[]
 */
export type ReasonsInput = (string | Reason)[];

// ═══════════════════════════════════════════════════════════════
// LISTING CONTRACT
// ═══════════════════════════════════════════════════════════════

export type ListingBadge = "SUPERHOST" | "INSTANT_BOOK" | "NEW" | "AI_PICK";

export type ListingImage = {
  url: string;
  alt: string;
};

export type ListingAiScores = {
  qualityScore?: number | null;
  demandScore?: number | null;
  riskScore?: number | null;
  priceScore?: number | null;
};

/**
 * Базовый контракт листинга
 */
export type ListingContract = {
  id: string;
  title: string;
  city: string;
  pricePerNight: number;
  basePrice?: number;
  currency: "USD" | "EUR" | "RUB";
  rating: number;
  reviewCount: number;
  badges: ListingBadge[];
  images: ListingImage[];
  hostId: string;
  aiScores?: ListingAiScores;
  createdAt?: string;
};

export type DemandLevel = "low" | "medium" | "high";

/**
 * Листинг, обогащённый AI-данными
 */
export type EnrichedListingContract = ListingContract & {
  score: number;
  aiScore?: number;
  verdict: string;
  explanation: string;
  demandLevel: DemandLevel;
  district?: string;
  reasons: string[];
  aiReasons?: string[];
  priceDiff?: number;
  riskLevel?: "low" | "medium" | "high";
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS CONTRACTS
// ═══════════════════════════════════════════════════════════════

/**
 * Единый контракт props для ListingCard
 */
export type ListingCardPropsContract = {
  listing: ListingContract | EnrichedListingContract;
  className?: string;
};

/**
 * Decision block props
 */
export type DecisionBlockPropsContract = {
  score: number;
  verdict: string;
  reasons: ReasonsInput;
  demandLevel?: DemandLevel;
  priceDiff?: number;
  riskLevel?: "low" | "medium" | "high";
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Нормализует reasons в единый формат Reason[]
 */
export function normalizeReasons(
  input: ReasonsInput | undefined,
  getTypeFromText?: (text: string) => ReasonType
): Reason[] {
  if (!input) return [];
  
  return input.map((r) => {
    if (typeof r === "string") {
      return {
        text: r,
        type: getTypeFromText ? getTypeFromText(r) : "neutral",
      };
    }
    return r;
  });
}

/**
 * Проверяет, является ли листинг обогащённым
 */
export function isEnrichedListing(
  listing: ListingContract | EnrichedListingContract
): listing is EnrichedListingContract {
  return "score" in listing && "verdict" in listing;
}
