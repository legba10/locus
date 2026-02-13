"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MeResponse, LoginRequest, RegisterRequest, UserRole } from "./auth-types";
import type { UserContract } from "@/shared/contracts";
import { AuthApiError, me as fetchMe } from "./auth-api";
import { supabase } from "@/shared/supabase-client";
import { clearTokens, getAccessToken, setTokens } from "@/shared/auth/token-storage";
import { getApiUrl } from "@/shared/config/api";
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
          const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
          if (error) throw new AuthApiError(error.message, 401);
          const session = authData.session;
          if (!session) throw new AuthApiError("Нет сессии после входа", 401);

          setTokens(session.access_token, session.refresh_token);
          const backendResponse = await fetchMe();
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
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                ...(data.name ? { full_name: data.name } : {}),
                role: data.role,
              },
            },
          });
          if (error) throw new AuthApiError(error.message, 400);
          const session = authData.session;
          if (session) {
            setTokens(session.access_token, session.refresh_token);
            const backendResponse = await fetchMe();
            const meUser = userFromBackend(backendResponse, session.user.email ?? null);
            set({
              user: meUser,
              accessToken: session.access_token,
              isLoading: false,
            });
            await dispatchAuth("register", meUser);
          } else {
            // No session = email confirmation required
            set({
              user: {
                id: "",
                supabaseId: "",
                email: data.email,
                phone: null,
                telegram_id: null,
                full_name: data.name ?? null,
                role: data.role,
                roles: [data.role],
                tariff: "free",
              },
              accessToken: null,
              isLoading: false,
            });
            await dispatchAuth("register", {
              id: "",
              supabaseId: "",
              email: data.email,
              phone: null,
              telegram_id: null,
              full_name: data.name ?? null,
              role: data.role,
              roles: [data.role],
              tariff: "free",
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

      /** TZ-3: проверка сессии ОДИН РАЗ. Без refresh в цикле, без ретраев. */
      initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true, error: null });

        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.access_token && data?.session?.refresh_token) {
            setTokens(data.session.access_token, data.session.refresh_token);
          }
        } catch {
          /* ignore */
        }

        try {
          const url = getApiUrl("/api/auth/me");
          const token = getAccessToken();
          const res = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (res.ok) {
            const data = (await res.json()) as MeResponse;
            const meUser = userFromBackend(data);
            set({
              user: meUser,
              accessToken: getAccessToken() ?? null,
              isLoading: false,
              isInitialized: true,
            });
            return;
          }
          if (res.status === 401) {
            clearTokens();
          }
        } catch (e) {
          logger.error("Auth", "checkSession error", e);
        }

        set({
          user: null,
          accessToken: null,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
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
