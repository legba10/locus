import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { SupabaseAuthService } from "./supabase-auth.service";
import { randomUUID } from "crypto";
import { supabase } from "../../shared/lib/supabase";

const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

@ApiTags("auth")
@Controller("auth/telegram")
export class AuthTelegramController {
  private readonly logger = new Logger(AuthTelegramController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAuth: SupabaseAuthService
  ) {}

  private async isSessionValid(accessToken: string | null | undefined): Promise<boolean> {
    if (!accessToken || !supabase) return false;
    const { data, error } = await supabase.auth.getUser(accessToken);
    return !error && !!data?.user;
  }

  @Post("start")
  @ApiOperation({ summary: "Start Telegram login - returns loginToken for bot" })
  async start() {
    if (process.env.TELEGRAM_ENABLED !== "true") {
      throw new BadRequestException("Telegram login is disabled");
    }

    const loginToken = randomUUID();

    await this.prisma.telegramAuthSession.create({
      data: {
        loginToken,
        status: "PENDING",
      },
    });

    this.logger.log(`Telegram auth started: ${loginToken}`);

    return { loginToken };
  }

  @Get("status")
  @ApiOperation({ summary: "Check Telegram login status - returns session when CONFIRMED" })
  @ApiQuery({ name: "token", required: true })
  async status(@Query("token") token: string) {
    if (!token) {
      throw new BadRequestException("Token is required");
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
        .catch(() => {});
      return { authenticated: false, status: "expired" };
    }

    if (session.status !== "CONFIRMED") {
      return { authenticated: false, status: session.status.toLowerCase() };
    }

    if (!session.phoneNumber) {
      throw new BadRequestException("Phone number not confirmed");
    }
    if (!session.telegramUserId) {
      throw new BadRequestException("Telegram user ID not confirmed");
    }

    const phoneNumber = session.phoneNumber;
    const telegramUserId = session.telegramUserId;

    try {
      const user = await this.supabaseAuth.ensureTelegramUser({
        phoneNumber,
        telegramUserId,
        username: session.username,
        firstName: session.firstName,
      });

      const tokenHash = await this.supabaseAuth.generateMagicLinkToken(
        user.email ?? `telegram_${String(telegramUserId)}@locus.app`
      );

      // Mark session as consumed (optional: delete to prevent reuse)
      await this.prisma.telegramAuthSession.delete({ where: { loginToken: token } }).catch(() => {});

      return {
        authenticated: true,
        tokenHash,
        supabaseToken: tokenHash,
        user: { id: user.id },
      };
    } catch (error) {
      this.logger.error(`Telegram auth completion error: ${error}`);
      throw error;
    }
  }

