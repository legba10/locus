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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthTelegramController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTelegramController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const supabase_1 = require("../../shared/lib/supabase");
const supabase_auth_service_1 = require("./supabase-auth.service");
const crypto_1 = require("crypto");
const SESSION_TTL_MS = 5 * 60 * 1000;
let AuthTelegramController = AuthTelegramController_1 = class AuthTelegramController {
    constructor(prisma, supabaseAuth) {
        this.prisma = prisma;
        this.supabaseAuth = supabaseAuth;
        this.logger = new common_1.Logger(AuthTelegramController_1.name);
    }
    async start() {
        if (process.env.TELEGRAM_ENABLED !== "true") {
            throw new common_1.BadRequestException("Telegram login is disabled");
        }
        const loginToken = (0, crypto_1.randomUUID)();
        await this.prisma.telegramAuthSession.create({
            data: {
                loginToken,
                status: "PENDING",
            },
        });
        this.logger.log(`Telegram auth started: ${loginToken}`);
        return { loginToken };
    }
    async status(token) {
        if (!token) {
            throw new common_1.BadRequestException("Token is required");
        }
        const session = await this.prisma.telegramAuthSession.findUnique({
            where: { loginToken: token },
        });
        if (!session) {
            return { authenticated: false, status: "not_found" };
        }
        const age = Date.now() - session.createdAt.getTime();
        if (age > SESSION_TTL_MS) {
            await this.prisma.telegramAuthSession
                .update({
                where: { loginToken: token },
                data: { status: "EXPIRED" },
            })
                .catch(() => { });
            return { authenticated: false, status: "expired" };
        }
        if (session.status !== "CONFIRMED") {
            return { authenticated: false, status: session.status.toLowerCase() };
        }
        if (!session.phoneNumber) {
            throw new common_1.BadRequestException("Phone number not confirmed");
        }
        if (!session.telegramUserId) {
            throw new common_1.BadRequestException("Telegram user ID not confirmed");
        }
        const phoneNumber = session.phoneNumber;
        const telegramUserId = session.telegramUserId;
        try {
            const { userId, tokenHash } = await this.createOrFindSupabaseUser({
                phoneNumber,
                telegramUserId,
                username: session.username,
                firstName: session.firstName,
            });
            if (!tokenHash) {
                throw new common_1.InternalServerErrorException("Failed to generate session");
            }
            await this.prisma.telegramAuthSession.delete({ where: { loginToken: token } }).catch(() => { });
            return {
                authenticated: true,
                tokenHash,
                supabaseToken: tokenHash,
                user: { id: userId },
            };
        }
        catch (error) {
            this.logger.error(`Telegram auth completion error: ${error}`);
            throw error;
        }
    }
    async createOrFindSupabaseUser(session) {
        if (!supabase_1.supabase) {
            throw new common_1.InternalServerErrorException("Auth service unavailable");
        }
        const telegramId = String(session.telegramUserId);
        const phone = session.phoneNumber.startsWith("+") ? session.phoneNumber : `+${session.phoneNumber}`;
        const fullName = session.firstName ?? `User ${telegramId}`;
        const email = `telegram_${telegramId}@locus.app`;
        let supabaseUser = null;
        const { data: existingProfile } = await supabase_1.supabase
            .from("profiles")
            .select("id, email")
            .eq("telegram_id", telegramId)
            .single();
        if (existingProfile) {
            const { data: userData } = await supabase_1.supabase.auth.admin.getUserById(existingProfile.id);
            if (userData?.user) {
                supabaseUser = { id: userData.user.id, email: userData.user.email ?? null };
            }
        }
        if (!supabaseUser) {
            const { data: usersByPhone } = await supabase_1.supabase.auth.admin.listUsers();
            const byPhone = usersByPhone?.users?.find((u) => u.phone === phone);
            if (byPhone) {
                supabaseUser = { id: byPhone.id, email: byPhone.email ?? null };
                await supabase_1.supabase.from("profiles").upsert({
                    id: byPhone.id,
                    telegram_id: telegramId,
                    full_name: fullName,
                    phone,
                }, { onConflict: "id" });
            }
        }
        if (!supabaseUser) {
            const { data: createData, error: createError } = await supabase_1.supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                phone,
                phone_confirm: true,
                user_metadata: {
                    telegram_id: telegramId,
                    full_name: fullName,
                    username: session.username,
                    auth_provider: "telegram",
                },
            });
            if (createError) {
                if (createError.message.includes("already exists")) {
                    const { data: list } = await supabase_1.supabase.auth.admin.listUsers();
                    const existing = list?.users?.find((u) => u.email === email || u.phone === phone);
                    if (existing) {
                        supabaseUser = { id: existing.id, email: existing.email ?? null };
                    }
                }
                if (!supabaseUser) {
                    this.logger.error(`Create user failed: ${createError.message}`);
                    throw new common_1.InternalServerErrorException("Failed to create user");
                }
            }
            else if (createData?.user) {
                supabaseUser = { id: createData.user.id, email: createData.user.email ?? null };
                await this.supabaseAuth.upsertProfile({
                    id: createData.user.id,
                    email: createData.user.email ?? null,
                    phone,
                    user_metadata: createData.user.user_metadata,
                }, telegramId);
            }
        }
        if (!supabaseUser) {
            throw new common_1.InternalServerErrorException("Failed to get or create user");
        }
        const { data: linkData, error: linkError } = await supabase_1.supabase.auth.admin.generateLink({
            type: "magiclink",
            email: supabaseUser.email ?? email,
        });
        const tokenHash = linkData?.properties?.hashed_token ??
            linkData?.hashed_token;
        if (linkError || !tokenHash) {
            this.logger.error(`Generate link failed: ${linkError?.message}`);
            throw new common_1.InternalServerErrorException("Failed to generate session");
        }
        return {
            userId: supabaseUser.id,
            tokenHash,
        };
    }
};
exports.AuthTelegramController = AuthTelegramController;
__decorate([
    (0, common_1.Post)("start"),
    (0, swagger_1.ApiOperation)({ summary: "Start Telegram login - returns loginToken for bot" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthTelegramController.prototype, "start", null);
__decorate([
    (0, common_1.Get)("status"),
    (0, swagger_1.ApiOperation)({ summary: "Check Telegram login status - returns session when CONFIRMED" }),
    (0, swagger_1.ApiQuery)({ name: "token", required: true }),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthTelegramController.prototype, "status", null);
exports.AuthTelegramController = AuthTelegramController = AuthTelegramController_1 = __decorate([
    (0, swagger_1.ApiTags)("auth"),
    (0, common_1.Controller)("auth/telegram"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_auth_service_1.SupabaseAuthService])
], AuthTelegramController);
//# sourceMappingURL=auth-telegram.controller.js.map