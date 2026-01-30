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
exports.AiRiskService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiRiskService = class AiRiskService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async risk(dto) {
        const listing = await this.prisma.listing.findFirst({
            where: { id: dto.listingId },
            include: { owner: true },
        });
        if (!listing)
            throw new common_1.NotFoundException("Listing not found");
        const reasons = [];
        let riskScore = 20;
        if (listing.owner.status !== client_1.UserStatus.ACTIVE) {
            riskScore += 50;
            reasons.push("Владелец не в статусе ACTIVE.");
        }
        else {
            reasons.push("Владелец в статусе ACTIVE.");
        }
        if (!listing.description || listing.description.trim().length < 60) {
            riskScore += 15;
            reasons.push("Короткое описание повышает риск недопонимания условий.");
        }
        if (listing.lat == null || listing.lng == null) {
            riskScore += 10;
            reasons.push("Нет координат — сложнее верифицировать локацию.");
        }
        riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
        const riskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
        const explanation = await this.prisma.aiExplanation.create({
            data: {
                type: client_1.AiExplanationType.RISK_EXPLANATION,
                text: "Risk Score — вероятность проблем (споры, отмены, жалобы). В MVP считаем по простым сигналам; позже подключим антифрод и поведенческие кластеры.",
                bullets: [`Risk Score: ${riskScore}/100`, `Risk Level: ${riskLevel}`],
                meta: { reasons },
            },
        });
        await this.prisma.aiListingScore.upsert({
            where: { listingId: listing.id },
            update: { riskScore, explanationId: explanation.id },
            create: { listingId: listing.id, riskScore, explanationId: explanation.id },
        });
        return {
            listingId: listing.id,
            riskScore,
            riskLevel,
            reasons,
            mitigations: [
                "Добавьте координаты и более детальное описание условий.",
                "Уточните шум/правила дома, чтобы снизить риск жалоб.",
            ],
            explanation: {
                text: "Я оценил риск по статусу владельца и полноте данных объявления.",
                bullets: [`Уровень риска: ${riskLevel}`, ...reasons.slice(0, 3)],
            },
        };
    }
};
exports.AiRiskService = AiRiskService;
exports.AiRiskService = AiRiskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiRiskService);
