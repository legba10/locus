import { BadRequestException, Controller, Get, Post, Req, UseGuards, InternalServerErrorException, Body, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { SupabaseAuthService } from "./supabase-auth.service";
import type { Request, Response } from "express";
import { clearAuthCookies, readRefreshTokenFromCookie, setAuthCookies } from "./auth-cookies";
import { PrismaService } from "../prisma/prisma.service";
import { NeonUserService } from "../users/neon-user.service";
import { planFromLegacyTariff } from "./plan";
import { AuthSessionsService } from "./auth-sessions.service";
import { supabase } from "../../shared/lib/supabase";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly prisma: PrismaService,
    private readonly neonUser: NeonUserService,
    private readonly sessions: AuthSessionsService
  ) {}

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
    // Prefer profile synced by guard; fallback to fetch; never hard-fail login if profile row is missing.
    let profile = (req.user.profile as any) ?? null;
    if (!profile) {
      profile = await this.supabaseAuth.getProfile(req.user.id);
    }
    if (!profile) {
      // Attempt to create minimal profile (requires service-role key); ignore errors.
      profile = await this.supabaseAuth
        .upsertProfile({ id: req.user.id, email: req.user.email ?? null, phone: req.user.phone ?? null, user_metadata: null })
        .catch(() => null);
    }

    const rawProfileRole = profile?.role ?? null;
    const role = ((rawProfileRole ?? "user") as string).toLowerCase() === "landlord" ? "landlord" : "user";
    const tariff = ((profile?.tariff ?? "free") as "free" | "landlord_basic" | "landlord_pro");
    const email = profile?.email ?? req.user.email ?? null;

    // Ensure Neon user exists and keep plan/limit in sync (compat with legacy tariff)
    await this.neonUser.ensureUserExists(req.user.id, email);
    const derived = planFromLegacyTariff(tariff);
    const userRow = await this.prisma.user.update({
      where: { id: req.user.id },
      data: {
        plan: derived.plan,
        listingLimit: derived.listingLimit,
      },
      select: { plan: true, listingLimit: true },
    });

    return {
      id: profile?.id ?? req.user.id,
      email,
      phone: profile?.phone ?? req.user.phone ?? null,
      telegram_id: profile?.telegram_id ?? null,
      username: (profile as any)?.username ?? null,
      avatar_url: (profile as any)?.avatar_url ?? null,
      full_name: profile?.full_name ?? null,
      role,
      profile_role_raw: rawProfileRole,
      needsRoleSelection:
        Boolean(profile?.telegram_id) &&
        (!rawProfileRole || rawProfileRole.toLowerCase() === "user"),
      tariff,
      plan: userRow.plan,
      listingLimit: userRow.listingLimit,
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

    // Multi-device sessions: store/rotate refresh token for current device without deleting other devices.
    try {
      const sb = supabase;
      if (sb) {
        const { data } = await sb.auth.getUser(session.access_token);
        const userId = data?.user?.id;
        if (userId) {
          await this.sessions.rotateRefreshSession(userId, token, session.refresh_token, req);
        }
      }
    } catch {
      // ignore session store issues
    }
    return session;
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout: clears auth cookies (cookie-based sessions)" })
  @ApiResponse({ status: 200, description: "Logged out" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = readRefreshTokenFromCookie(req);
    if (rt) {
      await this.sessions.revokeByToken(rt);
    }
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
