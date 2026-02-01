"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MeResponse, LoginRequest, RegisterRequest, UserRole } from "./auth-types";
import type { UserContract } from "@/shared/contracts";
import { AuthApiError, me as fetchMe } from "./auth-api";
import { supabase } from "@/shared/supabase-client";
import { getPrimaryRole, normalizeRole } from "@/shared/utils/roles";
import { logger } from "@/shared/utils/logger";
import type { User as DomainUser } from "@/shared/domain/user.model";
import { ActionDispatcher, FeatureFlags } from "@/shared/runtime";

/**
 * StoredUser — user object stored in zustand state
 * Extracted from MeResponse.user or created from session
 */
type StoredUser = UserContract;

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

function userFromSession(session: { user: { id: string; email?: string | null } }): StoredUser {
  const u = session.user;
  return {
    id: u.id,
    supabaseId: u.id,
    email: u.email ?? "",
    role: "guest",
    roles: ["guest"],
  };
}

function userFromBackend(response: MeResponse): StoredUser {
  const payload = response.user;
  const backendRoles = payload.roles && payload.roles.length > 0 ? payload.roles : [payload.role];
  const roles = backendRoles.map((role) => normalizeRole(role));
  return {
    id: payload.id,
    supabaseId: payload.supabaseId,
    email: payload.email ?? "",
    role: getPrimaryRole(backendRoles),
    roles,
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
          
          let meUser: StoredUser | null = null;
          try {
            const backendResponse = await fetchMe();
            meUser = userFromBackend(backendResponse);
          } catch (e) {
            logger.warn("Auth", "fetchMe failed after login, using session", e);
            meUser = null;
          }
          
          set({
            user: meUser ?? userFromSession(session),
            accessToken: session.access_token,
            isLoading: false,
          });
          await dispatchAuth("login", meUser ?? userFromSession(session));
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
            let meUser: StoredUser | null = null;
            try {
              const backendResponse = await fetchMe();
              meUser = userFromBackend(backendResponse);
            } catch {
              meUser = null;
            }
            set({
              user: meUser ?? userFromSession(session),
              accessToken: session.access_token,
              isLoading: false,
            });
            await dispatchAuth("register", meUser ?? userFromSession(session));
          } else {
            // No session = email confirmation required
            set({
              user: { id: "", supabaseId: "", email: data.email, role: data.role, roles: [data.role] },
              accessToken: null,
              isLoading: false,
            });
            await dispatchAuth("register", { id: "", supabaseId: "", email: data.email, role: data.role, roles: [data.role] });
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
        const prevUser = get().user;
        set({ user: null, accessToken: null });
        await dispatchAuth("logout", prevUser);
      },

      refresh: async () => {
        try {
          const { data: d } = await supabase.auth.getSession();
          const session = d?.session;
          if (!session) {
            set({ user: null, accessToken: null });
            return false;
          }
          let meUser: StoredUser | null = null;
          try {
            const backendResponse = await fetchMe();
            meUser = userFromBackend(backendResponse);
          } catch {
            meUser = null;
          }
          set({
            user: meUser ?? userFromSession(session),
            accessToken: session.access_token,
          });
          return true;
        } catch {
          set({ user: null, accessToken: null });
          return false;
        }
      },

      initialize: async () => {
        if (get().isInitialized) {
          return;
        }
        set({ isLoading: true });
        
        try {
          // Timeout for getSession (3s max)
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("getSession timeout")), 3000)
          );
          
          let sessionData;
          try {
            const { data: d } = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: unknown } };
            sessionData = d;
          } catch (e) {
            logger.warn('Auth', 'getSession timeout/error', e);
            set({ user: null, accessToken: null, isLoading: false, isInitialized: true });
            return;
          }
          
          const session = sessionData?.session as { user: { id: string; email?: string | null }; access_token: string } | null;
          if (!session) {
            set({ user: null, accessToken: null, isLoading: false, isInitialized: true });
            return;
          }
          
          let meUser: StoredUser | null = null;
          
          try {
            // Timeout for fetchMe (3s max) - non-blocking
            const mePromise = fetchMe();
            const meTimeout = new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error("fetchMe timeout")), 3000)
            );
            
            const backendResponse = await Promise.race([mePromise, meTimeout]);
            meUser = userFromBackend(backendResponse);
          } catch (e) {
            logger.warn('Auth', 'fetchMe failed (using session data)', e);
            meUser = null;
          }
          
          set({
            user: meUser ?? userFromSession(session),
            accessToken: session.access_token,
            isLoading: false,
            isInitialized: true,
          });
        } catch (e) {
          logger.error('Auth', 'initialize error', e);
          set({ user: null, accessToken: null, isLoading: false, isInitialized: true });
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
