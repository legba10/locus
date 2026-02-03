"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationEngine = void 0;
const common_1 = require("@nestjs/common");
let RecommendationEngine = class RecommendationEngine {
    generate(listing, score, price) {
        const tips = [];
        let probability = 50;
        if (score.score >= 80)
            probability += 20;
        else if (score.score >= 60)
            probability += 10;
        else if (score.score < 40)
            probability -= 15;
        if (price.position === 'below_market')
            probability += 15;
        else if (price.position === 'above_market')
            probability -= 10;
        if (price.demand === 'high')
            probability += 10;
        else if (price.demand === 'low')
            probability -= 10;
        probability = Math.max(10, Math.min(95, probability));
        const photosCount = listing.photos?.length ?? 0;
        if (photosCount < 5) {
            tips.push('Добавьте больше фотографий — это главное для привлечения гостей');
        }
        const descLength = listing.description?.length ?? 0;
        if (descLength < 200) {
            tips.push('Расширьте описание — расскажите о районе и особенностях');
        }
        const amenitiesCount = listing.amenities?.length ?? 0;
        if (amenitiesCount < 5) {
            tips.push('Укажите все доступные удобства');
        }
        if (!listing.lat || !listing.lng) {
            tips.push('Добавьте точное местоположение на карте');
        }
        if (price.position === 'above_market') {
            tips.push(`Снизьте цену до ${price.recommended} ₽ для увеличения бронирований`);
        }
        const mainRecommendation = this.getMainRecommendation(score, price);
        return {
            bookingProbability: probability / 100,
            tips: tips.slice(0, 5),
            mainRecommendation,
        };
    }
    getMainRecommendation(score, price) {
        if (score.score >= 80 && price.position !== 'above_market') {
            return 'Отличный вариант! Рекомендуем бронировать.';
        }
        if (score.score >= 80 && price.position === 'above_market') {
            return 'Хорошее жильё, но цена выше средней.';
        }
        if (score.score >= 60) {
            if (price.position === 'below_market') {
                return 'Хороший вариант с выгодной ценой.';
            }
            return 'Достойный вариант. Изучите детали.';
        }
        if (score.score >= 40) {
            return 'Средний вариант. Сравните с другими.';
        }
        return 'Объявление требует доработки.';
    }
};
exports.RecommendationEngine = RecommendationEngine;
exports.RecommendationEngine = RecommendationEngine = __decorate([
    (0, common_1.Injectable)()
], RecommendationEngine);
//# sourceMappingURL=recommendation.engine.js.map