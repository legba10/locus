"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SupabaseAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseAuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../shared/lib/supabase");
let SupabaseAuthService = SupabaseAuthService_1 = class SupabaseAuthService {
    constructor() {
        this.logger = new common_1.Logger(SupabaseAuthService_1.name);
    }
    mapToBusinessRole(profileRole) {
        if (!profileRole)
            return "guest";
        const role = profileRole.toLowerCase();
        if (role === "admin")
            return "admin";
        if (role === "landlord" || role === "manager")
            return "host";
        return "guest";
    }
    async upsertProfile(user, telegramId) {
        if (!supabase_1.supabase) {
            this.logger.error("Supabase client not configured");
            return null;
        }
        const profileData = {
            id: user.id,
            email: user.email ?? null,
            phone: user.phone ?? null,
            telegram_id: telegramId ?? user.user_metadata?.telegram_id ?? null,
            full_name: user.user_metadata?.full_name ?? null,
        };
        this.logger.debug(`Upserting profile for user ${user.id}`);
        const { data, error } = await supabase_1.supabase
            .from("profiles")
            .upsert(profileData, {
            onConflict: "id",
            ignoreDuplicates: false
        })
            .select()
            .single();
        if (error) {
            this.logger.error(`Failed to upsert profile: ${error.message}`);
            const { data: existing } = await supabase_1.supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            return existing;
        }
        return data;
    }
    async getProfile(userId) {
        if (!supabase_1.supabase) {
            this.logger.error("Supabase client not configured");
            return null;
        }
        const { data, error } = await supabase_1.supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        if (error) {
            this.logger.warn(`Profile not found for user ${userId}: ${error.message}`);
            return null;
        }
        return data;
    }
    async syncUser(supabaseUser, telegramId) {
        const profile = await this.upsertProfile(supabaseUser, telegramId);
        const role = this.mapToBusinessRole(profile?.role ?? null);
        return {
            id: supabaseUser.id,
            supabaseId: supabaseUser.id,
            email: supabaseUser.email ?? profile?.email ?? "",
            phone: supabaseUser.phone ?? profile?.phone ?? null,
            role,
            roles: [role],
            profile,
        };
    }
    async isAdmin(userId) {
        const profile = await this.getProfile(userId);
        return profile?.role === "admin";
    }
};
exports.SupabaseAuthService = SupabaseAuthService;
exports.SupabaseAuthService = SupabaseAuthService = SupabaseAuthService_1 = __decorate([
    (0, common_1.Injectable)()
], SupabaseAuthService);
//# sourceMappingURL=supabase-auth.service.js.map