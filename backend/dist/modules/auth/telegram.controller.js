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
var TelegramAuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const crypto_1 = require("crypto");
const supabase_1 = require("../../shared/lib/supabase");
const supabase_auth_service_1 = require("./supabase-auth.service");
let TelegramAuthController = TelegramAuthController_1 = class TelegramAuthController {
    constructor(supabaseAuth) {
        this.supabaseAuth = supabaseAuth;
        this.logger = new common_1.Logger(TelegramAuthController_1.name);
    }
    verifyTelegramAuth(data) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            this.logger.error("TELEGRAM_BOT_TOKEN not configured");
            return false;
        }
        const authDate = data.auth_date;
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
            this.logger.warn("Telegram auth data expired");
            return false;
        }
        const { hash, ...rest } = data;
        const checkString = Object.keys(rest)
            .sort()
            .map((k) => `${k}=${rest[k]}`)
            .join("\n");
        const secretKey = (0, crypto_1.createHmac)("sha256", "WebAppData").update(botToken).digest();
        const calculatedHash = (0, crypto_1.createHmac)("sha256", secretKey).update(checkString).digest("hex");
        return calculatedHash === hash;
    }
    async telegram(body) {
        this.logger.debug(`Telegram auth attempt: ${JSON.stringify(body)}`);
        if (!process.env.TELEGRAM_ENABLED || process.env.TELEGRAM_ENABLED !== "true") {
            throw new common_1.BadRequestException("Telegram auth is disabled");
        }
        if (!this.verifyTelegramAuth(body)) {
            throw new common_1.BadRequestException("Invalid Telegram authentication data");
        }
        if (!supabase_1.supabase) {
            throw new common_1.InternalServerErrorException("Auth service unavailable");
        }
        const telegramId = String(body.id);
        const fullName = [body.first_name, body.last_name].filter(Boolean).join(" ") || `User ${telegramId}`;
        const email = `telegram_${telegramId}@locus.app`;
        try {
            let session = null;
            const { data: existingProfile } = await supabase_1.supabase
                .from("profiles")
                .select("id, email")
                .eq("telegram_id", telegramId)
                .single();
            if (existingProfile) {
                const { data: signInData, error: signInError } = await supabase_1.supabase.auth.admin.getUserById(existingProfile.id);
                if (!signInError && signInData.user) {
                    const { data: sessionData, error: sessionError } = await supabase_1.supabase.auth.admin.generateLink({
                        type: "magiclink",
                        email: signInData.user.email ?? email,
                    });
                    if (sessionError) {
                        this.logger.warn(`Failed to generate session: ${sessionError.message}`);
                    }
                    const userInfo = await this.supabaseAuth.syncUser({ id: existingProfile.id, email: signInData.user.email }, telegramId);
                    return {
                        ok: true,
                        user: userInfo,
                        message: "Telegram auth successful. Use magic link or password to complete sign in.",
                    };
                }
            }
            const { data: createData, error: createError } = await supabase_1.supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: {
                    telegram_id: telegramId,
                    full_name: fullName,
                    username: body.username,
                    photo_url: body.photo_url,
                },
            });
            if (createError) {
                if (createError.message.includes("already exists")) {
                    const { data: existingUser } = await supabase_1.supabase.auth.admin.listUsers();
                    const user = existingUser.users.find((u) => u.email === email);
                    if (user) {
                        const userInfo = await this.supabaseAuth.syncUser({ id: user.id, email: user.email }, telegramId);
                        return {
                            ok: true,
                            user: userInfo,
                            message: "Telegram user found",
                        };
                    }
                }
                this.logger.error(`Failed to create user: ${createError.message}`);
                throw new common_1.InternalServerErrorException("Failed to create user");
            }
            if (!createData.user) {
                throw new common_1.InternalServerErrorException("Failed to create user");
            }
            const userInfo = await this.supabaseAuth.syncUser({
                id: createData.user.id,
                email: createData.user.email,
                user_metadata: createData.user.user_metadata,
            }, telegramId);
            return {
                ok: true,
                user: userInfo,
                message: "Telegram registration successful",
            };
        }
        catch (error) {
            this.logger.error(`Telegram auth error: ${error}`);
            throw error;
        }
    }
};
exports.TelegramAuthController = TelegramAuthController;
__decorate([
    (0, common_1.Post)("telegram"),
    (0, swagger_1.ApiOperation)({ summary: "Authenticate via Telegram Login Widget" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Authentication successful" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Invalid Telegram data" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramAuthController.prototype, "telegram", null);
exports.TelegramAuthController = TelegramAuthController = TelegramAuthController_1 = __decorate([
    (0, swagger_1.ApiTags)("auth"),
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [supabase_auth_service_1.SupabaseAuthService])
], TelegramAuthController);
//# sourceMappingURL=telegram.controller.js.map