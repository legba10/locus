"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipsGenerator = void 0;
const common_1 = require("@nestjs/common");
let TipsGenerator = class TipsGenerator {
    generate(input) {
        const tips = [];
        const photosCount = input.photos?.length ?? 0;
        if (photosCount === 0) {
            tips.push({
                text: 'Добавьте фотографии — объявления с фото получают в 10 раз больше просмотров',
                impact: 'high',
                potentialBoost: 25,
            });
        }
        else if (photosCount < 5) {
            tips.push({
                text: `Добавьте больше фотографий (сейчас ${photosCount}). Покажите все комнаты, кухню, ванную и вид из окна`,
                impact: 'high',
                potentialBoost: 15,
            });
        }
        else if (photosCount < 8) {
            tips.push({
                text: 'Добавьте фото окрестностей и инфраструктуры района',
                impact: 'medium',
                potentialBoost: 5,
            });
        }
        const descLength = input.description?.length ?? 0;
        if (descLength < 50) {
            tips.push({
                text: 'Напишите подробное описание (минимум 200 символов). Расскажите о районе, транспорте и особенностях жилья',
                impact: 'high',
                potentialBoost: 20,
            });
        }
        else if (descLength < 200) {
            tips.push({
                text: 'Расширьте описание. Добавьте информацию о ближайших магазинах, кафе и достопримечательностях',
                impact: 'medium',
                potentialBoost: 10,
            });
        }
        const amenitiesCount = input.amenities?.length ?? 0;
        if (amenitiesCount === 0) {
            tips.push({
                text: 'Укажите доступные удобства: Wi-Fi, кондиционер, стиральная машина, парковка',
                impact: 'high',
                potentialBoost: 15,
            });
        }
        else if (amenitiesCount < 5) {
            tips.push({
                text: 'Добавьте больше удобств. Гости часто ищут конкретные удобства при бронировании',
                impact: 'medium',
                potentialBoost: 8,
            });
        }
        if (!input.coordinates?.lat || !input.coordinates?.lng) {
            tips.push({
                text: 'Укажите точное местоположение на карте — это важно для гостей',
                impact: 'medium',
                potentialBoost: 5,
            });
        }
        if (!input.houseRules) {
            tips.push({
                text: 'Добавьте правила проживания: время заезда/выезда, правила для животных и курения',
                impact: 'low',
                potentialBoost: 3,
            });
        }
        if (input.pricePosition === 'above_market') {
            tips.push({
                text: 'Ваша цена выше рынка. Снизьте для увеличения бронирований или улучшите объявление',
                impact: 'high',
                potentialBoost: 0,
            });
        }
        else if (input.pricePosition === 'below_market' && input.qualityScore >= 70) {
            tips.push({
                text: 'У вас хорошее объявление — можете немного повысить цену',
                impact: 'low',
                potentialBoost: 0,
            });
        }
        const reviewsCount = input.reviews?.length ?? 0;
        if (reviewsCount === 0) {
            tips.push({
                text: 'Получите первые отзывы! Предложите небольшую скидку первым гостям',
                impact: 'high',
                potentialBoost: 10,
            });
        }
        tips.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.impact] - order[b.impact];
        });
        return tips.slice(0, 5).map(t => t.text);
    }
    generateSummary(qualityScore, pricePosition, demandLevel) {
        if (qualityScore >= 80 && pricePosition !== 'above_market') {
            return 'Отличное предложение! Высокие шансы на бронирование.';
        }
        if (qualityScore >= 60) {
            if (pricePosition === 'above_market') {
                return 'Хорошее жильё, но цена выше рынка. Рассмотрите корректировку.';
            }
            return 'Хорошее предложение. Небольшие улучшения повысят привлекательность.';
        }
        if (qualityScore >= 40) {
            return 'Объявление требует доработки для повышения конкурентоспособности.';
        }
        return 'Рекомендуем значительно улучшить объявление для привлечения гостей.';
    }
};
exports.TipsGenerator = TipsGenerator;
exports.TipsGenerator = TipsGenerator = __decorate([
    (0, common_1.Injectable)()
], TipsGenerator);
