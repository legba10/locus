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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPricingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiPricingService = class AiPricingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async pricing(dto) {
        const listing = await this.prisma.listing.findFirst({
            where: { id: dto.listingId },
        });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        const text = `${listing.title} ${listing.description}`.toLowerCase();
        const hasMetro = text.includes("метро");
        const quiet = /(тихо|тишина|спокойн|двор)/i.test(text);
        let demandScore = 50;
        if (hasMetro)
            demandScore += 15;
        if (quiet)
            demandScore += 10;
        demandScore = Math.max(0, Math.min(100, demandScore));
        const current = listing.basePrice;
        const deltaPctRaw = (demandScore - 50) / 2;
        const deltaPct = Math.round(deltaPctRaw);
        const recommended = Math.max(1000, Math.round(current * (1 + deltaPct / 100)));
        const bookingProbability = Math.max(5, Math.min(95, Math.round(40 + (demandScore - 50) * 0.8)));
        const rationale = [];
        if (hasMetro)
            rationale.push("Близость к метро (сигнал из текста объявления) повышает спрос.");
        if (quiet)
            rationale.push("Сигнал тишины повышает привлекательность для длительной аренды.");
        if (!hasMetro)
            rationale.push("Нет явного сигнала про метро — спрос может быть ниже.");
        const explanation = await this.prisma.aiExplanation.create({
            data: {
                type: client_1.AiExplanationType.PRICING_EXPLANATION,
                text: "Рекомендация цены основана на эвристиках спроса (MVP). Далее подключим прогноз спроса (time-series) и сравнение по рынку.",
                bullets: [
                    `Demand Score: ${demandScore}/100`,
                    `Ожидаемая вероятность бронирования: ${bookingProbability}%`,
                    `Рекомендованный сдвиг: ${deltaPct >= 0 ? "+" : ""}${deltaPct}%`,
                ],
                meta: { rationale },
            },
        });
        const priceScore = Math.max(0, Math.min(100, Math.round(50 + deltaPct)));
        await this.prisma.aiListingScore.upsert({
            where: { listingId: listing.id },
            update: { demandScore, priceScore, explanationId: explanation.id },
            create: { listingId: listing.id, demandScore, priceScore, explanationId: explanation.id },
        });
        return {
            listingId: listing.id,
            currency: listing.currency,
            currentPrice: current,
            recommendedPrice: recommended,
            deltaPct,
            bookingProbability,
            demandScore,
            rationale,
            explanation: {
                text: "Я оценил спрос по сигналам (метро/тишина) и предложил сдвиг цены.",
                bullets: [
                    `Спрос: ${demandScore}/100`,
                    `Рекоменд. цена: ${recommended} ${listing.currency}/ночь`,
                ],
            },
        };
    }
};
exports.AiPricingService = AiPricingService;
exports.AiPricingService = AiPricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiPricingService);
//# sourceMappingURL=ai-pricing.service.js.map