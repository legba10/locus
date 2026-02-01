import type { AppRole, UserContract, UserProfile } from "@/shared/contracts";

export type UserRole = AppRole;
export type { UserProfile };

/**
 * MeResponse — контракт backend /auth/me
 * Backend returns: { ok: true, user: UserContract }
 */
export type MeResponse = {
  ok: boolean;
  user: UserContract;
};

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
