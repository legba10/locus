import { Injectable, Logger } from "@nestjs/common";
import { supabase } from "../../shared/lib/supabase";
import { ROOT_ADMIN_EMAIL } from "./constants";

/**
 * Supabase Profile — stored in Supabase public.profiles table
 * This is the SINGLE SOURCE OF TRUTH for user profiles and roles
 */
export type SupabaseProfile = {
  id: string;           // = auth.uid()
  email: string | null;
  phone: string | null;
  telegram_id: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  full_name: string | null;
  role: string | null;
  plan?: string | null;          // free | landlord_basic | landlord_pro
  listing_limit?: number | null; // 1 for FREE
  listing_used?: number | null;  // increment after create listing
  is_admin?: boolean | null;
  tariff: string | null;
  verification_status: "pending" | "verified" | null;
  created_at: string;
};

type SupabaseAuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type BusinessRole = "user" | "landlord";

@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);

  async ensureAdminFlag(profile: {
    id: string;
    email?: string | null;
    telegram_id?: string | null;
    is_admin?: boolean | null;
  }): Promise<boolean> {
    const rootEmail = (profile.email ?? "").trim().toLowerCase();
    if (rootEmail === ROOT_ADMIN_EMAIL.trim().toLowerCase()) {
      const sb = supabase;
      if (sb) {
        try {
          await sb
            .from("profiles")
            .upsert({ id: profile.id, is_admin: true }, { onConflict: "id" })
            .select("id, is_admin")
            .single();
        } catch {
          // ignore
        }
      }
      return true;
    }
    const adminTelegram = process.env.ADMIN_TELEGRAM_ID?.trim();
    if (!adminTelegram) return false;
    const isAdmin = String(profile.telegram_id ?? "") === adminTelegram;
    if (!isAdmin) return false;

    const sb = supabase;
    if (!sb) return true;

    try {
      await sb
        .from("profiles")
        .upsert({ id: profile.id, is_admin: true }, { onConflict: "id" })
        .select("id, is_admin")
        .single();
    } catch {
      // ignore
    }
    return true;
  }

  async ensureListingDefaults(userId: string) {
    const sb = supabase;
    if (!sb) return null;
    const { data: p, error } = await sb
      .from("profiles")
      .select("id, plan, listing_limit, listing_used")
      .eq("id", userId)
      .single();
    if (error) {
      // Columns might not exist yet in Supabase - keep backend resilient.
      return null;
    }
    const plan = (p as any)?.plan ?? null;
    const listingLimit = (p as any)?.listing_limit;
    const listingUsed = (p as any)?.listing_used;

    // If columns do not exist yet in Supabase, do nothing.
    if (p && (listingLimit == null || listingUsed == null || plan == null)) {
      const payload: any = { id: userId };
      if (plan == null) payload.plan = "free";
      if (listingLimit == null) payload.listing_limit = 1;
      if (listingUsed == null) payload.listing_used = 0;
      try {
        await sb.from("profiles").upsert(payload, { onConflict: "id" }).select().single();
      } catch {
        // ignore
      }
    }
    try {
      const { data: out } = await sb
        .from("profiles")
        .select("id, plan, listing_limit, listing_used")
        .eq("id", userId)
        .single();
      return out as any;
    } catch {
      return null;
    }
  }

  /**
   * Atomically reserve one listing slot by incrementing `listing_used` with optimistic concurrency.
   * Returns { usedBefore, usedAfter, limit } on success.
   */
  async reserveListingSlot(userId: string): Promise<{ usedBefore: number; usedAfter: number; limit: number } | null> {
    const sb = supabase;
    if (!sb) return null;

    // Ensure defaults exist
    await this.ensureListingDefaults(userId).catch(() => null);

    for (let i = 0; i < 3; i++) {
      const { data: p, error } = await sb
        .from("profiles")
        .select("listing_limit, listing_used")
        .eq("id", userId)
        .single();
      if (error || !p) return null;

      const limit = Number((p as any).listing_limit ?? 1);
      const usedBefore = Number((p as any).listing_used ?? 0);
      if (usedBefore >= limit) {
        return { usedBefore, usedAfter: usedBefore, limit };
      }

      const usedAfter = usedBefore + 1;
      const { data: updated, error: updErr } = await sb
        .from("profiles")
        .update({ listing_used: usedAfter })
        .eq("id", userId)
        .eq("listing_used", usedBefore)
        .select("listing_limit, listing_used")
        .single();

      if (!updErr && updated) {
        return { usedBefore, usedAfter, limit };
      }
    }

    return null;
  }

  /**
   * Recovery helper (rare):
   * If auth user exists but `public.profiles` row is missing, our normal lookup by profiles fails.
   * We use admin listUsers with a hard cap to find user id by email.
   */
  async findAuthUserIdByEmail(email: string): Promise<string | null> {
    // IMPORTANT: don't rely on narrowing imported live binding (`supabase`).
    // Assign to local const to satisfy TypeScript and avoid "possibly null" on Railway build.
    const sb = supabase;
    if (!sb) return null;
    const target = (email ?? "").toLowerCase().trim();
    if (!target) return null;

    // Hard cap: 5 pages × 200 = 1000 users scanned max (only on error path).
    const perPage = 200;
    const maxPages = 5;
    for (let page = 1; page <= maxPages; page++) {
      const { data, error } = await (sb as any).auth.admin.listUsers({ page, perPage });
      if (error || !data?.users) return null;
      const users: Array<{ id: string; email?: string | null }> = data.users;
      const found = users.find((u) => (u.email ?? "").toLowerCase() === target);
      if (found?.id) return found.id;
      if (users.length < perPage) break; // no more pages
    }
    return null;
  }

  /**
   * Map Supabase profile.role to business role
   */
  private mapToBusinessRole(profileRole: string | null): BusinessRole {
    if (!profileRole) return "user";
    const role = profileRole.toLowerCase();

    if (role === "landlord") return "landlord";
    if (role === "renter") return "user";
    if (role === "admin") return "landlord";
    return "user";
  }

  /**
   * Upsert profile in Supabase public.profiles table
   * Called after every successful auth
   */
  async upsertProfile(user: SupabaseAuthUser, telegramId?: string): Promise<SupabaseProfile | null> {
    // IMPORTANT: don't rely on narrowing imported live binding (`supabase`).
    const sb = supabase;
    if (!sb) {
      this.logger.error("Supabase client not configured");
      return null;
    }

    const md = user.user_metadata ?? {};
    const profileData: Record<string, unknown> = {
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      telegram_id: telegramId ?? (md as any)?.telegram_id ?? null,
      full_name: (md as any)?.full_name ?? null,
      // role is NOT set on upsert - it's managed by admin or defaults to 'user'
    };

    const username = (md as any)?.username;
    const firstName = (md as any)?.first_name;
    const lastName = (md as any)?.last_name;
    const avatarUrl = (md as any)?.photo_url ?? (md as any)?.avatar_url;

    let finalUsername: string | null = null;
    if (typeof username === "string" && username.length > 0) {
      finalUsername = username.startsWith("@") ? username : `@${username}`;
    } else if (typeof firstName === "string" && firstName.length > 0) {
      finalUsername = firstName;
    } else {
      // Fallback username, e.g. for pure Telegram/anonymous signups
      finalUsername = `user_${user.id.slice(0, 6)}`;
    }

    profileData.username = finalUsername;
    if (!profileData.full_name) {
      profileData.full_name = finalUsername;
    }
    if (typeof firstName === "string" && firstName.length > 0) profileData.first_name = firstName;
    if (typeof lastName === "string" && lastName.length > 0) profileData.last_name = lastName;
    if (typeof avatarUrl === "string" && avatarUrl.length > 0) profileData.avatar_url = avatarUrl;

    this.logger.debug(`Upserting profile for user ${user.id}`);

    const tryUpsert = async (payload: Record<string, unknown>) => {
      return sb
        .from("profiles")
        .upsert(payload, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select()
        .single();
    };

    const { data, error } = await tryUpsert(profileData);

    if (error) {
      // Common production issue: optional columns not migrated (schema cache / missing column)
      const msg = error.message ?? "";
      const missingColMatch = msg.match(/Could not find the '([^']+)' column/i);
      const missingCol = missingColMatch?.[1]?.toLowerCase();
      const optionalCols = new Set(["username", "first_name", "last_name", "avatar_url"]);

      if (missingCol && optionalCols.has(missingCol)) {
        this.logger.warn(`Profile upsert failed due to missing column '${missingCol}'. Retrying without optional fields.`);
        const minimal: Record<string, unknown> = {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
          telegram_id: telegramId ?? (md as any)?.telegram_id ?? null,
          full_name: (md as any)?.full_name ?? null,
        };
        const retry = await tryUpsert(minimal);
        if (!retry.error && retry.data) return retry.data as SupabaseProfile;
      }

      this.logger.error(`Failed to upsert profile: ${msg}`);
      // If upsert failed, try to fetch existing profile
      const { data: existing } = await sb.from("profiles").select("*").eq("id", user.id).single();
      return existing as SupabaseProfile | null;
    }

    return data as SupabaseProfile;
  }

  /**
   * Get profile from Supabase
   */
  async getProfile(userId: string): Promise<SupabaseProfile | null> {
    if (!supabase) {
      this.logger.error("Supabase client not configured");
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      this.logger.warn(`Profile not found for user ${userId}: ${error.message}`);
      return null;
    }

    return data as SupabaseProfile;
  }

  /**
   * Update profile fields in Supabase
   */
  async updateProfile(
    userId: string,
    patch: { full_name?: string | null; phone?: string | null; telegram_id?: string | null; role?: string | null; avatar_url?: string | null }
  ): Promise<SupabaseProfile | null> {
    if (!supabase) {
      this.logger.error("Supabase client not configured");
      return null;
    }

    const payload: Record<string, unknown> = { id: userId };
    if (patch.full_name !== undefined) payload.full_name = patch.full_name;
    if (patch.phone !== undefined) payload.phone = patch.phone;
    if (patch.telegram_id !== undefined) payload.telegram_id = patch.telegram_id;
    if (patch.role !== undefined) payload.role = patch.role;
    if (patch.avatar_url !== undefined) payload.avatar_url = patch.avatar_url;

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      this.logger.error(`Failed to update profile: ${error.message}`);
      return null;
    }

    return data as SupabaseProfile;
  }

  /**
   * Sync user after Supabase auth validation
   * 1. Upsert profile in Supabase
   * 2. Return user info with role from profile
   */
  async syncUser(supabaseUser: SupabaseAuthUser, telegramId?: string): Promise<{
    id: string;
    supabaseId: string;
    email: string;
    phone: string | null;
    role: BusinessRole;
    roles: string[];
    profile: SupabaseProfile | null;
  }> {
    // Upsert profile in Supabase
    const profile = await this.upsertProfile(supabaseUser, telegramId);
    
    // Get role from profile (or default to guest)
    const role = this.mapToBusinessRole(profile?.role ?? null);

    return {
      id: supabaseUser.id,           // Use Supabase ID as primary
      supabaseId: supabaseUser.id,
      email: supabaseUser.email ?? profile?.email ?? "",
      phone: supabaseUser.phone ?? profile?.phone ?? null,
      role,
      roles: [role],                 // Single role for now
      profile,
    };
  }

  /**
   * Ensure Supabase user for Telegram login (by telegram_id or phone)
   */
  async ensureTelegramUser(session: {
    phoneNumber: string;
    telegramUserId: bigint;
    username: string | null;
    firstName: string | null;
  }): Promise<{ id: string; email: string | null }> {
    if (!supabase) {
      throw new Error("Auth service unavailable");
    }

    const telegramId = String(session.telegramUserId);
    const phone = session.phoneNumber.startsWith("+") ? session.phoneNumber : `+${session.phoneNumber}`;
    const fullName = session.firstName ?? `User ${telegramId}`;
    const email = `telegram_${telegramId}@locus.app`;

    let supabaseUser: { id: string; email: string | null } | null = null;

    // Check existing by telegram_id in profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("telegram_id", telegramId)
      .single();

    if (existingProfile) {
      const { data: userData } = await supabase.auth.admin.getUserById(existingProfile.id);
      if (userData?.user) {
        supabaseUser = { id: userData.user.id, email: userData.user.email ?? null };
      }
    }

    // Check existing by phone
    if (!supabaseUser) {
      const { data: phoneProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("phone", phone)
        .single();

      if (phoneProfile?.id) {
        const { data: userData } = await supabase.auth.admin.getUserById(phoneProfile.id);
        if (userData?.user) {
          supabaseUser = { id: userData.user.id, email: userData.user.email ?? phoneProfile.email ?? null };
        } else {
          // Fallback: still use profile id (profile references auth.users)
          supabaseUser = { id: phoneProfile.id, email: phoneProfile.email ?? null };
        }

        await supabase.from("profiles").upsert(
          {
            id: phoneProfile.id,
            telegram_id: telegramId,
            full_name: fullName,
            phone,
          },
          { onConflict: "id" }
        );
      }
    }

    // Create new user
    if (!supabaseUser) {
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        phone,
        phone_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          full_name: fullName,
          username: session.username,
          first_name: session.firstName ?? null,
          auth_provider: "telegram",
        },
      });

      if (createError) {
        if (createError.message.includes("already exists")) {
          const { data: existingProfileByEmail } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("email", email)
            .single();
          const { data: existingProfileByPhone } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("phone", phone)
            .single();
          const p = existingProfileByEmail ?? existingProfileByPhone;
          if (p?.id) {
            supabaseUser = { id: p.id, email: p.email ?? null };
          }

          // Recovery: auth.user exists but profiles row is missing
          if (!supabaseUser) {
            const recoveredId = await this.findAuthUserIdByEmail(email);
            if (recoveredId) {
              supabaseUser = { id: recoveredId, email };
              await this.upsertProfile(
                {
                  id: recoveredId,
                  email,
                  phone,
                  user_metadata: {
                    telegram_id: telegramId,
                    full_name: fullName,
                    username: session.username,
                    first_name: session.firstName ?? null,
                    auth_provider: "telegram_recover",
                  },
                },
                telegramId
              );
            }
          }
        }
        if (!supabaseUser) {
          this.logger.error(`Create user failed: ${createError.message}`);
          throw new Error("Failed to create user");
        }
      } else if (createData?.user) {
        supabaseUser = { id: createData.user.id, email: createData.user.email ?? null };
        await this.upsertProfile(
          {
            id: createData.user.id,
            email: createData.user.email ?? null,
            phone,
            user_metadata: createData.user.user_metadata,
          },
          telegramId
        );
      }
    }

    if (!supabaseUser) {
      throw new Error("Failed to get or create user");
    }

    return supabaseUser;
  }

  /**
   * Generate magiclink token hash for a user email
   */
  async generateMagicLinkToken(email: string): Promise<string> {
    if (!supabase) {
      throw new Error("Auth service unavailable");
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    const tokenHash =
      (linkData as { properties?: { hashed_token?: string }; hashed_token?: string })?.properties?.hashed_token ??
      (linkData as { hashed_token?: string })?.hashed_token;

    if (linkError || !tokenHash) {
      this.logger.error(`Generate link failed: ${linkError?.message}`);
      throw new Error("Failed to generate session");
    }

    return tokenHash;
  }

  /**
   * Verify magiclink token hash and return Supabase session
   */
  async verifyOtpToken(tokenHash: string) {
    if (!supabase) {
      throw new Error("Auth service unavailable");
    }
    return supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });
  }

  /**
   * Refresh Supabase session using refresh token
   */
  async refreshSession(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    if (!supabase) {
      throw new Error("Auth service unavailable");
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data?.session) {
      throw new Error(error?.message ?? "Failed to refresh session");
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  /**
   * Check if user is landlord
   */
  async isLandlord(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile?.role === "landlord";
  }
}
