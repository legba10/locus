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
exports.AiSearchService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const text_intent_1 = require("./text-intent");
let AiSearchService = class AiSearchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(dto) {
        const intent = (0, text_intent_1.parseIntent)(dto.query, { city: dto.context?.city });
        const q = dto.query.toLowerCase();
        const listings = await this.prisma.listing.findMany({
            where: {
                status: client_1.ListingStatus.PUBLISHED,
                ...(intent.city ? { city: intent.city } : {}),
                ...(intent.maxMonthlyPrice ? { basePrice: { lte: intent.maxMonthlyPrice } } : {}),
            },
            take: 50,
            orderBy: { updatedAt: "desc" },
            include: {
                aiScores: true,
            },
        });
        const scored = listings.map((p) => {
            let score = 0;
            const reasons = [];
            const riskFlags = [];
            if (intent.maxMonthlyPrice) {
                const diff = intent.maxMonthlyPrice - p.basePrice;
                score += Math.max(-20, Math.min(20, diff / 1000));
                reasons.push(`Вписывается в бюджет до ${intent.maxMonthlyPrice} ₽/мес`);
            }
            if (intent.wantsQuiet) {
                const quietKeywords = ["тихо", "тихий", "спокойн", "уютн"];
                const desc = `${p.title} ${p.description}`.toLowerCase();
                const hasQuietSignal = quietKeywords.some((kw) => desc.includes(kw));
                const quietScore = hasQuietSignal ? 70 : 40;
                score += (quietScore - 50) / 2;
                if (hasQuietSignal)
                    reasons.push("Тихий вариант (по описанию)");
                else
                    riskFlags.push("Может быть шумно для вашего запроса");
            }
            if (intent.wantsMetro) {
                const hasMetro = `${p.title} ${p.description}`.toLowerCase().includes("метро");
                score += hasMetro ? 18 : -8;
                if (hasMetro)
                    reasons.push("Есть упоминание близости к метро");
                else
                    riskFlags.push("Нет явного сигнала близости к метро");
            }
            const keywords = ["тихо", "метро", "парк", "центр", "студ", "спальн"];
            for (const kw of keywords) {
                if (q.includes(kw) && `${p.title} ${p.description}`.toLowerCase().includes(kw))
                    score += 3;
            }
            return {
                listingId: p.id,
                title: p.title,
                city: p.city,
                basePrice: p.basePrice,
                currency: p.currency,
                score,
                reasons,
                riskFlags,
            };
        });
        scored.sort((a, b) => b.score - a.score);
        const results = scored.slice(0, 5);
        const bullets = [];
        if (intent.city)
            bullets.push(`Город: ${intent.city}`);
        if (intent.maxMonthlyPrice)
            bullets.push(`Бюджет: до ${intent.maxMonthlyPrice} ₽/мес`);
        if (intent.wantsQuiet)
            bullets.push("Приоритет: тишина");
        if (intent.wantsMetro)
            bullets.push("Приоритет: рядом с метро");
        const alternatives = [];
        if (intent.wantsMetro && results.every((r) => r.riskFlags.includes("Нет явного сигнала близости к метро"))) {
            alternatives.push({
                query: `${dto.query} (расширить радиус от метро)`,
                reason: "В данных объявлениях нет явного сигнала про метро — можно расширить критерий.",
            });
        }
        if (intent.maxMonthlyPrice && results.length === 0) {
            alternatives.push({
                query: dto.query.replace(/до\s+\d+(?:[.,]\d+)?\s*(k|к)?/i, "до 60k"),
                reason: "По заданному бюджету нет вариантов — попробуйте увеличить потолок.",
            });
        }
        const risks = results
            .flatMap((r) => r.riskFlags.map((f) => ({ listingId: r.listingId, flag: f })))
            .slice(0, 10);
        return {
            intent,
            results,
            explanation: {
                text: "Я интерпретировал запрос как набор ограничений и приоритетов, затем ранжировал варианты по соответствию.",
                bullets,
            },
            alternatives,
            risks,
        };
    }
};
exports.AiSearchService = AiSearchService;
exports.AiSearchService = AiSearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiSearchService);
