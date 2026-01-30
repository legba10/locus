import type { UserContract, AppRole, UserProfile } from "@/shared/contracts";

export type UserId = string;
export type UserRole = AppRole;

/**
 * User = UserContract
 * Единый тип пользователя
 */
export type User = UserContract;
export type { UserProfile };

