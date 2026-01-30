import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { TelegramAuthController } from "./telegram.controller";
import { RolesGuard } from "./guards/roles.guard";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { SupabaseAuthService } from "./supabase-auth.service";
import { PrismaModule } from "../prisma/prisma.module";

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AuthController, TelegramAuthController],
  providers: [RolesGuard, SupabaseAuthGuard, SupabaseAuthService],
  exports: [RolesGuard, SupabaseAuthGuard, SupabaseAuthService],
})
export class AuthModule {}