  @Post("complete")
  @ApiOperation({ summary: "Complete Telegram login - exchanges token for Supabase session" })
  async complete(@Body("token") token: string) {
    if (!token) {
      throw new BadRequestException("Token is required");
    }

    const loginToken = await this.prisma.telegramLoginToken.findUnique({
      where: { token },
      include: { session: true },
    });

    if (!loginToken) {
      throw new BadRequestException("TOKEN_NOT_FOUND");
    }

    if (loginToken.expiresAt.getTime() < Date.now()) {
      throw new ConflictException("TOKEN_EXPIRED");
    }

    if (loginToken.used) {
      if (!loginToken.userId) {
        throw new ConflictException("USER_NOT_FOUND");
      }
      if (!loginToken.accessToken || !loginToken.refreshToken) {
        throw new ConflictException("TOKEN_EXPIRED");
      }
      const isValid = await this.isSessionValid(loginToken.accessToken);
      let accessToken = loginToken.accessToken;
      let refreshToken = loginToken.refreshToken;
      if (!isValid) {
        try {
          const refreshed = await this.supabaseAuth.refreshSession(loginToken.refreshToken);
          accessToken = refreshed.access_token;
          refreshToken = refreshed.refresh_token;
          await this.prisma.telegramLoginToken.update({
            where: { token },
            data: { accessToken, refreshToken },
          });
        } catch {
          throw new ConflictException("TOKEN_EXPIRED");
        }
      }
      const profile = await this.supabaseAuth.getProfile(loginToken.userId);
      if (!profile) {
        throw new ConflictException("USER_NOT_FOUND");
      }
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: profile.id,
          phone: profile.phone ?? null,
          telegram_id: profile.telegram_id ?? null,
          full_name: profile.full_name ?? null,
          role: profile.role ?? "user",
          tariff: (profile.tariff ?? "free") as "free" | "landlord_basic" | "landlord_pro",
        },
      };
    }

    const session = loginToken.session;
    if (!session) {
      throw new BadRequestException("TOKEN_NOT_FOUND");
    }

    if (session.status !== "CONFIRMED") {
      throw new BadRequestException("SESSION_NOT_CONFIRMED");
    }

    if (!session.phoneNumber) {
      throw new BadRequestException("Phone number not confirmed");
    }
    if (!session.telegramUserId) {
      throw new BadRequestException("Telegram user ID not confirmed");
    }

    const phoneNumber = session.phoneNumber;
    const telegramUserId = session.telegramUserId;

    try {
      const user = await this.supabaseAuth.ensureTelegramUser({
        phoneNumber,
        telegramUserId,
        username: session.username,
        firstName: session.firstName,
      });

      const recentToken = await this.prisma.telegramLoginToken.findFirst({
        where: {
          userId: user.id,
          used: true,
          accessToken: { not: null },
          refreshToken: { not: null },
        },
        orderBy: { usedAt: "desc" },
      });

      if (recentToken) {
        let accessToken = recentToken.accessToken ?? "";
        let refreshToken = recentToken.refreshToken ?? "";
        const isValid = await this.isSessionValid(accessToken);
        if (!isValid && refreshToken) {
          try {
            const refreshed = await this.supabaseAuth.refreshSession(refreshToken);
            accessToken = refreshed.access_token;
            refreshToken = refreshed.refresh_token;
          } catch {
            accessToken = "";
          }
        }

        if (accessToken && refreshToken) {
          await this.prisma.telegramLoginToken.update({
            where: { token },
            data: {
              used: true,
              usedAt: new Date(),
              userId: user.id,
              accessToken,
              refreshToken,
            },
          });
          await this.prisma.telegramAuthSession.delete({ where: { id: session.id } }).catch(() => {});
          const profile = await this.supabaseAuth.getProfile(user.id);
          if (!profile) {
            throw new InternalServerErrorException("PROFILE_NOT_FOUND");
          }
          return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
              id: profile.id,
              phone: profile.phone ?? null,
              telegram_id: profile.telegram_id ?? null,
              full_name: profile.full_name ?? null,
              role: profile.role ?? "user",
              tariff: (profile.tariff ?? "free") as "free" | "landlord_basic" | "landlord_pro",
            },
          };
        }
      }

      const tokenHash = await this.supabaseAuth.generateMagicLinkToken(
        user.email ?? `telegram_${String(telegramUserId)}@locus.app`
      );

      const { data: sessionData, error: sessionError } = await this.supabaseAuth.verifyOtpToken(tokenHash);

      if (sessionError || !sessionData?.session) {
        this.logger.error(`Verify OTP failed: ${sessionError?.message ?? "no session"}`);
        throw new InternalServerErrorException("Failed to create session");
      }

      const updated = await this.prisma.telegramLoginToken.updateMany({
        where: { token, used: false, expiresAt: { gt: new Date() } },
        data: {
          used: true,
          usedAt: new Date(),
          userId: user.id,
          accessToken: sessionData.session.access_token,
          refreshToken: sessionData.session.refresh_token,
        },
      });
      if (updated.count === 0) {
        const existing = await this.prisma.telegramLoginToken.findUnique({ where: { token } });
        if (existing?.used && existing.accessToken && existing.refreshToken) {
          const profile = await this.supabaseAuth.getProfile(user.id);
          return {
            access_token: existing.accessToken,
            refresh_token: existing.refreshToken,
            user: {
              id: profile?.id ?? user.id,
              phone: profile?.phone ?? null,
              telegram_id: profile?.telegram_id ?? null,
              full_name: profile?.full_name ?? null,
              role: profile?.role ?? "user",
              tariff: (profile?.tariff ?? "free") as "free" | "landlord_basic" | "landlord_pro",
            },
          };
        }
        throw new ConflictException("TOKEN_EXPIRED");
      }
      await this.prisma.telegramAuthSession.delete({ where: { id: session.id } }).catch(() => {});

      const profile = await this.supabaseAuth.getProfile(user.id);
      if (!profile) {
        throw new InternalServerErrorException("PROFILE_NOT_FOUND");
      }
      return {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user: {
          id: profile.id,
          phone: profile.phone ?? null,
          telegram_id: profile.telegram_id ?? null,
          full_name: profile.full_name ?? null,
          role: profile.role ?? "user",
          tariff: (profile.tariff ?? "free") as "free" | "landlord_basic" | "landlord_pro",
        },
      };
    } catch (error) {
      this.logger.error(`Telegram auth completion error: ${error}`);
      throw error;
    }
  }
}
