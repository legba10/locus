import type { AppRole, UserContract, UserProfile } from "@/shared/contracts";

export type UserRole = AppRole;
export type { UserProfile };

/**
 * MeResponse = UserContract
 * Единый контракт между backend /auth/me и frontend
 */
export type MeResponse = UserContract;

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
};
