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
exports.SupabaseAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SupabaseAuthService = class SupabaseAuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeRole(value) {
        if (!value)
            return null;
        const role = String(value).toLowerCase();
        if (role === "guest" || role === "host" || role === "admin")
            return role;
        return null;
    }
    resolveRole(supabaseUser) {
        const metaRole = this.normalizeRole(supabaseUser.user_metadata?.role) ??
            this.normalizeRole(supabaseUser.app_metadata?.role) ??
            this.normalizeRole(supabaseUser.user_metadata?.app_role) ??
            this.normalizeRole(supabaseUser.app_metadata?.app_role);
        return metaRole ?? "guest";
    }
    async ensureRole(name) {
        return this.prisma.role.upsert({
            where: { name },
            update: {},
            create: { name, description: `${name} role` },
        });
    }
    async attachDefaultRole(userId, roleName) {
        const role = await this.ensureRole(roleName);
        await this.prisma.userRole.create({
            data: { userId, roleId: role.id },
        });
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: { include: { role: true } } },
        });
    }
    async syncUser(supabaseUser) {
        const email = supabaseUser.email ?? undefined;
        const emailUpdate = email ? { email } : {};
        const defaultRole = this.resolveRole(supabaseUser);
        const existingBySupabase = await this.prisma.user.findUnique({
            where: { supabaseId: supabaseUser.id },
            include: { roles: { include: { role: true } } },
        });
        if (existingBySupabase) {
            if (email && existingBySupabase.email !== email) {
                const updated = await this.prisma.user.update({
                    where: { id: existingBySupabase.id },
                    data: { ...emailUpdate },
                    include: { roles: { include: { role: true } } },
                });
                if (updated.roles.length > 0)
                    return updated;
                const withRole = await this.attachDefaultRole(updated.id, defaultRole);
                return withRole ?? updated;
            }
            if (existingBySupabase.roles.length > 0)
                return existingBySupabase;
            const withRole = await this.attachDefaultRole(existingBySupabase.id, defaultRole);
            return withRole ?? existingBySupabase;
        }
        if (email) {
            const existingByEmail = await this.prisma.user.findUnique({
                where: { email },
                include: { roles: { include: { role: true } } },
            });
            if (existingByEmail) {
                const updated = await this.prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: { supabaseId: supabaseUser.id },
                    include: { roles: { include: { role: true } } },
                });
                if (updated.roles.length > 0)
                    return updated;
                const withRole = await this.attachDefaultRole(updated.id, defaultRole);
                return withRole ?? updated;
            }
        }
        const created = await this.prisma.user.create({
            data: {
                supabaseId: supabaseUser.id,
                email: email ?? null,
                roles: {
                    create: {
                        role: {
                            connectOrCreate: {
                                where: { name: defaultRole },
                                create: { name: defaultRole, description: `${defaultRole} role` },
                            },
                        },
                    },
                },
            },
            include: { roles: { include: { role: true } } },
        });
        return created;
    }
};
exports.SupabaseAuthService = SupabaseAuthService;
exports.SupabaseAuthService = SupabaseAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupabaseAuthService);
