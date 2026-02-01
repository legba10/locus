import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { TelegramAuthController } from "./telegram.controller";
import { RolesGuard } from "./guards/roles.guard";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { SupabaseAuthService } from "./supabase-auth.service";

/**
 * AuthModule — handles authentication via Supabase
 * 
 * Architecture:
 * - Auth: Supabase Auth (JWT validation)
 * - Profiles: Supabase public.profiles table
 * - Roles: Stored in profiles.role column
 * 
 * NO Prisma/Neon for auth — all auth data in Supabase
 */
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AuthController, TelegramAuthController],
  providers: [RolesGuard, SupabaseAuthGuard, SupabaseAuthService],
  exports: [RolesGuard, SupabaseAuthGuard, SupabaseAuthService],
})
export class AuthModule {}
