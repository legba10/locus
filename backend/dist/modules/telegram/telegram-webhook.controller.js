"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TelegramWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
let TelegramWebhookController = TelegramWebhookController_1 = class TelegramWebhookController {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TelegramWebhookController_1.name);
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME?.replace("@", "") || "Locusnext_bot";
        this.isEnabled = process.env.TELEGRAM_ENABLED === "true";
        this.frontendUrl = process.env.FRONTEND_URL || "https://locus-i4o2.vercel.app";
    }
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
    async setWebhook() {
        const backendUrl = process.env.RAILWAY_PUBLIC_DOMAIN
            ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
            : process.env.BACKEND_URL || "https://locus-production-df4e.up.railway.app";
        const webhookUrl = `${backendUrl}/api/telegram/webhook`;
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/setWebhook`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: webhookUrl }),
            });
            const result = await response.json();
            if (result.ok) {
                this.logger.log(`Telegram webhook set: ${webhookUrl}`);
            }
            else {
                this.logger.error(`Failed to set webhook: ${JSON.stringify(result)}`);
            }
        }
        catch (error) {
            this.logger.error(`Error setting webhook: ${error}`);
        }
    }
    async handleWebhook(update) {
        this.processUpdate(update).catch((err) => {
            this.logger.error(`Error processing update: ${err}`);
        });
        return { ok: true };
    }
    async processUpdate(update) {
        if (update.callback_query) {
            await this.handleCallbackQuery(update.callback_query);
            return;
        }
        if (!update.message)
            return;
        const { message } = update;
        const chatId = message.chat.id;
        const fromUser = message.from;
        const text = message.text || "";
        this.logger.log(`Webhook: chat_id=${chatId}, text=${text?.slice(0, 50)}`);
        if (!fromUser)
            return;
        if (message.contact) {
            await this.handleContact(chatId, fromUser.id, message.contact);
            return;
        }
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
    async handleLoginStart(chatId, from, loginToken) {
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
        await this.sendMessageWithKeyboard(chatId, "👋 Для входа в LOCUS\nнам нужен ваш номер телефона.\n\nНажмите кнопку ниже 👇", keyboard);
    }
    async handleContact(chatId, telegramUserId, contact) {
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
        await this.sendMessageWithInlineKeyboard(chatId, "Подтвердите согласие с политикой обработки персональных данных LOCUS.", inlineKeyboard);
    }
    async handleCallbackQuery(cq) {
        const chatId = cq.message?.chat?.id ?? cq.from.id;
        if (cq.data === "policy_cancel") {
            await this.answerCallback(cq.id);
            await this.sendMessage(chatId, "❌ Вход отменён. Вы можете начать заново с сайта.");
            return;
        }
        if (cq.data !== "policy_accept")
            return;
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
        await this.sendMessageWithInlineKeyboard(chatId, "✅ Вход подтверждён\n\nВы можете вернуться на сайт", inlineKeyboard);
        this.logger.log(`Telegram login confirmed: session=${session.id}`);
    }
    async answerCallback(callbackQueryId) {
        if (!this.botToken)
            return;
        try {
            await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ callback_query_id: callbackQueryId }),
            });
        }
        catch (e) {
            this.logger.error(`answerCallbackQuery failed: ${e}`);
        }
    }
    async sendMessage(chatId, text) {
        if (!this.botToken)
            return;
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
        }
        catch (error) {
            this.logger.error(`Failed to send message: ${error}`);
        }
    }
    async sendMessageWithKeyboard(chatId, text, replyMarkup) {
        if (!this.botToken)
            return;
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
        }
        catch (error) {
            this.logger.error(`Failed to send message: ${error}`);
        }
    }
    async sendMessageWithInlineKeyboard(chatId, text, replyMarkup) {
        if (!this.botToken)
            return;
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
        }
        catch (error) {
            this.logger.error(`Failed to send message: ${error}`);
        }
    }
    async sendWelcomeMessage(chatId) {
        await this.sendMessage(chatId, `👋 <b>Добро пожаловать в LOCUS!</b>\n\n` +
            `🏠 Это бот для поиска и сдачи жилья с AI-рекомендациями.\n\n` +
            `Для входа на сайт:\n` +
            `1. Перейдите на ${this.frontendUrl}\n` +
            `2. Нажмите "Войти через Telegram"\n` +
            `3. Следуйте инструкциям в боте.\n\n` +
            `📩 Бот подключён и работает.`);
    }
    async sendGenericReply(chatId) {
        await this.sendMessage(chatId, `✅ Сообщение получено.\n\n` +
            `Для входа на сайт перейдите на ${this.frontendUrl} и нажмите "Войти через Telegram".`);
    }
};
exports.TelegramWebhookController = TelegramWebhookController;
__decorate([
    (0, common_1.Post)("webhook"),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramWebhookController.prototype, "handleWebhook", null);
exports.TelegramWebhookController = TelegramWebhookController = TelegramWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)("telegram"),
    (0, common_1.Controller)("telegram"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelegramWebhookController);
//# sourceMappingURL=telegram-webhook.controller.js.map