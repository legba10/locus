import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { MeController } from "./me.controller";
import { SyncUserController } from "./sync-user.controller";
import { TelegramAuthController } from "./telegram.controller";
import { AuthTelegramController } from "./auth-telegram.controller";
import { AdminGuard } from "./guards/admin.guard";
import { ModerationGuard } from "./guards/moderation.guard";
import { RolesGuard } from "./guards/roles.guard";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { TariffGuard } from "./guards/tariff.guard";
import { SupabaseAuthService } from "./supabase-auth.service";
import { AuthSessionsService } from "./auth-sessions.service";

/**
 * AuthModule — единый auth через Supabase.
 * Backend не логинит — только проверяет JWT (GET /me, refresh, session, logout).
 */
@Global()
@Module({
  imports: [ConfigModule, PrismaModule, UsersModule],
  controllers: [AuthController, MeController, SyncUserController, TelegramAuthController, AuthTelegramController],
  providers: [AdminGuard, ModerationGuard, RolesGuard, SupabaseAuthGuard, TariffGuard, SupabaseAuthService, AuthSessionsService],
  exports: [AdminGuard, ModerationGuard, RolesGuard, SupabaseAuthGuard, TariffGuard, SupabaseAuthService, AuthSessionsService],
})
export class AuthModule {}
