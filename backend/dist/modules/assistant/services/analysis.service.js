"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const common_1 = require("@nestjs/common");
let AnalysisService = class AnalysisService {
    calculateLocusRating(listing) {
        let score = 0;
        const photosCount = listing.photos?.length ?? 0;
        score += Math.min(25, photosCount * 5);
        const descLength = listing.description?.length ?? 0;
        if (descLength > 500)
            score += 20;
        else if (descLength > 200)
            score += 15;
        else if (descLength > 50)
            score += 8;
        else
            score += 3;
        const amenitiesCount = listing.amenities?.length ?? 0;
        score += Math.min(15, amenitiesCount * 2);
        const reviews = listing.reviews ?? [];
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            score += Math.round(avgRating * 4);
        }
        if (listing.addressLine)
            score += 3;
        if (listing.lat && listing.lng)
            score += 3;
        if (listing.houseRules)
            score += 2;
        if (listing.capacityGuests > 0)
            score += 2;
        const bookingsCount = listing.bookings?.length ?? 0;
        score += Math.min(10, bookingsCount);
        score = Math.max(0, Math.min(100, score));
        let label;
        if (score >= 80)
            label = 'excellent';
        else if (score >= 60)
            label = 'good';
        else if (score >= 40)
            label = 'average';
        else
            label = 'needs_improvement';
        return { score, label };
    }
    assessRisks(listing) {
        const factors = [];
        let riskScore = 0;
        if (!listing.photos || listing.photos.length === 0) {
            factors.push('Отсутствуют фотографии');
            riskScore += 30;
        }
        else if (listing.photos.length < 3) {
            factors.push('Мало фотографий (менее 3)');
            riskScore += 15;
        }
        if (!listing.description || listing.description.length < 50) {
            factors.push('Слишком короткое описание');
            riskScore += 20;
        }
        if (!listing.reviews || listing.reviews.length === 0) {
            factors.push('Нет отзывов');
            riskScore += 10;
        }
        const reviews = listing.reviews ?? [];
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            if (avgRating < 3.5) {
                factors.push('Низкий средний рейтинг');
                riskScore += 15;
            }
        }
        if (!listing.lat || !listing.lng) {
            factors.push('Не указано точное местоположение');
            riskScore += 10;
        }
        if (listing.basePrice < 500) {
            factors.push('Подозрительно низкая цена');
            riskScore += 15;
        }
        let level;
        if (riskScore >= 40)
            level = 'high';
        else if (riskScore >= 20)
            level = 'medium';
        else
            level = 'low';
        return { level, factors };
    }
    generateExplanation(listing, rating, priceAdvice, riskAssessment) {
        const pros = [];
        const cons = [];
        const tips = [];
        if (listing.photos && listing.photos.length >= 5) {
            pros.push('Много качественных фотографий');
        }
        if (listing.description && listing.description.length > 200) {
            pros.push('Подробное описание жилья');
        }
        if (listing.amenities && listing.amenities.length >= 5) {
            pros.push('Много удобств');
        }
        if (listing.reviews && listing.reviews.length > 0) {
            const avgRating = listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length;
            if (avgRating >= 4.5) {
                pros.push('Отличные отзывы гостей');
            }
            else if (avgRating >= 4) {
                pros.push('Хорошие отзывы');
            }
        }
        if (priceAdvice.position === 'below_market') {
            pros.push('Цена ниже рынка');
        }
        if (!listing.photos || listing.photos.length < 3) {
            cons.push('Мало фотографий');
        }
        if (!listing.description || listing.description.length < 100) {
            cons.push('Краткое описание');
        }
        if (priceAdvice.position === 'above_market') {
            cons.push('Цена выше средней по рынку');
        }
        if (riskAssessment.level === 'high') {
            cons.push('Есть факторы риска');
        }
        if (!listing.photos || listing.photos.length < 5) {
            tips.push('Добавьте больше фотографий (минимум 5)');
        }
        if (!listing.description || listing.description.length < 200) {
            tips.push('Расширьте описание, добавьте детали о районе и инфраструктуре');
        }
        if (!listing.amenities || listing.amenities.length < 3) {
            tips.push('Укажите все доступные удобства');
        }
        if (!listing.lat || !listing.lng) {
            tips.push('Добавьте точные координаты для удобства гостей');
        }
        let summary;
        if (rating.score >= 80) {
            summary = 'Отличное объявление! Высокие шансы на бронирование.';
        }
        else if (rating.score >= 60) {
            summary = 'Хорошее объявление. Небольшие улучшения повысят привлекательность.';
        }
        else if (rating.score >= 40) {
            summary = 'Объявление требует доработки для повышения конкурентоспособности.';
        }
        else {
            summary = 'Рекомендуем значительно улучшить объявление для привлечения гостей.';
        }
        return { summary, pros, cons, tips };
    }
    getRatingDescription(label) {
        const descriptions = {
            excellent: 'Отличное объявление',
            good: 'Хорошее объявление',
            average: 'Среднее объявление',
            needs_improvement: 'Требует улучшения',
        };
        return descriptions[label] ?? 'Не оценено';
    }
};
exports.AnalysisService = AnalysisService;
exports.AnalysisService = AnalysisService = __decorate([
    (0, common_1.Injectable)()
], AnalysisService);
//# sourceMappingURL=analysis.service.js.map