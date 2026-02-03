import { Module } from "@nestjs/common";
import { TelegramWebhookController } from "./telegram-webhook.controller";

/**
 * TelegramModule — handles Telegram Bot webhook
 * 
 * Features:
 * - Webhook endpoint for receiving bot updates
 * - Auto-registers webhook on startup
 * - Saves telegram_chat_id for users
 * - Sends notifications (future)
 * 
 * Config (env):
 * - TELEGRAM_BOT_TOKEN: Bot token from @BotFather
 * - TELEGRAM_ENABLED: "true" to enable
 */
@Module({
  controllers: [TelegramWebhookController],
  providers: [],
  exports: [],
})
export class TelegramModule {}
