"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandStrategy = void 0;
const common_1 = require("@nestjs/common");
let DemandStrategy = class DemandStrategy {
    constructor() {
        this.cityDemand = {
            'Moscow': 85,
            'Москва': 85,
            'Saint Petersburg': 80,
            'Санкт-Петербург': 80,
            'Sochi': 75,
            'Сочи': 75,
            'Kazan': 65,
            'Казань': 65,
            'default': 50,
        };
    }
    calculate(context) {
        let score = 0;
        const cityScore = (this.cityDemand[context.city] ?? this.cityDemand['default']) ?? 0.5;
        score += cityScore * 0.4;
        const bookingScore = Math.min(25, context.bookingsCount * 5);
        score += bookingScore;
        if (context.reviewsCount > 0) {
            const ratingBonus = (context.avgRating / 5) * 15;
            const reviewsBonus = Math.min(5, context.reviewsCount);
            score += ratingBonus + reviewsBonus;
        }
        if (context.photosCount >= 5)
            score += 5;
        if (context.description && context.description.length >= 150)
            score += 5;
        if (context.amenitiesCount >= 5)
            score += 5;
        const month = new Date().getMonth();
        if ([5, 6, 7, 11, 0].includes(month)) {
            score *= 1.1;
        }
        if ([2, 3, 10].includes(month)) {
            score *= 0.9;
        }
        if (context.basePrice > 0 && context.basePrice < 3000) {
            score += 5;
        }
        return Math.max(0, Math.min(100, Math.round(score)));
    }
};
exports.DemandStrategy = DemandStrategy;
exports.DemandStrategy = DemandStrategy = __decorate([
    (0, common_1.Injectable)()
], DemandStrategy);
//# sourceMappingURL=demand.strategy.js.map