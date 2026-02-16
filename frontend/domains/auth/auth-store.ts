"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MeResponse, LoginRequest, RegisterRequest, UserRole } from "./auth-types";
import type { UserContract } from "@/shared/contracts";
import { AuthApiError, me as fetchMe, setSession } from "./auth-api";
import { supabase } from "@/shared/supabase-client";
import { clearTokens, getAccessToken, setTokens } from "@/shared/auth/token-storage";
import { getPrimaryRole, normalizeRole } from "@/shared/utils/roles";
import { logger } from "@/shared/utils/logger";
import type { User as DomainUser } from "@/shared/domain/user.model";
import { ActionDispatcher, FeatureFlags } from "@/shared/runtime";

/**
 * StoredUser — user object stored in zustand state
 * Extracted from MeResponse.user or created from session
 */
type StoredUser = UserContract & {
  email?: string;
  supabaseId?: string;
  roles?: UserRole[];
};

type AuthState = {
  user: StoredUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  initialize: () => Promise<void>;
  clearError: () => void;

  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
};

function userFromBackend(response: MeResponse, sessionEmail?: string | null): StoredUser {
  const payload = response as any;
  const role = normalizeRole(payload.role);
  const roles = [role];
  const profile = payload.profile;
  const name = (profile?.name ?? payload.full_name ?? "").trim();
  const avatar = profile?.avatar ?? payload.avatar_url ?? null;
  const phone = profile?.phone ?? payload.phone ?? null;
  return {
    id: payload.id,
    supabaseId: payload.id,
    email: payload.email ?? sessionEmail ?? "",
    phone,
    telegram_id: payload.telegram_id ?? null,
    username: payload.username ?? null,
    avatar_url: avatar,
    full_name: name || null,
    role: getPrimaryRole(roles),
    roles,
    tariff: payload.tariff ?? "free",
    plan: payload.plan,
    listingLimit: payload.listingLimit,
    listingUsed: payload.listingUsed,
    isAdmin: payload.isAdmin,
    profileCompleted: payload.profileCompleted,
    needsRoleSelection: payload.needsRoleSelection,
    profile_role_raw: payload.profile_role_raw ?? null,
  };
}

function toDomainUser(user: StoredUser | null): DomainUser | null {
  if (!user) return null;
  return {
    id: user.id,
    supabaseId: user.supabaseId ?? user.id, // fallback to id if supabaseId not set
    email: user.email,
    role: user.role as DomainUser["role"],
    roles: (user.roles ?? [user.role]) as DomainUser["roles"],
    tariff: user.tariff,
  };
}

async function dispatchAuth(type: "login" | "logout" | "register", user: StoredUser | null) {
  if (!FeatureFlags.isEnabled("REAL_AUTH_ENABLED")) return;
  try {
    await ActionDispatcher.dispatchAuth(type, toDomainUser(user));
  } catch (e) {
    logger.warn("Auth", "dispatchAuth failed", e);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email;
          const { data: authData, error } = await supabase.auth.signInWithPassword({
            email,
            password: data.password,
          });
          if (error) throw new AuthApiError(error.message, 401);
          const session = authData.session;
          if (!session) throw new AuthApiError("Нет сессии после входа", 401);

          const backendResponse = await setSession(session.access_token, session.refresh_token);
          const meUser = userFromBackend(backendResponse, session.user.email ?? null);
          set({
            user: meUser,
            accessToken: session.access_token,
            isLoading: false,
          });
          await dispatchAuth("login", meUser);
        } catch (e) {
          const msg = e instanceof AuthApiError ? e.message : "Ошибка входа";
          set({ isLoading: false, error: msg });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email;
          const { data: authData, error } = await supabase.auth.signUp({
            email,
            password: data.password,
            options: {
              data: {
                ...(data.name ? { full_name: data.name } : {}),
                role: data.role,
              },
            },
          });
          if (error) throw new AuthApiError(error.message, 400);
          let session = authData.session;
          if (!session) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password: data.password,
            });
            if (!signInError && signInData?.session) {
              session = signInData.session;
            }
          }
          if (session) {
            const backendResponse = await setSession(session.access_token, session.refresh_token);
            const meUser = userFromBackend(backendResponse, session.user.email ?? null);
            set({
              user: meUser,
              accessToken: session.access_token,
              isLoading: false,
              error: null,
            });
            await dispatchAuth("register", meUser);
          } else {
            set({
              user: null,
              accessToken: null,
              isLoading: false,
              error: null,
            });
          }
        } catch (e) {
          const msg = e instanceof AuthApiError ? e.message : "Ошибка регистрации";
          set({ isLoading: false, error: msg });
          throw e;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          /* ignore */
        }
        try {
          // Clear cookie-based sessions (Telegram)
          await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch {
          /* ignore */
        }
        const prevUser = get().user;
        clearTokens();
        set({ user: null, accessToken: null });
        await dispatchAuth("logout", prevUser);
      },

      refresh: async () => {
        const prevUser = get().user;
        try {
          const backendResponse = await fetchMe();
          const meUser = userFromBackend(backendResponse);
          const nextToken = getAccessToken();
          set({
            user: meUser,
            accessToken: nextToken ?? null,
          });
          return true;
        } catch (e) {
          if (e instanceof AuthApiError && e.status === 401) {
            // Not authenticated — do not show a scary error
            clearTokens();
            set({ user: null, accessToken: null, error: null });
            return false;
          }
          // Network/backend error: keep previous user to avoid "guest" flicker.
          set({ user: prevUser ?? null, error: "Временная ошибка синхронизации профиля" });
          return false;
        }
      },

      initialize: async () => {
        if (get().isInitialized) {
          return;
        }
        const prevUser = get().user;
        set({ isLoading: true, error: null });

        const AUTH_TIMEOUT_MS = 5000;
        const MAX_ATTEMPTS = 3;

        const runFetchMe = async (): Promise<MeResponse> => {
          const mePromise = fetchMe();
          const meTimeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("fetchMe timeout")), AUTH_TIMEOUT_MS)
          );
          return Promise.race([mePromise, meTimeout]);
        };

        let lastError: unknown;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            const backendResponse = await runFetchMe();
            const meUser = userFromBackend(backendResponse);
            set({
              user: meUser,
              accessToken: null,
              isLoading: false,
              isInitialized: true,
            });
            return;
          } catch (e) {
            lastError = e;
            if (attempt < MAX_ATTEMPTS) {
              await new Promise((r) => setTimeout(r, 800));
            }
          }
        }

        const isUnauthed = lastError instanceof AuthApiError && lastError.status === 401;
        if (!isUnauthed) {
          logger.error("Auth", "initialize error", lastError);
        }
        set({
          user: isUnauthed ? null : prevUser ?? null,
          accessToken: null,
          isLoading: false,
          isInitialized: true,
          error: isUnauthed ? null : null,
        });
        if (isUnauthed) {
          clearTokens();
        }
      },

      clearError: () => set({ error: null }),

      isAuthenticated: () => get().user !== null,

      hasRole: (role) => {
        const u = get().user;
        return u ? u.role === role || (u.roles ? u.roles.includes(role) : false) : false;
      },

      hasAnyRole: (roles) => {
        const u = get().user;
        if (!u) return false;
        if (roles.includes(u.role)) return true;
        const extra = u.roles ?? [];
        return roles.some((role) => extra.includes(role));
      },
    }),
    {
      name: "locus-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
