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
var AiBrainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiBrainService = void 0;
const common_1 = require("@nestjs/common");
const quality_strategy_1 = require("./strategies/quality.strategy");
const pricing_strategy_1 = require("./strategies/pricing.strategy");
const risk_strategy_1 = require("./strategies/risk.strategy");
const demand_strategy_1 = require("./strategies/demand.strategy");
const explanation_generator_1 = require("./explainers/explanation.generator");
let AiBrainService = AiBrainService_1 = class AiBrainService {
    constructor(quality, pricing, risk, demand, explainer) {
        this.quality = quality;
        this.pricing = pricing;
        this.risk = risk;
        this.demand = demand;
        this.explainer = explainer;
        this.logger = new common_1.Logger(AiBrainService_1.name);
    }
    async calculateIntelligence(context) {
        this.logger.log(`Calculating intelligence for listing ${context.id}`);
        const qualityScore = this.quality.calculate(context);
        const demandScore = this.demand.calculate(context);
        const riskResult = this.risk.calculate(context);
        const pricingResult = this.pricing.calculate(context, demandScore);
        const completenessScore = this.calculateCompleteness(context);
        const bookingProbability = this.calculateBookingProbability(qualityScore, demandScore, riskResult.score, pricingResult.marketPosition);
        const explanation = this.explainer.generate({
            qualityScore,
            demandScore,
            riskScore: riskResult.score,
            riskFactors: riskResult.factors,
            pricingResult,
            completenessScore,
            bookingProbability,
        });
        return {
            qualityScore,
            demandScore,
            riskScore: riskResult.score,
            completenessScore,
            bookingProbability,
            recommendedPrice: pricingResult.recommendedPrice,
            priceDeltaPercent: pricingResult.deltaPct,
            marketPosition: pricingResult.marketPosition,
            riskLevel: riskResult.level,
            riskFactors: riskResult.factors,
            explanation,
        };
    }
    async recalculateQuality(context) {
        return this.quality.calculate(context);
    }
    async recalculateDemand(context) {
        return this.demand.calculate(context);
    }
    async recalculateRisk(context) {
        return this.risk.calculate(context);
    }
    calculateCompleteness(context) {
        let score = 0;
        const weights = {
            title: 10,
            description: 20,
            photos: 25,
            amenities: 15,
            coordinates: 15,
            price: 15,
        };
        if (context.title && context.title.length >= 10)
            score += weights.title;
        else if (context.title)
            score += weights.title * 0.5;
        const descLen = context.description?.length ?? 0;
        if (descLen >= 200)
            score += weights.description;
        else if (descLen >= 100)
            score += weights.description * 0.7;
        else if (descLen >= 50)
            score += weights.description * 0.4;
        else if (descLen > 0)
            score += weights.description * 0.2;
        if (context.photosCount >= 5)
            score += weights.photos;
        else if (context.photosCount >= 3)
            score += weights.photos * 0.7;
        else if (context.photosCount >= 1)
            score += weights.photos * 0.4;
        if (context.amenitiesCount >= 5)
            score += weights.amenities;
        else if (context.amenitiesCount >= 3)
            score += weights.amenities * 0.7;
        else if (context.amenitiesCount >= 1)
            score += weights.amenities * 0.4;
        if (context.hasCoordinates)
            score += weights.coordinates;
        if (context.basePrice > 0)
            score += weights.price;
        return Math.round(score);
    }
    calculateBookingProbability(quality, demand, risk, marketPosition) {
        let prob = (quality * 0.3 + demand * 0.4 + (100 - risk) * 0.3) / 100;
        if (marketPosition === 'below_market')
            prob *= 1.15;
        else if (marketPosition === 'above_market')
            prob *= 0.85;
        return Math.max(0.05, Math.min(0.95, prob));
    }
};
exports.AiBrainService = AiBrainService;
exports.AiBrainService = AiBrainService = AiBrainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [quality_strategy_1.QualityStrategy,
        pricing_strategy_1.PricingStrategy,
        risk_strategy_1.RiskStrategy,
        demand_strategy_1.DemandStrategy,
        explanation_generator_1.ExplanationGenerator])
], AiBrainService);
//# sourceMappingURL=ai-brain.service.js.map