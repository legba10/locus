import { Controller, Post, Get, Body, Query, Logger, HttpCode, OnModuleInit, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExcludeEndpoint, ApiQuery } from "@nestjs/swagger";
import { supabase } from "../../shared/lib/supabase";
import { randomBytes } from "crypto";

/**
 * Telegram Update structure
 */
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      type: "private" | "group" | "supergroup" | "channel";
    };
    date: number;
    text?: string;
  };
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface LoginSession {
  status: "pending" | "completed" | "expired";
  createdAt: number;
  telegramUser?: TelegramUser;
  userId?: string;
  accessToken?: string;
}

// In-memory storage for login sessions (TTL: 5 minutes)
const loginSessions = new Map<string, LoginSession>();
const SESSION_TTL = 5 * 60 * 1000; // 5 minutes

// Cleanup expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of loginSessions.entries()) {
    if (now - session.createdAt > SESSION_TTL) {
      loginSessions.delete(token);
    }
  }
}, 60 * 1000); // Check every minute

@ApiTags("telegram")
@Controller("telegram")
export class TelegramWebhookController implements OnModuleInit {
  private readonly logger = new Logger(TelegramWebhookController.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME?.replace("@", "") || "Locusnext_bot";
  private readonly isEnabled = process.env.TELEGRAM_ENABLED === "true";
  private readonly frontendUrl = process.env.FRONTEND_URL || "https://locus-i4o2.vercel.app";

  async onModuleInit() {
    if (!this.isEnabled) {
      this.logger.warn("Telegram is disabled (TELEGRAM_ENABLED !== true)");
      return;
    }

    if (!this.botToken) {
      this.logger.error("TELEGRAM_BOT_TOKEN is not set");
      return;
    }

    await this.setWebhook();
  }

  private async setWebhook() {
    const backendUrl = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : process.env.BACKEND_URL || "https://locus-production-df4e.up.railway.app";
    
    const webhookUrl = `${backendUrl}/api/telegram/webhook`;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: webhookUrl }),
        }
      );

      const result = await response.json();

      if (result.ok) {
        this.logger.log(`Telegram webhook set: ${webhookUrl}`);
      } else {
        this.logger.error(`Failed to set webhook: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      this.logger.error(`Error setting webhook: ${error}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTH FLOW: Step 1 - Initialize login session
  // ═══════════════════════════════════════════════════════════════
  @Get("login/init")
  @ApiOperation({ summary: "Initialize Telegram login - returns bot URL with token" })
  async initLogin() {
    if (!this.isEnabled) {
      throw new BadRequestException("Telegram login is disabled");
    }

    // Generate unique token
    const token = randomBytes(16).toString("hex");
    
    // Store session
    loginSessions.set(token, {
      status: "pending",
      createdAt: Date.now(),
    });

    // Return bot URL with token
    const botUrl = `https://t.me/${this.botName}?start=login_${token}`;
    
    this.logger.log(`Login session created: ${token}`);

    return {
      ok: true,
      token,
      botUrl,
      botName: this.botName,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTH FLOW: Step 3 - Check login status (frontend polls this)
  // ═══════════════════════════════════════════════════════════════
  @Get("login/check")
  @ApiOperation({ summary: "Check Telegram login status" })
  @ApiQuery({ name: "token", required: true })
  async checkLogin(@Query("token") token: string) {
    if (!token) {
      throw new BadRequestException("Token is required");
    }

    const session = loginSessions.get(token);

    if (!session) {
      return { ok: false, status: "not_found" };
    }

    // Check if expired
    if (Date.now() - session.createdAt > SESSION_TTL) {
      loginSessions.delete(token);
      return { ok: false, status: "expired" };
    }

    if (session.status === "completed" && session.userId) {
      // Cleanup token after successful check
      loginSessions.delete(token);

      return {
        ok: true,
        status: "completed",
        user: {
          id: session.userId,
          telegramId: String(session.telegramUser?.id),
          username: session.telegramUser?.username,
          firstName: session.telegramUser?.first_name,
        },
        // Note: For full auth, you'd return a JWT here
        // For now, frontend can use this to fetch session from Supabase
      };
    }

    return {
      ok: true,
      status: session.status,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // WEBHOOK: Receives updates from Telegram
  // ═══════════════════════════════════════════════════════════════
  @Post("webhook")
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handleWebhook(@Body() update: TelegramUpdate) {
    this.processUpdate(update).catch((err) => {
      this.logger.error(`Error processing update: ${err}`);
    });

    return { ok: true };
  }

  private async processUpdate(update: TelegramUpdate) {
    if (!update.message) return;

    const { message } = update;
    const chatId = message.chat.id;
    const fromUser = message.from;
    const text = message.text || "";

    this.logger.log(`Webhook: chat_id=${chatId}, text=${text}`);

    if (!fromUser) return;

    // Handle /start command
    if (text.startsWith("/start")) {
      const payload = text.replace("/start", "").trim();
      
      // Check if this is a login request
      if (payload.startsWith("login_")) {
        const token = payload.replace("login_", "");
        await this.handleLoginStart(chatId, fromUser, token);
        return;
      }

      // Regular /start - just welcome message
      await this.sendWelcomeMessage(chatId);
      return;
    }

    // Other messages
    await this.sendGenericReply(chatId);
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTH FLOW: Step 2 - Handle /start login_<token> from Telegram
  // ═══════════════════════════════════════════════════════════════
  private async handleLoginStart(chatId: number, from: TelegramUser, token: string) {
    this.logger.log(`Login attempt: token=${token}, telegram_id=${from.id}`);

    const session = loginSessions.get(token);

    if (!session) {
      await this.sendMessage(chatId, "❌ Ссылка для входа устарела или недействительна.\n\nПопробуйте ещё раз на сайте.");
      return;
    }

    if (session.status === "completed") {
      await this.sendMessage(chatId, "✅ Вы уже авторизованы! Вернитесь на сайт.");
      return;
    }

    try {
      // Create or find user in Supabase
      const userId = await this.loginWithTelegram(from);

      if (!userId) {
        await this.sendMessage(chatId, "❌ Ошибка авторизации. Попробуйте позже.");
        return;
      }

      // Update session
      session.status = "completed";
      session.telegramUser = from;
      session.userId = userId;
      loginSessions.set(token, session);

      this.logger.log(`Telegram login success: telegram_id=${from.id}, user_id=${userId}`);

      // Send success message
      await this.sendMessage(chatId, 
        `✅ Вход выполнен успешно!\n\n` +
        `👤 ${from.first_name}${from.username ? ` (@${from.username})` : ""}\n\n` +
        `Вернитесь на сайт — вы будете автоматически авторизованы.`
      );

    } catch (error) {
      this.logger.error(`Login error: ${error}`);
      await this.sendMessage(chatId, "❌ Произошла ошибка. Попробуйте позже.");
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Create or find user by Telegram ID
  // ═══════════════════════════════════════════════════════════════
  private async loginWithTelegram(from: TelegramUser): Promise<string | null> {
    if (!supabase) {
      this.logger.error("Supabase not initialized");
      return null;
    }

    const telegramId = String(from.id);
    const email = `telegram_${telegramId}@locus.app`;
    const fullName = [from.first_name, from.last_name].filter(Boolean).join(" ");

    try {
      // Check if user exists by telegram_id in profiles
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("telegram_id", telegramId)
        .single();

      if (existingProfile) {
        this.logger.log(`Found existing user: ${existingProfile.id}`);
        return existingProfile.id;
      }

      // Check if user exists with synthetic email
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);

      if (existingUser) {
        // Update profile with telegram_id
        await supabase
          .from("profiles")
          .upsert({
            id: existingUser.id,
            email,
            telegram_id: telegramId,
            full_name: fullName,
          }, { onConflict: "id" });

        this.logger.log(`Updated existing user: ${existingUser.id}`);
        return existingUser.id;
      }

      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          full_name: fullName,
          username: from.username,
        },
      });

      if (createError) {
        this.logger.error(`Failed to create user: ${createError.message}`);
        return null;
      }

      if (!newUser.user) return null;

      // Create profile
      await supabase.from("profiles").upsert({
        id: newUser.user.id,
        email,
        telegram_id: telegramId,
        full_name: fullName,
      }, { onConflict: "id" });

      this.logger.log(`Created new user: ${newUser.user.id}`);
      return newUser.user.id;

    } catch (error) {
      this.logger.error(`loginWithTelegram error: ${error}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Telegram API helpers
  // ═══════════════════════════════════════════════════════════════
  private async sendMessage(chatId: number, text: string) {
    if (!this.botToken) return;

    try {
      await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      });
    } catch (error) {
      this.logger.error(`Failed to send message: ${error}`);
    }
  }

  private async sendWelcomeMessage(chatId: number) {
    await this.sendMessage(chatId, 
      `👋 <b>Добро пожаловать в LOCUS!</b>\n\n` +
      `🏠 Это бот для поиска и сдачи жилья с AI-рекомендациями.\n\n` +
      `Для входа на сайт:\n` +
      `1. Перейдите на ${this.frontendUrl}\n` +
      `2. Нажмите "Войти через Telegram"\n` +
      `3. Вы автоматически авторизуетесь!\n\n` +
      `📩 Бот подключён и работает.`
    );
  }

  private async sendGenericReply(chatId: number) {
    await this.sendMessage(chatId,
      `✅ Сообщение получено.\n\n` +
      `Для входа на сайт перейдите на ${this.frontendUrl} и нажмите "Войти через Telegram".`
    );
  }
}
