"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAssistantService = void 0;
const common_1 = require("@nestjs/common");
let AiAssistantService = class AiAssistantService {
    async reply(dto) {
        const msg = dto.message.trim().toLowerCase();
        if (dto.role === "guest") {
            if (msg.includes("почему") || msg.includes("подходит")) {
                return {
                    reply: "Я могу объяснить подбор: учитываю бюджет, город и приоритеты (тишина/метро). Если скажете район и важные удобства — уточню и пересчитаю результаты.",
                    suggestions: [
                        "Уточнить район/станцию метро",
                        "Сказать, важна ли тишина ночью или днём",
                        "Нужны ли парковка/интернет/рабочее место",
                    ],
                    actions: [{ type: "ask_clarifying_questions", payload: { fields: ["district", "metro", "amenities"] } }],
                };
            }
            if (msg.includes("риск") || msg.includes("безопас")) {
                return {
                    reply: "Проверяю риски по сигналам объявления и профиля хоста (полнота данных, локация, история, аномалии). В MVP это базовые эвристики; позже подключим антифрод и поведенческую аналитику.",
                    suggestions: [
                        "Смотрите на полноту описания и правила",
                        "Уточняйте условия заселения/депозит в чате",
                        "Выбирайте варианты с прозрачной политикой отмены",
                    ],
                };
            }
            return {
                reply: "Опишите, что вам важно (бюджет, район/метро, тишина, срок) — и я подберу варианты с объяснением и альтернативами.",
            };
        }
        if (dto.role === "host") {
            if (msg.includes("цена") || msg.includes("прайс") || msg.includes("дорого") || msg.includes("дёшево")) {
                return {
                    reply: "Я могу рекомендовать цену, опираясь на спрос (сигналы метро/тишина) и качество объявления. В MVP это эвристики, дальше добавим прогноз загрузки и сравнение по рынку.",
                    suggestions: [
                        "Улучшить качество объявления (описание/координаты/сигналы)",
                        "Включить instant booking (если поддержим)",
                        "Тестировать цену A/B по неделям",
                    ],
                };
            }
            return {
                reply: "Я помогу повысить загрузку: покажу Quality Score, предложу оптимизацию цены и укажу риски/узкие места в объявлении.",
            };
        }
        return {
            reply: "Я могу подсвечивать кластеры риска, аномалии и очереди модерации. В MVP верну explainable сигналы; дальше подключим граф и поведенческие модели.",
            suggestions: ["Открыть risk map", "Посмотреть fraud clusters", "Проверить quality heatmap"],
        };
    }
};
exports.AiAssistantService = AiAssistantService;
exports.AiAssistantService = AiAssistantService = __decorate([
    (0, common_1.Injectable)()
], AiAssistantService);
//# sourceMappingURL=ai-assistant.service.js.map