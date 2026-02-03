"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SupabaseAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../shared/lib/supabase");
const supabase_auth_service_1 = require("../supabase-auth.service");
let SupabaseAuthGuard = SupabaseAuthGuard_1 = class SupabaseAuthGuard {
    constructor(supabaseAuth) {
        this.supabaseAuth = supabaseAuth;
        this.logger = new common_1.Logger(SupabaseAuthGuard_1.name);
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            throw new common_1.UnauthorizedException("No authorization header");
        }
        const [scheme, rawToken] = authHeader.split(" ");
        const token = scheme?.toLowerCase() === "bearer" ? rawToken : undefined;
        if (!token) {
            throw new common_1.UnauthorizedException("Invalid authorization format. Use: Bearer <token>");
        }
        if (!supabase_1.supabase) {
            this.logger.error("Supabase client not configured");
            throw new common_1.UnauthorizedException("Auth service unavailable");
        }
        const { data, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !data.user) {
            this.logger.warn(`Token validation failed: ${error?.message ?? "No user"}`);
            throw new common_1.UnauthorizedException("Invalid or expired token");
        }
        const telegramId = data.user.user_metadata?.telegram_id;
        const userInfo = await this.supabaseAuth.syncUser({
            id: data.user.id,
            email: data.user.email ?? null,
            phone: data.user.phone ?? null,
            user_metadata: data.user.user_metadata,
        }, telegramId);
        req.user = {
            id: userInfo.id,
            supabaseId: userInfo.supabaseId,
            email: userInfo.email,
            phone: userInfo.phone,
            role: userInfo.role,
            roles: userInfo.roles,
        };
        this.logger.debug(`Authenticated user: ${userInfo.email} (role: ${userInfo.role})`);
        return true;
    }
};
exports.SupabaseAuthGuard = SupabaseAuthGuard;
exports.SupabaseAuthGuard = SupabaseAuthGuard = SupabaseAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_auth_service_1.SupabaseAuthService])
], SupabaseAuthGuard);
//# sourceMappingURL=supabase-auth.guard.js.map