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
    generateProsCons(listing, score, priceAnalysis) {
        const pros = [];
        const cons = [];
        const risks = [];
        const photosCount = listing.photos?.length ?? 0;
        if (photosCount >= 8) {
            pros.push('Много качественных фотографий');
        }
        else if (photosCount >= 5) {
            pros.push('Достаточно фотографий для оценки');
        }
        else if (photosCount < 3) {
            cons.push('Мало фотографий');
            if (photosCount === 0)
                risks.push('Нет фотографий — сложно оценить жильё');
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
        if (priceAnalysis.position === 'below_market') {
            pros.push(`Цена ниже рынка на ${Math.abs(priceAnalysis.diff)}%`);
        }
        else if (priceAnalysis.position === 'above_market') {
            cons.push(`Цена выше рынка на ${priceAnalysis.diff}%`);
        }
        if (listing.lat && listing.lng) {
            pros.push('Точное местоположение на карте');
        }
        else {
            cons.push('Не указано точное местоположение');
        }
        const bookingsCount = listing.bookings?.length ?? 0;
        if (bookingsCount >= 10) {
            pros.push('Проверенный владелец с опытом');
        }
        else if (bookingsCount === 0) {
            risks.push('Новый владелец без опыта сдачи');
        }
        return { pros: pros.slice(0, 5), cons: cons.slice(0, 3), risks: risks.slice(0, 3) };
    }
    generateRecommendation(score, priceAnalysis, demandAnalysis) {
        if (score >= 80 && priceAnalysis.position !== 'above_market') {
            return 'Отличный вариант! Рекомендуем бронировать.';
        }
        if (score >= 80 && priceAnalysis.position === 'above_market') {
            return 'Хорошее жильё, но цена выше средней. Попробуйте договориться о скидке.';
        }
        if (score >= 60) {
            if (demandAnalysis.level === 'high') {
                return 'Хороший вариант с высоким спросом. Бронируйте заранее.';
            }
            return 'Достойный вариант. Изучите детали перед бронированием.';
        }
        if (score >= 40) {
            return 'Средний вариант. Рекомендуем сравнить с другими предложениями.';
        }
        return 'Объявление требует доработки. Рассмотрите другие варианты.';
    }
    formatPriceText(priceAnalysis) {
        if (priceAnalysis.position === 'below_market') {
            return `Выгодная цена — на ${Math.abs(priceAnalysis.diff)}% ниже рынка`;
        }
        if (priceAnalysis.position === 'above_market') {
            return `Цена на ${priceAnalysis.diff}% выше средней по рынку`;
        }
        return 'Цена соответствует рынку';
    }
    generateTips(listing) {
        const tips = [];
        const photosCount = listing.photos?.length ?? 0;
        if (photosCount < 5) {
            tips.push('Добавьте больше фотографий — это главное для привлечения гостей');
        }
        const descLength = listing.description?.length ?? 0;
        if (descLength < 200) {
            tips.push('Расширьте описание — расскажите о районе и особенностях жилья');
        }
        const amenitiesCount = listing.amenities?.length ?? 0;
        if (amenitiesCount < 5) {
            tips.push('Укажите все доступные удобства');
        }
        if (!listing.lat || !listing.lng) {
            tips.push('Добавьте точное местоположение на карте');
        }
        const reviewsCount = listing.reviews?.length ?? 0;
        if (reviewsCount === 0) {
            tips.push('Получите первые отзывы — предложите скидку первым гостям');
        }
        return tips.slice(0, 5);
    }
    generateGrowthPotential(listing) {
        const growth = [];
        const photosCount = listing.photos?.length ?? 0;
        if (photosCount < 5) {
            growth.push({
                action: 'Добавьте 3-5 фотографий',
                impact: 'Повышение интереса гостей',
                percentIncrease: 25,
            });
        }
        const descLength = listing.description?.length ?? 0;
        if (descLength < 200) {
            growth.push({
                action: 'Расширьте описание до 300+ символов',
                impact: 'Больше доверия гостей',
                percentIncrease: 15,
            });
        }
        growth.push({
            action: 'Снизьте цену на 5%',
            impact: 'Больше бронирований',
            percentIncrease: 18,
        });
        return growth.slice(0, 3);
    }
};
exports.ExplanationEngine = ExplanationEngine;
exports.ExplanationEngine = ExplanationEngine = __decorate([
    (0, common_1.Injectable)()
], ExplanationEngine);
//# sourceMappingURL=explanation.engine.js.map