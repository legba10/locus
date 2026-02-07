import { BadRequestException, Controller, Get, Post, Req, UseGuards, InternalServerErrorException, Body, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { SupabaseAuthService } from "./supabase-auth.service";
import type { Request, Response } from "express";
import { clearAuthCookies, readRefreshTokenFromCookie, setAuthCookies } from "./auth-cookies";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly supabaseAuth: SupabaseAuthService) {}

  @Get("me")
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user. Supabase access_token required." })
  @ApiResponse({ status: 200, description: "Current user" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async me(
    @Req()
    req: {
      user: {
        id: string;
        supabaseId: string;
        email: string;
        phone: string | null;
        role: "user" | "landlord";
        roles: string[];
        profile?: {
          full_name: string | null;
          phone: string | null;
          telegram_id: string | null;
          role: string | null;
          tariff: string | null;
          email?: string | null;
        } | null;
      };
    },
  ) {
    const profile = await this.supabaseAuth.getProfile(req.user.id);
    if (!profile) {
      throw new InternalServerErrorException("PROFILE_NOT_FOUND");
    }

    const role = (profile.role ?? "user") as "user" | "landlord";
    const tariff = (profile.tariff ?? "free") as "free" | "landlord_basic" | "landlord_pro";
    const email = profile.email ?? req.user.email ?? null;

    return {
      id: profile.id,
      email,
      phone: profile.phone ?? null,
      telegram_id: profile.telegram_id ?? null,
      username: profile.username ?? null,
      avatar_url: profile.avatar_url ?? null,
      full_name: profile.full_name ?? null,
      role,
      tariff,
    };
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh Supabase access token using refresh_token." })
  @ApiResponse({ status: 200, description: "New access and refresh tokens" })
  async refresh(
    @Body("refresh_token") refreshToken: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokenFromCookie = readRefreshTokenFromCookie(req);
    const token = refreshToken || tokenFromCookie;
    if (!token) {
      throw new BadRequestException("Refresh token is required");
    }

    const session = await this.supabaseAuth.refreshSession(token);
    // Keep cookie session in sync (Telegram + any cookie-based auth)
    setAuthCookies(res, req, session);
    return session;
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout: clears auth cookies (cookie-based sessions)" })
  @ApiResponse({ status: 200, description: "Logged out" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res, req);
    return { ok: true };
  }

  @Post("login")
  @ApiOperation({ summary: "Login is via Supabase on frontend; this route returns 400." })
  @ApiResponse({ status: 400, description: "Use Supabase client for login" })
  login() {
    throw new BadRequestException({
      message: "Use Supabase client for login. Backend accepts only Authorization: Bearer <supabase_access_token>.",
    });
  }
}
