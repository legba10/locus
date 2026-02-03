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
exports.InsightsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const score_engine_1 = require("./engines/score.engine");
const price_engine_1 = require("./engines/price.engine");
const explanation_engine_1 = require("./engines/explanation.engine");
const recommendation_engine_1 = require("./engines/recommendation.engine");
let InsightsService = class InsightsService {
    constructor(prisma, scoreEngine, priceEngine, explainer, recommender) {
        this.prisma = prisma;
        this.scoreEngine = scoreEngine;
        this.priceEngine = priceEngine;
        this.explainer = explainer;
        this.recommender = recommender;
    }
    async getInsight(listingId) {
        const cached = await this.prisma.listingInsight.findUnique({
            where: { listingId },
        });
        if (cached) {
            return this.formatInsight(cached);
        }
        return this.calculateInsight(listingId);
    }
    async recalculateInsight(listingId) {
        return this.calculateInsight(listingId);
    }
    async calculateInsight(listingId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                photos: true,
                amenities: { include: { amenity: true } },
                reviews: true,
                bookings: { where: { status: 'CONFIRMED' } },
            },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Объявление не найдено');
        }
        const scoreResult = this.scoreEngine.calculate(listing);
        const priceResult = await this.priceEngine.analyze(listing);
        const explanation = this.explainer.generate(listing, scoreResult, priceResult);
        const recommendations = this.recommender.generate(listing, scoreResult, priceResult);
        const insight = await this.prisma.listingInsight.upsert({
            where: { listingId },
            create: {
                listingId,
                score: scoreResult.score,
                verdict: scoreResult.verdict,
                priceDiff: priceResult.diff,
                pros: explanation.pros,
                cons: explanation.cons,
                risks: explanation.risks,
                demand: priceResult.demand,
                bookingProbability: recommendations.bookingProbability,
                recommendedPrice: priceResult.recommended,
                tips: recommendations.tips,
            },
            update: {
                score: scoreResult.score,
                verdict: scoreResult.verdict,
                priceDiff: priceResult.diff,
                pros: explanation.pros,
                cons: explanation.cons,
                risks: explanation.risks,
                demand: priceResult.demand,
                bookingProbability: recommendations.bookingProbability,
                recommendedPrice: priceResult.recommended,
                tips: recommendations.tips,
                updatedAt: new Date(),
            },
        });
        return this.formatInsight(insight);
    }
    formatInsight(insight) {
        return {
            id: insight.id,
            listingId: insight.listingId,
            score: insight.score,
            verdict: insight.verdict,
            priceDiff: insight.priceDiff,
            pros: insight.pros ?? [],
            cons: insight.cons ?? [],
            risks: insight.risks ?? [],
            demand: insight.demand,
            bookingProbability: insight.bookingProbability,
            recommendedPrice: insight.recommendedPrice,
            tips: insight.tips ?? [],
        };
    }
};
exports.InsightsService = InsightsService;
exports.InsightsService = InsightsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        score_engine_1.ScoreEngine,
        price_engine_1.PriceEngine,
        explanation_engine_1.ExplanationEngine,
        recommendation_engine_1.RecommendationEngine])
], InsightsService);
//# sourceMappingURL=insights.service.js.map