import { Body, Controller, Post, Logger, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { createHmac } from "crypto";
import { supabase } from "../../shared/lib/supabase";
import { SupabaseAuthService } from "./supabase-auth.service";

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
  async telegram(@Body() body: TelegramAuthData) {
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

    try {
      // Try to sign in existing user
      let session = null;
      
      // Check if user exists by looking up profile with telegram_id
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("telegram_id", telegramId)
        .single();

      if (existingProfile) {
        // User exists - sign in with admin API
        const { data: signInData, error: signInError } = await supabase.auth.admin.getUserById(existingProfile.id);
        
        if (!signInError && signInData.user) {
          // Generate session for existing user
          const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
            type: "magiclink",
            email: signInData.user.email ?? email,
          });
          
          if (sessionError) {
            this.logger.warn(`Failed to generate session: ${sessionError.message}`);
          }
          
          // For now, return user info without session (frontend will use magic link)
          const userInfo = await this.supabaseAuth.syncUser(
            { id: existingProfile.id, email: signInData.user.email },
            telegramId
          );
          
          return {
            ok: true,
            user: userInfo,
            message: "Telegram auth successful. Use magic link or password to complete sign in.",
          };
        }
      }

      // Create new user in Supabase Auth
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          full_name: fullName,
          username: body.username,
          photo_url: body.photo_url,
        },
      });

      if (createError) {
        // User might already exist with this email
        if (createError.message.includes("already exists")) {
          const { data: existingUser } = await supabase.auth.admin.listUsers();
          const user = existingUser.users.find((u) => u.email === email);
          
          if (user) {
            const userInfo = await this.supabaseAuth.syncUser(
              { id: user.id, email: user.email },
              telegramId
            );
            
            return {
              ok: true,
              user: userInfo,
              message: "Telegram user found",
            };
          }
        }
        
        this.logger.error(`Failed to create user: ${createError.message}`);
        throw new InternalServerErrorException("Failed to create user");
      }

      if (!createData.user) {
        throw new InternalServerErrorException("Failed to create user");
      }

      // Sync profile
      const userInfo = await this.supabaseAuth.syncUser(
        { 
          id: createData.user.id, 
          email: createData.user.email,
          user_metadata: createData.user.user_metadata,
        },
        telegramId
      );

      return {
        ok: true,
        user: userInfo,
        message: "Telegram registration successful",
      };
    } catch (error) {
      this.logger.error(`Telegram auth error: ${error}`);
      throw error;
    }
  }
}
