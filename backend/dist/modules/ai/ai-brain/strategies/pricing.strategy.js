"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingStrategy = void 0;
const common_1 = require("@nestjs/common");
let PricingStrategy = class PricingStrategy {
    constructor() {
        this.cityAvgPrices = {
            'Moscow': 4500,
            'Москва': 4500,
            'Saint Petersburg': 3500,
            'Санкт-Петербург': 3500,
            'Kazan': 2500,
            'Казань': 2500,
            'Sochi': 5000,
            'Сочи': 5000,
            'default': 3000,
        };
    }
    calculate(context, demandScore) {
        const currentPrice = context.basePrice;
        const avgPrice = this.getAvgPrice(context.city);
        const demandMultiplier = 1 + (demandScore - 50) / 200;
        let recommendedPrice = Math.round(avgPrice * demandMultiplier);
        if (context.photosCount >= 5)
            recommendedPrice *= 1.05;
        if (context.avgRating >= 4.5)
            recommendedPrice *= 1.1;
        if (context.amenitiesCount >= 5)
            recommendedPrice *= 1.05;
        recommendedPrice = Math.round(recommendedPrice);
        const deltaPct = currentPrice > 0
            ? Math.round(((recommendedPrice - currentPrice) / currentPrice) * 100)
            : 0;
        let marketPosition;
        const deviation = currentPrice / avgPrice;
        if (deviation < 0.85) {
            marketPosition = 'below_market';
        }
        else if (deviation > 1.15) {
            marketPosition = 'above_market';
        }
        else {
            marketPosition = 'at_market';
        }
        let priceScore = 100;
        if (marketPosition === 'below_market') {
            priceScore = Math.max(50, 100 - Math.abs(deltaPct));
        }
        else if (marketPosition === 'above_market') {
            priceScore = Math.max(40, 100 - Math.abs(deltaPct) * 1.2);
        }
        return {
            recommendedPrice,
            deltaPct,
            marketPosition,
            priceScore: Math.round(priceScore),
        };
    }
    getAvgPrice(city) {
        return this.cityAvgPrices[city] ?? this.cityAvgPrices['default'] ?? 0;
    }
};
exports.PricingStrategy = PricingStrategy;
exports.PricingStrategy = PricingStrategy = __decorate([
    (0, common_1.Injectable)()
], PricingStrategy);
