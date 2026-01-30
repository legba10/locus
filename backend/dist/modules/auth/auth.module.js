"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const telegram_controller_1 = require("./telegram.controller");
const roles_guard_1 = require("./guards/roles.guard");
const supabase_auth_guard_1 = require("./guards/supabase-auth.guard");
const supabase_auth_service_1 = require("./supabase-auth.service");
const prisma_module_1 = require("../prisma/prisma.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, prisma_module_1.PrismaModule],
        controllers: [auth_controller_1.AuthController, telegram_controller_1.TelegramAuthController],
        providers: [roles_guard_1.RolesGuard, supabase_auth_guard_1.SupabaseAuthGuard, supabase_auth_service_1.SupabaseAuthService],
        exports: [roles_guard_1.RolesGuard, supabase_auth_guard_1.SupabaseAuthGuard, supabase_auth_service_1.SupabaseAuthService],
    })
], AuthModule);
