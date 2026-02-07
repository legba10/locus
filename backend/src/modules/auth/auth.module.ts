import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { MeController } from "./me.controller";
import { TelegramAuthController } from "./telegram.controller";
import { AuthTelegramController } from "./auth-telegram.controller";
import { RolesGuard } from "./guards/roles.guard";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { TariffGuard } from "./guards/tariff.guard";
import { SupabaseAuthService } from "./supabase-auth.service";

/**
 * AuthModule — handles authentication via Supabase
 * 
 * Architecture:
 * - Auth: Supabase Auth (JWT validation)
 * - Profiles: Supabase public.profiles table
 * - Roles: Stored in profiles.role column
 * - Telegram: Bot-based login with phone + policy (auth-telegram)
 */
@Global()
@Module({
  imports: [ConfigModule, PrismaModule, UsersModule],
  controllers: [AuthController, MeController, TelegramAuthController, AuthTelegramController],
  providers: [RolesGuard, SupabaseAuthGuard, TariffGuard, SupabaseAuthService],
  exports: [RolesGuard, SupabaseAuthGuard, TariffGuard, SupabaseAuthService],
})
export class AuthModule {}
