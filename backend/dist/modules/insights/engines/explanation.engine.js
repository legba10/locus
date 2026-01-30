"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplanationEngine = void 0;
const common_1 = require("@nestjs/common");
let ExplanationEngine = class ExplanationEngine {
    generate(listing, score, price) {
        const pros = [];
        const cons = [];
        const risks = [];
        const photosCount = listing.photos?.length ?? 0;
        if (photosCount >= 8) {
            pros.push('Много качественных фотографий');
        }
        else if (photosCount >= 5) {
            pros.push('Достаточно фотографий');
        }
        else if (photosCount < 3) {
            cons.push('Мало фотографий');
            if (photosCount === 0)
                risks.push('Нет фотографий — сложно оценить');
        }
        const descLength = listing.description?.length ?? 0;
        if (descLength > 300) {
            pros.push('Подробное описание');
        }
        else if (descLength < 100) {
            cons.push('Краткое описание');
        }
        const amenitiesCount = listing.amenities?.length ?? 0;
        if (amenitiesCount >= 8) {
            pros.push('Много удобств');
        }
        else if (amenitiesCount >= 5) {
            pros.push('Хороший набор удобств');
        }
        else if (amenitiesCount < 3) {
            cons.push('Мало удобств');
        }
        const reviews = listing.reviews ?? [];
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            if (avgRating >= 4.5) {
                pros.push('Отличные отзывы гостей');
            }
            else if (avgRating >= 4) {
                pros.push('Хорошие отзывы');
            }
            else if (avgRating < 3.5) {
                risks.push('Низкий рейтинг по отзывам');
            }
        }
        else {
            cons.push('Пока нет отзывов');
        }
        if (price.position === 'below_market') {
            pros.push(`Выгодная цена — ${price.positionText.toLowerCase()}`);
        }
        else if (price.position === 'above_market') {
            cons.push(price.positionText);
        }
        if (listing.lat && listing.lng) {
            pros.push('Точное местоположение на карте');
        }
        else {
            cons.push('Не указано точное местоположение');
        }
        const bookingsCount = listing.bookings?.length ?? 0;
        if (bookingsCount >= 10) {
            pros.push('Проверенный владелец');
        }
        else if (bookingsCount === 0) {
            risks.push('Новый владелец без опыта');
        }
        return {
            pros: pros.slice(0, 5),
            cons: cons.slice(0, 3),
            risks: risks.slice(0, 3),
        };
    }
};
exports.ExplanationEngine = ExplanationEngine;
exports.ExplanationEngine = ExplanationEngine = __decorate([
    (0, common_1.Injectable)()
], ExplanationEngine);
