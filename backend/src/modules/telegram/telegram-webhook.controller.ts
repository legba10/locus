import { Controller, Post, Body, Logger, HttpCode, OnModuleInit } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from "@nestjs/swagger";
import { supabase } from "../../shared/lib/supabase";

/**
 * Telegram Update structure (simplified)
 * https://core.telegram.org/bots/api#update
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

@ApiTags("telegram")
@Controller("telegram")
export class TelegramWebhookController implements OnModuleInit {
  private readonly logger = new Logger(TelegramWebhookController.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly isEnabled = process.env.TELEGRAM_ENABLED === "true";

  async onModuleInit() {
    if (!this.isEnabled) {
      this.logger.warn("Telegram is disabled (TELEGRAM_ENABLED !== true)");
      return;
    }

    if (!this.botToken) {
      this.logger.error("TELEGRAM_BOT_TOKEN is not set");
      return;
    }

    // Set webhook on startup
    await this.setWebhook();
  }

  /**
   * Set webhook URL with Telegram API
   */
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
        this.logger.log(`Telegram webhook set successfully: ${webhookUrl}`);
      } else {
        this.logger.error(`Failed to set Telegram webhook: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      this.logger.error(`Error setting Telegram webhook: ${error}`);
    }
  }

  /**
   * Webhook endpoint - receives updates from Telegram
   * Must return 200 immediately to prevent retries
   */
  @Post("webhook")
  @HttpCode(200)
  @ApiOperation({ summary: "Telegram bot webhook endpoint" })
  @ApiExcludeEndpoint() // Hide from Swagger (security)
  async handleWebhook(@Body() update: TelegramUpdate) {
    // Always return 200 immediately
    this.processUpdate(update).catch((err) => {
      this.logger.error(`Error processing update: ${err}`);
    });

    return { ok: true };
  }

  /**
   * Process incoming update asynchronously
   */
  private async processUpdate(update: TelegramUpdate) {
    if (!update.message) {
      this.logger.debug("Update has no message, skipping");
      return;
    }

    const { message } = update;
    const chatId = message.chat.id;
    const fromUser = message.from;
    const text = message.text || "";

    this.logger.log(`Telegram webhook received update`);
    this.logger.log(`chat_id: ${chatId}`);
    this.logger.log(`username: ${fromUser?.username || "N/A"}`);
    this.logger.log(`first_name: ${fromUser?.first_name || "N/A"}`);
    this.logger.log(`text: ${text}`);

    // Save user to Supabase (auto-register)
    if (fromUser) {
      await this.saveOrUpdateUser(chatId, fromUser);
    }

    // Reply to the message
    await this.sendReply(chatId, text);
  }

  /**
   * Save or update user in Supabase profiles
   * telegram_chat_id is stored for sending notifications later
   * 
   * Note: profiles table should have columns:
   * - telegram_id (text) - Telegram user ID
   * - telegram_chat_id (text) - Chat ID for sending messages (optional)
   */
  private async saveOrUpdateUser(
    chatId: number,
    from: NonNullable<TelegramUpdate["message"]>["from"]
  ) {
    if (!from || !supabase) return;

    const telegramId = String(from.id);
    const telegramChatId = String(chatId);

    try {
      // Check if profile with this telegram_id exists
      const { data: existing, error: selectError } = await supabase
        .from("profiles")
        .select("id, telegram_id")
        .eq("telegram_id", telegramId)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = no rows returned (user not found)
        this.logger.warn(`Error checking profile: ${selectError.message}`);
        return;
      }

      if (existing) {
        // Try to update telegram_chat_id (if column exists)
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ telegram_chat_id: telegramChatId })
          .eq("id", existing.id);
        
        if (updateError) {
          // Column might not exist - that's ok, just log
          this.logger.debug(`Could not update telegram_chat_id: ${updateError.message}`);
        } else {
          this.logger.log(`Updated telegram_chat_id for user ${telegramId} -> ${telegramChatId}`);
        }
      } else {
        this.logger.log(`User with telegram_id=${telegramId} not registered yet.`);
        this.logger.log(`They should register on the website first, then use Telegram login.`);
      }
    } catch (error) {
      this.logger.error(`Error saving user: ${error}`);
    }
  }

  /**
   * Send reply message via Telegram API
   */
  private async sendReply(chatId: number, incomingText: string) {
    if (!this.botToken) return;

    let replyText: string;

    if (incomingText === "/start") {
      replyText = `👋 Добро пожаловать в LOCUS!

🏠 Это бот для поиска и сдачи жилья с AI-рекомендациями.

Чтобы пользоваться ботом:
1. Зарегистрируйтесь на сайте locus-i4o2.vercel.app
2. Войдите через Telegram в личном кабинете
3. После этого бот сможет отправлять вам уведомления

📩 Бот подключён и работает!`;
    } else {
      replyText = `✅ Бот подключён. Сообщение получено.

Ваш chat_id: ${chatId}

Для регистрации перейдите на сайт и войдите через Telegram.`;
    }

    try {
      await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: "HTML",
        }),
      });
    } catch (error) {
      this.logger.error(`Failed to send reply: ${error}`);
    }
  }
}
