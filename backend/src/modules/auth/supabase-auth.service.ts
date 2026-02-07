import { Injectable, Logger } from "@nestjs/common";
import { supabase } from "../../shared/lib/supabase";

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
    if (!supabase) {
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

    if (typeof username === "string" && username.length > 0) {
      profileData.username = username.startsWith("@") ? username : `@${username}`;
    }
    if (typeof firstName === "string" && firstName.length > 0) profileData.first_name = firstName;
    if (typeof lastName === "string" && lastName.length > 0) profileData.last_name = lastName;
    if (typeof avatarUrl === "string" && avatarUrl.length > 0) profileData.avatar_url = avatarUrl;

    this.logger.debug(`Upserting profile for user ${user.id}`);

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData, { 
        onConflict: "id",
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to upsert profile: ${error.message}`);
      // If upsert failed, try to fetch existing profile
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
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
    patch: { full_name?: string | null; phone?: string | null; telegram_id?: string | null; role?: string | null }
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
