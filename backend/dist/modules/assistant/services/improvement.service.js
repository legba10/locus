"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImprovementService = void 0;
const common_1 = require("@nestjs/common");
let ImprovementService = class ImprovementService {
    getSuggestions(listing) {
        const suggestions = [];
        const photosCount = listing.photos?.length ?? 0;
        if (photosCount === 0) {
            suggestions.push({
                type: 'photos',
                description: 'Добавьте фотографии объекта. Объявления с фото получают в 10 раз больше просмотров.',
                impact: 'high',
                potentialBoost: 25,
            });
        }
        else if (photosCount < 5) {
            suggestions.push({
                type: 'photos',
                description: `Добавьте больше фотографий (сейчас ${photosCount}, рекомендуем минимум 5). Покажите все комнаты, кухню, ванную и вид из окна.`,
                impact: 'high',
                potentialBoost: 15,
            });
        }
        const descLength = listing.description?.length ?? 0;
        if (descLength < 50) {
            suggestions.push({
                type: 'description',
                description: 'Напишите подробное описание (минимум 200 символов). Расскажите о преимуществах района, транспортной доступности и особенностях жилья.',
                impact: 'high',
                potentialBoost: 20,
            });
        }
        else if (descLength < 200) {
            suggestions.push({
                type: 'description',
                description: 'Расширьте описание. Добавьте информацию о районе, ближайших магазинах, кафе и достопримечательностях.',
                impact: 'medium',
                potentialBoost: 10,
            });
        }
        const amenitiesCount = listing.amenities?.length ?? 0;
        if (amenitiesCount === 0) {
            suggestions.push({
                type: 'amenities',
                description: 'Укажите доступные удобства: Wi-Fi, кондиционер, стиральная машина, парковка и другие.',
                impact: 'high',
                potentialBoost: 15,
            });
        }
        else if (amenitiesCount < 5) {
            suggestions.push({
                type: 'amenities',
                description: 'Добавьте больше удобств в список. Гости часто ищут конкретные удобства при бронировании.',
                impact: 'medium',
                potentialBoost: 8,
            });
        }
        if (!listing.lat || !listing.lng) {
            suggestions.push({
                type: 'location',
                description: 'Укажите точное местоположение на карте. Это поможет гостям оценить расположение.',
                impact: 'medium',
                potentialBoost: 5,
            });
        }
        if (!listing.houseRules) {
            suggestions.push({
                type: 'rules',
                description: 'Добавьте правила проживания: время заезда/выезда, разрешены ли животные, можно ли курить.',
                impact: 'low',
                potentialBoost: 3,
            });
        }
        if (listing.basePrice < 1000) {
            suggestions.push({
                type: 'price',
                description: 'Слишком низкая цена может вызвать недоверие у гостей. Убедитесь, что цена адекватна.',
                impact: 'medium',
                potentialBoost: 5,
            });
        }
        const reviewsCount = listing.reviews?.length ?? 0;
        if (reviewsCount === 0) {
            suggestions.push({
                type: 'reviews',
                description: 'Получите первые отзывы! Предложите скидку первым гостям в обмен на честный отзыв.',
                impact: 'high',
                potentialBoost: 10,
            });
        }
        suggestions.sort((a, b) => {
            const impactOrder = { high: 0, medium: 1, low: 2 };
            return impactOrder[a.impact] - impactOrder[b.impact];
        });
        return suggestions;
    }
    calculatePotentialRating(listing, suggestions) {
        const currentRating = listing.analysis?.locusRating ?? 0;
        const totalBoost = suggestions.reduce((sum, s) => sum + s.potentialBoost, 0);
        return Math.min(100, currentRating + totalBoost);
    }
};
exports.ImprovementService = ImprovementService;
exports.ImprovementService = ImprovementService = __decorate([
    (0, common_1.Injectable)()
], ImprovementService);
