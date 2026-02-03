import {
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { supabase } from "../../shared/lib/supabase";
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

    if (!session.phoneNumber || !session.telegramUserId) {
      return { authenticated: false, status: "incomplete" };
    }

    try {
      const { userId, tokenHash } = await this.createOrFindSupabaseUser(session);

      if (!tokenHash) {
        throw new InternalServerErrorException("Failed to generate session");
      }

      // Mark session as consumed (optional: delete to prevent reuse)
      await this.prisma.telegramAuthSession.delete({ where: { loginToken: token } }).catch(() => {});

      return {
        authenticated: true,
        tokenHash,
        supabaseToken: tokenHash,
        user: { id: userId },
      };
    } catch (error) {
      this.logger.error(`Telegram auth completion error: ${error}`);
      throw error;
    }
  }

  private async createOrFindSupabaseUser(session: {
    phoneNumber: string;
    telegramUserId: bigint;
    username: string | null;
    firstName: string | null;
  }): Promise<{ userId: string; tokenHash: string }> {
    if (!supabase) {
      throw new InternalServerErrorException("Auth service unavailable");
    }

    const telegramId = String(session.telegramUserId);
    const phone = session.phoneNumber.startsWith("+") ? session.phoneNumber : `+${session.phoneNumber}`;
    const fullName = session.firstName ?? `User ${telegramId}`;
    const email = `telegram_${telegramId}@locus.app`;

    let supabaseUser: { id: string; email: string | null } | null = null;

    // Check existing by telegram_id in profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("telegram_id", telegramId)
      .single();

    if (existingProfile) {
      const { data: userData } = await supabase.auth.admin.getUserById(existingProfile.id);
      if (userData?.user) {
        supabaseUser = { id: userData.user.id, email: userData.user.email ?? null };
      }
    }

    // Check existing by phone
    if (!supabaseUser) {
      const { data: usersByPhone } = await supabase.auth.admin.listUsers();
      const byPhone = usersByPhone?.users?.find((u) => u.phone === phone);
      if (byPhone) {
        supabaseUser = { id: byPhone.id, email: byPhone.email ?? null };
        await supabase.from("profiles").upsert(
          {
            id: byPhone.id,
            telegram_id: telegramId,
            full_name: fullName,
            phone,
          },
          { onConflict: "id" }
        );
      }
    }

    // Create new user
    if (!supabaseUser) {
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        phone,
        phone_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          full_name: fullName,
          username: session.username,
          auth_provider: "telegram",
        },
      });

      if (createError) {
        if (createError.message.includes("already exists")) {
          const { data: list } = await supabase.auth.admin.listUsers();
          const existing = list?.users?.find((u) => u.email === email || u.phone === phone);
          if (existing) {
            supabaseUser = { id: existing.id, email: existing.email ?? null };
          }
        }
        if (!supabaseUser) {
          this.logger.error(`Create user failed: ${createError.message}`);
          throw new InternalServerErrorException("Failed to create user");
        }
      } else if (createData?.user) {
        supabaseUser = { id: createData.user.id, email: createData.user.email ?? null };
        await this.supabaseAuth.upsertProfile(
          {
            id: createData.user.id,
            email: createData.user.email ?? null,
            phone,
            user_metadata: createData.user.user_metadata,
          },
          telegramId
        );
      }
    }

    if (!supabaseUser) {
      throw new InternalServerErrorException("Failed to get or create user");
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: supabaseUser.email ?? email,
    });

    const tokenHash =
      (linkData as { properties?: { hashed_token?: string }; hashed_token?: string })?.properties?.hashed_token ??
      (linkData as { hashed_token?: string })?.hashed_token;

    if (linkError || !tokenHash) {
      this.logger.error(`Generate link failed: ${linkError?.message}`);
      throw new InternalServerErrorException("Failed to generate session");
    }

    return {
      userId: supabaseUser.id,
      tokenHash,
    };
  }
}
