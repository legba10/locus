import { Module } from "@nestjs/common";
import { TelegramWebhookController } from "./telegram-webhook.controller";

/**
 * TelegramModule — handles Telegram Bot webhook
 *
 * Features:
 * - Webhook for login flow: phone + policy → CONFIRMED
 * - Uses Prisma TelegramAuthSession (via global PrismaModule)
 *
 * Config (env):
 * - TELEGRAM_BOT_TOKEN, TELEGRAM_ENABLED, FRONTEND_URL
 * - NEXT_PUBLIC_TELEGRAM_BOT_NAME (for bot URL)
 */
@Module({
  controllers: [TelegramWebhookController],
  providers: [],
  exports: [],
})
export class TelegramModule {}
