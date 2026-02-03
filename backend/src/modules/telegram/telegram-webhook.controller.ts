import {
  Controller,
  Post,
  Get,
  Body,
  Logger,
  HttpCode,
  OnModuleInit,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

/** Telegram Update - message or callback_query */
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
    chat: { id: number; type: string };
    date: number;
    text?: string;
    contact?: {
      phone_number: string;
      first_name?: string;
      last_name?: string;
      user_id?: number;
    };
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name?: string; username?: string };
    message?: { chat: { id: number }; message_id: number };
    data?: string;
  };
}

@ApiTags("telegram")
@Controller("telegram")
export class TelegramWebhookController implements OnModuleInit {
  private readonly logger = new Logger(TelegramWebhookController.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME?.replace("@", "") || "Locusnext_bot";
  private readonly isEnabled = process.env.TELEGRAM_ENABLED === "true";
  private readonly frontendUrl = process.env.FRONTEND_URL || "https://locus-i4o2.vercel.app";

  constructor(private readonly prisma: PrismaService) {}

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
    // Handle callback_query (inline buttons: policy accept/cancel)
    if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
      return;
    }

    if (!update.message) return;

    const { message } = update;
    const chatId = message.chat.id;
    const fromUser = message.from;
    const text = message.text || "";

    this.logger.log(`Webhook: chat_id=${chatId}, text=${text?.slice(0, 50)}`);

    if (!fromUser) return;

    // Handle contact (phone shared)
    if (message.contact) {
      await this.handleContact(chatId, fromUser.id, message.contact);
      return;
    }

    // Handle /start
    if (text.startsWith("/start")) {
      const payload = text.replace("/start", "").trim();
      if (payload) {
        await this.handleLoginStart(chatId, fromUser, payload);
        return;
      }
      await this.sendWelcomeMessage(chatId);
      return;
    }

    await this.sendGenericReply(chatId);
  }

  /** /start <login_token> — save telegram_user_id, request phone */
  private async handleLoginStart(
    chatId: number,
    from: { id: number; first_name: string; last_name?: string; username?: string },
    loginToken: string
  ) {
    this.logger.log(`Login start: token=${loginToken?.slice(0, 8)}..., telegram_id=${from.id}`);

    const session = await this.prisma.telegramAuthSession.findUnique({
      where: { loginToken },
    });

    if (!session) {
      await this.sendMessage(chatId, "❌ Ссылка для входа устарела или недействительна.\n\nПопробуйте ещё раз на сайте.");
      return;
    }

    if (session.status === "CONFIRMED") {
      await this.sendMessage(chatId, "✅ Вход уже подтверждён. Вернитесь на сайт.");
      return;
    }

    await this.prisma.telegramAuthSession.update({
      where: { loginToken },
      data: {
        telegramUserId: BigInt(from.id),
        firstName: from.first_name,
        username: from.username ?? null,
      },
    });

    const keyboard = {
      keyboard: [[{ text: "📱 Отправить номер", request_contact: true }]],
      one_time_keyboard: true,
      resize_keyboard: true,
    };

    await this.sendMessageWithKeyboard(
      chatId,
      "👋 Для входа в LOCUS\nнам нужен ваш номер телефона.\n\nНажмите кнопку ниже 👇",
      keyboard
    );
  }

  /** On contact received — save phone, ask policy */
  private async handleContact(
    chatId: number,
    telegramUserId: number,
    contact: { phone_number: string; first_name?: string; last_name?: string; user_id?: number }
  ) {
    const phone = contact.phone_number.startsWith("+") ? contact.phone_number : `+${contact.phone_number}`;

    const session = await this.prisma.telegramAuthSession.findFirst({
      where: { telegramUserId: BigInt(telegramUserId), status: { in: ["PENDING", "PHONE_RECEIVED"] } },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      await this.sendMessage(chatId, "❌ Сессия не найдена. Начните вход заново с сайта.");
      return;
    }

    await this.prisma.telegramAuthSession.update({
      where: { id: session.id },
      data: { phoneNumber: phone, status: "PHONE_RECEIVED" },
    });

    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "✅ Я принимаю", callback_data: "policy_accept" }],
        [{ text: "❌ Отмена", callback_data: "policy_cancel" }],
      ],
    };

    await this.sendMessageWithInlineKeyboard(
      chatId,
      "Подтвердите согласие с политикой обработки персональных данных LOCUS.",
      inlineKeyboard
    );
  }

  /** On callback — policy_accept or policy_cancel */
  private async handleCallbackQuery(cq: {
    id: string;
    from: { id: number };
    message?: { chat: { id: number }; message_id: number };
    data?: string;
  }) {
    const chatId = cq.message?.chat?.id ?? cq.from.id;

    if (cq.data === "policy_cancel") {
      await this.answerCallback(cq.id);
      await this.sendMessage(chatId, "❌ Вход отменён. Вы можете начать заново с сайта.");
      return;
    }

    if (cq.data !== "policy_accept") return;

    const session = await this.prisma.telegramAuthSession.findFirst({
      where: { telegramUserId: BigInt(cq.from.id), status: "PHONE_RECEIVED" },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      await this.answerCallback(cq.id);
      await this.sendMessage(chatId, "❌ Сессия устарела. Попробуйте войти заново с сайта.");
      return;
    }

    await this.prisma.telegramAuthSession.update({
      where: { id: session.id },
      data: { status: "CONFIRMED", policyAccepted: true },
    });

    await this.answerCallback(cq.id);

    const completeUrl = `${this.frontendUrl}/auth/telegram/complete?token=${encodeURIComponent(session.loginToken)}`;
    const inlineKeyboard = {
      inline_keyboard: [[{ text: "🔗 Вернуться на сайт", url: completeUrl }]],
    };

    await this.sendMessageWithInlineKeyboard(
      chatId,
      "✅ Вход подтверждён\n\nВы можете вернуться на сайт",
      inlineKeyboard
    );

    this.logger.log(`Telegram login confirmed: session=${session.id}`);
  }

  private async answerCallback(callbackQueryId: string) {
    if (!this.botToken) return;
    try {
      await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQueryId }),
      });
    } catch (e) {
      this.logger.error(`answerCallbackQuery failed: ${e}`);
    }
  }

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

  private async sendMessageWithKeyboard(chatId: number, text: string, replyMarkup: object) {
    if (!this.botToken) return;
    try {
      await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        }),
      });
    } catch (error) {
      this.logger.error(`Failed to send message: ${error}`);
    }
  }

  private async sendMessageWithInlineKeyboard(chatId: number, text: string, replyMarkup: object) {
    if (!this.botToken) return;
    try {
      await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        }),
      });
    } catch (error) {
      this.logger.error(`Failed to send message: ${error}`);
    }
  }

  private async sendWelcomeMessage(chatId: number) {
    await this.sendMessage(
      chatId,
      `👋 <b>Добро пожаловать в LOCUS!</b>\n\n` +
        `🏠 Это бот для поиска и сдачи жилья с AI-рекомендациями.\n\n` +
        `Для входа на сайт:\n` +
        `1. Перейдите на ${this.frontendUrl}\n` +
        `2. Нажмите "Войти через Telegram"\n` +
        `3. Следуйте инструкциям в боте.\n\n` +
        `📩 Бот подключён и работает.`
    );
  }

  private async sendGenericReply(chatId: number) {
    await this.sendMessage(
      chatId,
      `✅ Сообщение получено.\n\n` +
        `Для входа на сайт перейдите на ${this.frontendUrl} и нажмите "Войти через Telegram".`
    );
  }
}
