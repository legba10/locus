import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { SupabaseAuthService } from "./supabase-auth.service";
import { randomUUID } from "crypto";

const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

@ApiTags("auth")
@Controller("auth/telegram")
export class AuthTelegramController {
  private readonly logger = new Logger(AuthTelegramController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAuth: SupabaseAuthService
  ) {}

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
      return { authenticated: false, status: "not_found" };
    }

    if (loginToken.used) {
      return { authenticated: false, status: "used" };
    }

    if (loginToken.expiresAt.getTime() < Date.now()) {
      return { authenticated: false, status: "expired" };
    }

    const session = loginToken.session;
    if (!session) {
      return { authenticated: false, status: "not_found" };
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

      const { data: sessionData, error: sessionError } = await this.supabaseAuth.verifyOtpToken(tokenHash);

      if (sessionError || !sessionData?.session) {
        this.logger.error(`Verify OTP failed: ${sessionError?.message ?? "no session"}`);
        throw new InternalServerErrorException("Failed to create session");
      }

      const updated = await this.prisma.telegramLoginToken.updateMany({
        where: { token, used: false, expiresAt: { gt: new Date() } },
        data: { used: true, userId: user.id },
      });
      if (updated.count === 0) {
        return { authenticated: false, status: "used" };
      }
      await this.prisma.telegramAuthSession.delete({ where: { id: session.id } }).catch(() => {});

      return {
        authenticated: true,
        session: sessionData.session,
        user: { id: user.id },
      };
    } catch (error) {
      this.logger.error(`Telegram auth completion error: ${error}`);
      throw error;
    }
  }
}
