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
exports.AiOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_assistant_service_1 = require("./services/ai-assistant.service");
const ai_pricing_service_1 = require("./services/ai-pricing.service");
const ai_quality_service_1 = require("./services/ai-quality.service");
const ai_risk_service_1 = require("./services/ai-risk.service");
const ai_search_service_1 = require("./services/ai-search.service");
let AiOrchestratorService = class AiOrchestratorService {
    constructor(prisma, searchSvc, qualitySvc, pricingSvc, riskSvc, assistantSvc) {
        this.prisma = prisma;
        this.searchSvc = searchSvc;
        this.qualitySvc = qualitySvc;
        this.pricingSvc = pricingSvc;
        this.riskSvc = riskSvc;
        this.assistantSvc = assistantSvc;
    }
    toJson(value) {
        return JSON.parse(JSON.stringify(value));
    }
    async search(dto) {
        const result = await this.searchSvc.search(dto);
        await this.prisma.aiEvent.create({
            data: {
                type: client_1.AiEventType.AI_SEARCH,
                userId: dto.context?.userId,
                payload: this.toJson({
                    query: dto.query,
                    context: dto.context ? { userId: dto.context.userId, city: dto.context.city } : null,
                    resultsCount: result.results.length,
                    explanation: result.explanation,
                }),
            },
        });
        return result;
    }
    async quality(dto) {
        const result = await this.qualitySvc.quality(dto);
        await this.prisma.aiEvent.create({
            data: {
                type: client_1.AiEventType.AI_QUALITY,
                listingId: dto.listingId,
                payload: this.toJson(result),
            },
        });
        return result;
    }
    async pricing(dto) {
        const result = await this.pricingSvc.pricing(dto);
        await this.prisma.aiEvent.create({
            data: {
                type: client_1.AiEventType.AI_PRICING,
                listingId: dto.listingId,
                payload: this.toJson(result),
            },
        });
        return result;
    }
    async risk(dto) {
        const result = await this.riskSvc.risk(dto);
        await this.prisma.aiEvent.create({
            data: {
                type: client_1.AiEventType.AI_RISK,
                listingId: dto.listingId,
                payload: this.toJson(result),
            },
        });
        return result;
    }
    async recommendations(dto) {
        const [quality, pricing, risk] = await Promise.all([
            this.qualitySvc.quality(dto),
            this.pricingSvc.pricing(dto),
            this.riskSvc.risk(dto),
        ]);
        const actions = [];
        if (quality.qualityScore !== null && quality.qualityScore < 80) {
            actions.push({
                key: "improve_listing_quality",
                title: "Улучшить качество объявления",
                impact: "high",
                explanation: {
                    type: client_1.AiExplanationType.QUALITY_EXPLANATION,
                    text: "Качество объявления напрямую влияет на конверсию в бронь.",
                    bullets: quality.suggestions,
                },
            });
        }
        if (pricing.deltaPct !== null && Math.abs(pricing.deltaPct) >= 5) {
            actions.push({
                key: "adjust_price",
                title: "Оптимизировать цену",
                impact: "high",
                explanation: {
                    type: client_1.AiExplanationType.PRICING_EXPLANATION,
                    text: "Цена — ключевой фактор спроса и конверсии.",
                    bullets: [
                        `Текущая цена: ${pricing.currentPrice} ${pricing.currency}/мес`,
                        `Рекомендация: ${pricing.recommendedPrice} ${pricing.currency}/мес`,
                        ...(pricing.rationale ?? []),
                    ],
                },
            });
        }
        if (risk.riskLevel !== "low") {
            actions.push({
                key: "reduce_risk",
                title: "Снизить риск",
                impact: "medium",
                explanation: {
                    type: client_1.AiExplanationType.RISK_EXPLANATION,
                    text: "Чем выше риск, тем чаще отмены/проблемы и тем ниже доверие.",
                    bullets: risk.reasons,
                },
            });
        }
        const result = {
            listingId: dto.listingId,
            actions,
            signals: {
                quality,
                pricing,
                risk,
            },
        };
        await this.prisma.aiEvent.create({
            data: {
                type: client_1.AiEventType.AI_RECOMMENDATIONS,
                listingId: dto.listingId,
                payload: this.toJson(result),
            },
        });
        return result;
    }
    async assistant(dto) {
        const result = await this.assistantSvc.reply(dto);
        await this.prisma.aiEvent.create({
            data: {
                type: client_1.AiEventType.AI_ASSISTANT,
                userId: dto.context?.userId,
                payload: this.toJson({
                    role: dto.role,
                    message: dto.message,
                    context: dto.context ? { userId: dto.context.userId, city: dto.context.city } : null,
                    extra: dto.extra ?? null,
                    result,
                }),
            },
        });
        return result;
    }
};
exports.AiOrchestratorService = AiOrchestratorService;
exports.AiOrchestratorService = AiOrchestratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_search_service_1.AiSearchService,
        ai_quality_service_1.AiQualityService,
        ai_pricing_service_1.AiPricingService,
        ai_risk_service_1.AiRiskService,
        ai_assistant_service_1.AiAssistantService])
], AiOrchestratorService);
