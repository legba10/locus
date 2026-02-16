import { BadRequestException, Controller, Get, Post, Req, UseGuards, Body, Res, UnauthorizedException } from "@nestjs/common";
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
  @ApiOperation({ summary: "Get current user. Bearer token or cookie." })
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
        profile?: unknown;
      };
    },
  ) {
    return this.buildMePayload(req.user);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh Supabase access token using refresh_token (body or cookie)." })
  @ApiResponse({ status: 200, description: "New access and refresh tokens" })
  @ApiResponse({ status: 401, description: "Refresh token missing or invalid" })
  async refresh(
    @Body("refresh_token") refreshToken: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokenFromCookie = readRefreshTokenFromCookie(req);
    const token = (typeof refreshToken === "string" && refreshToken.trim()) || tokenFromCookie;
    if (!token) {
      throw new UnauthorizedException("Refresh token is required");
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

  /**
   * POST /auth/session — устанавливает cookie из Supabase токенов (после логина/регистрации на фронте).
   * Цепочка: REGISTER/LOGIN (Supabase) → session (set cookies) → /me (читает cookie) → OK.
   * После вызова НЕ нужен refresh; все запросы идут с credentials: "include".
   */
  @Post("session")
  @ApiOperation({ summary: "Set auth cookies from Supabase tokens (call after frontend login/register)." })
  @ApiResponse({ status: 200, description: "User payload + Set-Cookie" })
  @ApiResponse({ status: 401, description: "Invalid tokens" })
  async session(
    @Body("access_token") accessToken: string | undefined,
    @Body("refresh_token") refreshToken: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const at = typeof accessToken === "string" && accessToken.trim() ? accessToken.trim() : null;
    const rt = typeof refreshToken === "string" && refreshToken.trim() ? refreshToken.trim() : null;
    if (!at || !rt) {
      throw new UnauthorizedException("access_token and refresh_token are required");
    }

    const session = { access_token: at, refresh_token: rt };
    const { data, error } = await supabase.auth.getUser(at);
    if (error || !data.user) {
      throw new UnauthorizedException("Invalid or expired access token");
    }

    setAuthCookies(res, req, session);
    await this.sessions.storeRefreshSession(data.user.id, rt, req).catch(() => undefined);

    const telegramId = data.user.user_metadata?.telegram_id as string | undefined;
    const userInfo = await this.supabaseAuth.syncUser(
      {
        id: data.user.id,
        email: data.user.email ?? null,
        phone: data.user.phone ?? null,
        user_metadata: data.user.user_metadata,
      },
      telegramId
    );

    const reqUser = {
      id: userInfo.id,
      supabaseId: userInfo.supabaseId,
      email: userInfo.email,
      phone: userInfo.phone,
      role: userInfo.role,
      roles: userInfo.roles,
      profile: userInfo.profile,
    };
    const mePayload = await this.buildMePayload(reqUser);
    return mePayload;
  }

  private async buildMePayload(reqUser: {
    id: string;
    email: string;
    phone: string | null;
    role: string;
    roles: string[];
    profile?: unknown;
  }) {
    let profile = (reqUser.profile as any) ?? null;
    if (!profile) {
      profile = await this.supabaseAuth.getProfile(reqUser.id);
    }
    if (!profile) {
      profile = await this.supabaseAuth
        .upsertProfile({ id: reqUser.id, email: reqUser.email ?? null, phone: reqUser.phone ?? null, user_metadata: null })
        .catch(() => null);
    }

    const rawProfileRole = profile?.role ?? null;
    const role = ((rawProfileRole ?? "user") as string).toLowerCase() === "landlord" ? "landlord" : "user";
    const tariff = ((profile?.tariff ?? profile?.plan ?? "free") as "free" | "landlord_basic" | "landlord_pro");
    const email = profile?.email ?? reqUser.email ?? null;

    const defaults = await this.supabaseAuth.ensureListingDefaults(reqUser.id).catch(() => null);
    const listingLimit = Number((defaults as any)?.listing_limit ?? (profile as any)?.listing_limit ?? 1);
    const listingUsed = Number((defaults as any)?.listing_used ?? (profile as any)?.listing_used ?? 0);
    const planRaw = String((defaults as any)?.plan ?? (profile as any)?.plan ?? tariff ?? "free");

    const isAdmin =
      Boolean((profile as any)?.is_admin) ||
      Boolean((defaults as any)?.is_admin) ||
      (await this.supabaseAuth.ensureAdminFlag({
        id: reqUser.id,
        telegram_id: profile?.telegram_id ?? null,
        is_admin: (profile as any)?.is_admin ?? null,
      }).catch(() => false));

    await this.neonUser.ensureUserExists(reqUser.id, email);
    const derived = planFromLegacyTariff(planRaw);
    const userRow = await this.prisma.user.update({
      where: { id: reqUser.id },
      data: {
        plan: derived.plan,
        listingLimit: listingLimit || derived.listingLimit,
      },
      select: { plan: true, listingLimit: true, appRole: true },
    });

    const isAdminNeon = userRow.appRole === "ADMIN" || userRow.appRole === "ROOT";
    const isAdminFinal = isAdmin || isAdminNeon;
    const profileCompleted = Boolean((profile?.full_name ?? "").trim()) && Boolean((profile?.phone ?? "").trim());

    return {
      id: reqUser.id,
      email: email ?? "",
      role: isAdminFinal ? "admin" : role,
      plan: userRow.plan,
      listingLimit: userRow.listingLimit,
      listingUsed,
      isAdmin: isAdminFinal,
      profileCompleted,
      full_name: String(profile?.full_name ?? ""),
      phone: String(profile?.phone ?? reqUser.phone ?? ""),
      telegram_id: String(profile?.telegram_id ?? ""),
      avatar_url: String((profile as any)?.avatar_url ?? ""),
      username: String((profile as any)?.username ?? ""),
    };
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
