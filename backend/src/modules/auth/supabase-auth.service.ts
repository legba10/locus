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
  full_name: string | null;
  role: "user" | "landlord" | "manager" | "admin";
  created_at: string;
};

type SupabaseAuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type BusinessRole = "guest" | "host" | "admin";

@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);

  /**
   * Map Supabase profile.role to business role
   */
  private mapToBusinessRole(profileRole: string | null): BusinessRole {
    if (!profileRole) return "guest";
    const role = profileRole.toLowerCase();
    
    // admin → admin
    if (role === "admin") return "admin";
    
    // landlord/manager → host (can manage listings)
    if (role === "landlord" || role === "manager") return "host";
    
    // user → guest
    return "guest";
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

    const profileData = {
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      telegram_id: telegramId ?? (user.user_metadata?.telegram_id as string) ?? null,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      // role is NOT set on upsert - it's managed by admin or defaults to 'user'
    };

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
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile?.role === "admin";
  }
}
