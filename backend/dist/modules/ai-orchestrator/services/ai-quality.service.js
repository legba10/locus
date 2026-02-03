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
exports.AiQualityService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiQualityService = class AiQualityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    scoreDescription(description) {
        const hints = [];
        const len = description.trim().length;
        let score = 0;
        if (len >= 220)
            score += 35;
        else if (len >= 120)
            score += 25;
        else if (len >= 60)
            score += 15;
        else {
            score += 5;
            hints.push("Сделайте описание подробнее (плюсы района, транспорт, условия, что включено).");
        }
        if (/(метро|пешком|минут)/i.test(description))
            score += 10;
        else
            hints.push("Добавьте транспортную доступность (время до метро/остановки).");
        if (/(тихо|тишина|спокойн|двор)/i.test(description))
            score += 10;
        else
            hints.push("Уточните уровень шума (окна во двор/шумоизоляция).");
        if (/(интернет|wi-?fi|рабоч)/i.test(description))
            score += 5;
        if (/(правила|курени|животн|вечерин)/i.test(description))
            score += 5;
        return { score, hints };
    }
    async quality(dto) {
        const listing = await this.prisma.listing.findFirst({
            where: { id: dto.listingId },
        });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        let score = 0;
        const suggestions = [];
        score += 20;
        if (!listing.addressLine)
            suggestions.push("Укажите адрес/ориентир (без раскрытия точного номера дома до брони).");
        if (listing.lat == null || listing.lng == null)
            suggestions.push("Добавьте координаты для карты и поиска по району.");
        if (listing.basePrice > 0)
            score += 10;
        else
            suggestions.push("Цена должна быть > 0.");
        const desc = this.scoreDescription(listing.description);
        score += desc.score;
        suggestions.push(...desc.hints);
        const qualityScore = Math.max(0, Math.min(100, Math.round(score)));
        const explanationText = "Quality Score отражает полноту и ясность объявления (что важно гостю до бронирования).";
        const bullets = [
            `Описание: +${desc.score}`,
            listing.lat != null && listing.lng != null ? "Есть координаты" : "Нет координат",
        ];
        const explanation = await this.prisma.aiExplanation.create({
            data: {
                type: client_1.AiExplanationType.QUALITY_EXPLANATION,
                text: explanationText,
                bullets,
                meta: { suggestions },
            },
        });
        await this.prisma.aiListingScore.upsert({
            where: { listingId: listing.id },
            update: { qualityScore, explanationId: explanation.id },
            create: { listingId: listing.id, qualityScore, explanationId: explanation.id },
        });
        return {
            listingId: listing.id,
            qualityScore,
            suggestions: Array.from(new Set(suggestions)).slice(0, 8),
            explanation: {
                text: explanationText,
                bullets,
            },
        };
    }
};
exports.AiQualityService = AiQualityService;
exports.AiQualityService = AiQualityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiQualityService);
//# sourceMappingURL=ai-quality.service.js.map