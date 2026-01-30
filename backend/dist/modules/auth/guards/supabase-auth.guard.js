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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../shared/lib/supabase");
const supabase_auth_service_1 = require("../supabase-auth.service");
let SupabaseAuthGuard = class SupabaseAuthGuard {
    constructor(supabaseAuth) {
        this.supabaseAuth = supabaseAuth;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers["authorization"];
        if (!authHeader)
            throw new common_1.UnauthorizedException("No token");
        const [scheme, rawToken] = authHeader.split(" ");
        const token = scheme?.toLowerCase() === "bearer" ? rawToken : undefined;
        if (!token)
            throw new common_1.UnauthorizedException("Invalid token");
        if (!supabase_1.supabase)
            throw new common_1.UnauthorizedException("Supabase not configured");
        const { data, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !data.user)
            throw new common_1.UnauthorizedException("Invalid token");
        const prismaUser = await this.supabaseAuth.syncUser({
            id: data.user.id,
            email: data.user.email ?? null,
            user_metadata: data.user.user_metadata,
            app_metadata: data.user.app_metadata,
        });
        const roleNames = prismaUser.roles.map((r) => r.role.name);
        const primaryRole = roleNames.includes("admin")
            ? "admin"
            : roleNames.includes("host")
                ? "host"
                : "guest";
        req.user = {
            id: prismaUser.id,
            supabaseId: data.user.id,
            email: data.user.email ?? prismaUser.email ?? "",
            role: primaryRole,
            roles: roleNames.length > 0 ? roleNames : [primaryRole],
        };
        return true;
    }
};
exports.SupabaseAuthGuard = SupabaseAuthGuard;
exports.SupabaseAuthGuard = SupabaseAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_auth_service_1.SupabaseAuthService])
], SupabaseAuthGuard);
