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
exports.PriceAdvisor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PriceAdvisor = class PriceAdvisor {
    constructor(prisma) {
        this.prisma = prisma;
        this.cityBasePrices = {
            'Москва': 4500,
            'Moscow': 4500,
            'Санкт-Петербург': 3800,
            'Saint Petersburg': 3800,
            'Сочи': 5500,
            'Sochi': 5500,
            'Казань': 3000,
            'Kazan': 3000,
            'Краснодар': 3200,
            'Екатеринбург': 2800,
            'Новосибирск': 2600,
            'default': 3500,
        };
    }
    async analyze(input) {
        const marketPrice = await this.calculateMarketPrice(input);
        const adjustedPrice = this.adjustForFeatures(marketPrice, input);
        const diffPercent = Math.round(((input.currentPrice - adjustedPrice) / adjustedPrice) * 100);
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
        const reasoning = this.generateReasoning(input, adjustedPrice, position);
        return {
            recommended: Math.round(adjustedPrice),
            position,
            diffPercent,
            reasoning,
        };
    }
    async calculateMarketPrice(input) {
        const similar = await this.prisma.listing.findMany({
            where: {
                city: input.city,
                status: 'PUBLISHED',
                id: { not: input.listingId },
            },
            select: { basePrice: true },
            take: 50,
        });
        if (similar.length >= 5) {
            const prices = similar.map(l => l.basePrice).sort((a, b) => a - b);
            const mid = Math.floor(prices.length / 2);
            const lo = prices[mid - 1] ?? 0;
            const hi = prices[mid] ?? 0;
            return prices.length % 2 ? hi : (lo + hi) / 2;
        }
        return this.cityBasePrices[input.city] ?? this.cityBasePrices['default'] ?? 0;
    }
    adjustForFeatures(basePrice, input) {
        let multiplier = 1.0;
        if (input.capacityGuests > 6) {
            multiplier += 0.20;
        }
        else if (input.capacityGuests > 4) {
            multiplier += 0.12;
        }
        else if (input.capacityGuests > 2) {
            multiplier += 0.06;
        }
        if (input.bedrooms > 3) {
            multiplier += 0.15;
        }
        else if (input.bedrooms > 2) {
            multiplier += 0.10;
        }
        else if (input.bedrooms > 1) {
            multiplier += 0.05;
        }
        const amenitiesCount = input.amenities?.length ?? 0;
        if (amenitiesCount >= 10) {
            multiplier += 0.10;
        }
        else if (amenitiesCount >= 6) {
            multiplier += 0.05;
        }
        const reviews = input.reviews ?? [];
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            if (avgRating >= 4.8) {
                multiplier += 0.12;
            }
            else if (avgRating >= 4.5) {
                multiplier += 0.08;
            }
            else if (avgRating >= 4.0) {
                multiplier += 0.04;
            }
            else if (avgRating < 3.5) {
                multiplier -= 0.10;
            }
        }
        return basePrice * multiplier;
    }
    generateReasoning(input, recommended, position) {
        const reasons = [];
        if (position === 'below_market') {
            reasons.push('Ваша цена ниже рыночной — это привлекает гостей');
            reasons.push('После получения положительных отзывов можно повысить');
        }
        else if (position === 'above_market') {
            reasons.push('Цена выше средней по рынку');
            reasons.push(`Рекомендуем: ${Math.round(recommended).toLocaleString('ru-RU')} ₽ за ночь`);
        }
        else {
            reasons.push('Цена соответствует рынку');
        }
        if (input.capacityGuests > 4) {
            reasons.push('Большая вместимость позволяет ставить цену выше');
        }
        const reviews = input.reviews ?? [];
        if (reviews.length >= 5) {
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            if (avgRating >= 4.5) {
                reasons.push('Высокий рейтинг оправдывает премиальную цену');
            }
        }
        return reasons;
    }
};
exports.PriceAdvisor = PriceAdvisor;
exports.PriceAdvisor = PriceAdvisor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PriceAdvisor);
//# sourceMappingURL=price.advisor.js.map