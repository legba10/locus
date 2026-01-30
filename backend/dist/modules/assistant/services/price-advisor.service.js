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
exports.PriceAdvisorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PriceAdvisorService = class PriceAdvisorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.cityAvgPrices = {
            'Москва': 4500,
            'Moscow': 4500,
            'Санкт-Петербург': 3800,
            'Saint Petersburg': 3800,
            'Сочи': 5500,
            'Sochi': 5500,
            'Казань': 3000,
            'Kazan': 3000,
            'default': 3500,
        };
    }
    async getRecommendation(listing) {
        const currentPrice = listing.basePrice;
        const city = listing.city;
        const avgPrice = await this.calculateMarketPrice(city, listing);
        const adjustedPrice = this.adjustPriceForFeatures(avgPrice, listing);
        const diffPercent = Math.round(((currentPrice - adjustedPrice) / adjustedPrice) * 100);
        let position;
        if (diffPercent < -10) {
            position = 'below_market';
        }
        else if (diffPercent > 10) {
            position = 'above_market';
        }
        else {
            position = 'market';
        }
        const reasoning = this.generateReasoning(listing, adjustedPrice, position);
        return {
            recommended: Math.round(adjustedPrice),
            position,
            diffPercent,
            reasoning,
        };
    }
    async calculateMarketPrice(city, listing) {
        const similarListings = await this.prisma.listing.findMany({
            where: {
                city,
                status: 'PUBLISHED',
                id: { not: listing.id },
            },
            select: { basePrice: true },
            take: 50,
        });
        if (similarListings.length >= 5) {
            const prices = similarListings.map(l => l.basePrice).sort((a, b) => a - b);
            const mid = Math.floor(prices.length / 2);
            const lo = prices[mid - 1] ?? 0;
            const hi = prices[mid] ?? 0;
            return prices.length % 2 ? hi : (lo + hi) / 2;
        }
        return this.cityAvgPrices[city] ?? this.cityAvgPrices['default'] ?? 0;
    }
    adjustPriceForFeatures(basePrice, listing) {
        let multiplier = 1.0;
        if (listing.capacityGuests > 4) {
            multiplier += 0.15;
        }
        else if (listing.capacityGuests > 2) {
            multiplier += 0.08;
        }
        if (listing.bedrooms > 2) {
            multiplier += 0.12;
        }
        else if (listing.bedrooms > 1) {
            multiplier += 0.06;
        }
        const photosCount = listing.photos?.length ?? 0;
        if (photosCount >= 10) {
            multiplier += 0.05;
        }
        const reviews = listing.reviews ?? [];
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            if (avgRating >= 4.5) {
                multiplier += 0.1;
            }
            else if (avgRating >= 4) {
                multiplier += 0.05;
            }
            else if (avgRating < 3.5) {
                multiplier -= 0.1;
            }
        }
        const amenitiesCount = listing.amenities?.length ?? 0;
        if (amenitiesCount >= 8) {
            multiplier += 0.08;
        }
        else if (amenitiesCount >= 5) {
            multiplier += 0.04;
        }
        return basePrice * multiplier;
    }
    generateReasoning(listing, recommendedPrice, position) {
        const reasons = [];
        if (position === 'below_market') {
            reasons.push('Ваша цена ниже рыночной — отлично для привлечения гостей');
            reasons.push('Рассмотрите повышение после получения положительных отзывов');
        }
        else if (position === 'above_market') {
            reasons.push('Цена выше средней по рынку');
            reasons.push('Для конкурентоспособности рекомендуем снизить до ' + Math.round(recommendedPrice) + ' ₽');
        }
        else {
            reasons.push('Цена соответствует рынку');
        }
        if (listing.capacityGuests > 4) {
            reasons.push('Большая вместимость позволяет устанавливать цену выше');
        }
        const reviews = listing.reviews ?? [];
        if (reviews.length > 5) {
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            if (avgRating >= 4.5) {
                reasons.push('Высокий рейтинг оправдывает премиальную цену');
            }
        }
        return reasons;
    }
};
exports.PriceAdvisorService = PriceAdvisorService;
exports.PriceAdvisorService = PriceAdvisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PriceAdvisorService);
