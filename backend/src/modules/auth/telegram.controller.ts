import { Body, Controller, Post, Logger, BadRequestException, InternalServerErrorException, Req, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { createHmac } from "crypto";
import { supabase } from "../../shared/lib/supabase";
import { SupabaseAuthService } from "./supabase-auth.service";
import type { Request, Response } from "express";
import { setAuthCookies } from "./auth-cookies";

interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

@ApiTags("auth")
@Controller("auth")
export class TelegramAuthController {
  private readonly logger = new Logger(TelegramAuthController.name);

  constructor(private readonly supabaseAuth: SupabaseAuthService) {}

  /**
   * Verify Telegram login widget data
   * https://core.telegram.org/widgets/login#checking-authorization
   */
  private verifyTelegramAuth(data: TelegramAuthData): boolean {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      this.logger.error("TELEGRAM_BOT_TOKEN not configured");
      return false;
    }

    // Check auth_date is not too old (24 hours)
    const authDate = data.auth_date;
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      this.logger.warn("Telegram auth data expired");
      return false;
    }

    // Build data-check-string
    const { hash, ...rest } = data;
    const checkString = Object.keys(rest)
      .sort()
      .map((k) => `${k}=${rest[k as keyof typeof rest]}`)
      .join("\n");

    // Calculate hash
    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
    const calculatedHash = createHmac("sha256", secretKey).update(checkString).digest("hex");

    return calculatedHash === hash;
  }

  @Post("telegram")
  @ApiOperation({ summary: "Authenticate via Telegram Login Widget" })
  @ApiResponse({ status: 200, description: "Authentication successful" })
  @ApiResponse({ status: 400, description: "Invalid Telegram data" })
  async telegram(
    @Body() body: TelegramAuthData,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    this.logger.debug(`Telegram auth attempt: ${JSON.stringify(body)}`);

    if (!process.env.TELEGRAM_ENABLED || process.env.TELEGRAM_ENABLED !== "true") {
      throw new BadRequestException("Telegram auth is disabled");
    }

    // Verify Telegram signature
    if (!this.verifyTelegramAuth(body)) {
      throw new BadRequestException("Invalid Telegram authentication data");
    }

    if (!supabase) {
      throw new InternalServerErrorException("Auth service unavailable");
    }

    const telegramId = String(body.id);
    const fullName = [body.first_name, body.last_name].filter(Boolean).join(" ") || `User ${telegramId}`;
    const email = `telegram_${telegramId}@locus.app`; // Synthetic email for Supabase
    const username = body.username ? (body.username.startsWith("@") ? body.username : `@${body.username}`) : null;

    try {
      // 1) Find existing user by telegram_id in profiles
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("telegram_id", telegramId)
        .single();

      let userId: string | null = existingProfile?.id ?? null;
      let userEmail: string = existingProfile?.email ?? email;

      if (userId) {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (userData?.user?.email) userEmail = userData.user.email;
      }

      // 2) Create user if not exists
      if (!userId) {
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            telegram_id: telegramId,
            full_name: fullName,
            first_name: body.first_name ?? null,
            last_name: body.last_name ?? null,
            username,
            photo_url: body.photo_url ?? null,
            auth_provider: "telegram_widget",
          },
        });

        if (createError) {
          // Might already exist (rare race) — resolve by email
          if (createError.message.includes("already exists")) {
            const { data: profileByEmail } = await supabase
              .from("profiles")
              .select("id, email")
              .eq("email", email)
              .single();
            if (profileByEmail?.id) {
              userId = profileByEmail.id;
              userEmail = profileByEmail.email ?? email;
            }

            // Recovery: auth.user exists but profiles row is missing
            if (!userId) {
              const recoveredId = await this.supabaseAuth.findAuthUserIdByEmail(email);
              if (recoveredId) {
                userId = recoveredId;
                userEmail = email;
              }
            }
          }
          if (!userId) {
            this.logger.error(`Failed to create user: ${createError.message}`);
            throw new InternalServerErrorException("Failed to create user");
          }
        } else if (createData?.user) {
          userId = createData.user.id;
          userEmail = createData.user.email ?? email;
        }
      }

      if (!userId) {
        throw new InternalServerErrorException("Failed to create user");
      }

      // 3) Ensure profile exists/updated
      const userInfo = await this.supabaseAuth.syncUser(
        {
          id: userId,
          email: userEmail,
          user_metadata: {
            telegram_id: telegramId,
            full_name: fullName,
            first_name: body.first_name ?? null,
            last_name: body.last_name ?? null,
            username,
            photo_url: body.photo_url ?? null,
            auth_provider: "telegram_widget",
          },
        },
        telegramId
      );

      // 4) Create Supabase session and set cookies (login + registration)
      const tokenHash = await this.supabaseAuth.generateMagicLinkToken(userEmail);
      const { data: sessionData, error: sessionError } = await this.supabaseAuth.verifyOtpToken(tokenHash);
      if (sessionError || !sessionData?.session) {
        this.logger.error(`Verify OTP failed: ${sessionError?.message ?? "no session"}`);
        throw new InternalServerErrorException("Failed to create session");
      }

      setAuthCookies(res, req, {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      });

      return {
        ok: true,
        user: userInfo,
      };
    } catch (error) {
      this.logger.error(`Telegram auth error: ${error}`);
      throw error;
    }
  }
}
