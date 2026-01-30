"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityAnalyzer = void 0;
const common_1 = require("@nestjs/common");
let QualityAnalyzer = class QualityAnalyzer {
    analyze(input) {
        const factors = [];
        let totalScore = 0;
        const photosCount = input.photos?.length ?? 0;
        const photosScore = Math.min(25, photosCount * 5);
        factors.push({ name: 'Фотографии', score: photosScore, maxScore: 25 });
        totalScore += photosScore;
        const descLength = input.description?.length ?? 0;
        let descScore = 0;
        if (descLength > 500)
            descScore = 20;
        else if (descLength > 200)
            descScore = 15;
        else if (descLength > 50)
            descScore = 8;
        else
            descScore = 3;
        factors.push({ name: 'Описание', score: descScore, maxScore: 20 });
        totalScore += descScore;
        const amenitiesCount = input.amenities?.length ?? 0;
        const amenitiesScore = Math.min(15, amenitiesCount * 2);
        factors.push({ name: 'Удобства', score: amenitiesScore, maxScore: 15 });
        totalScore += amenitiesScore;
        const reviews = input.reviews ?? [];
        let reviewsScore = 0;
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            reviewsScore = Math.round(avgRating * 4);
        }
        factors.push({ name: 'Отзывы', score: reviewsScore, maxScore: 20 });
        totalScore += reviewsScore;
        let profileScore = 0;
        if (input.address)
            profileScore += 3;
        if (input.coordinates?.lat && input.coordinates?.lng)
            profileScore += 3;
        if (input.houseRules)
            profileScore += 2;
        profileScore = Math.min(10, profileScore + 2);
        factors.push({ name: 'Полнота информации', score: profileScore, maxScore: 10 });
        totalScore += profileScore;
        const bookingsCount = input.bookings?.length ?? 0;
        const bookingsScore = Math.min(10, bookingsCount);
        factors.push({ name: 'Опыт сдачи', score: bookingsScore, maxScore: 10 });
        totalScore += bookingsScore;
        totalScore = Math.max(0, Math.min(100, totalScore));
        let label;
        if (totalScore >= 80)
            label = 'excellent';
        else if (totalScore >= 60)
            label = 'good';
        else if (totalScore >= 40)
            label = 'average';
        else
            label = 'needs_improvement';
        return { score: totalScore, label, factors };
    }
    generatePros(input, qualityResult) {
        const pros = [];
        const photosCount = input.photos?.length ?? 0;
        if (photosCount >= 8) {
            pros.push('Много качественных фотографий');
        }
        else if (photosCount >= 5) {
            pros.push('Достаточно фотографий для оценки');
        }
        const descLength = input.description?.length ?? 0;
        if (descLength > 300) {
            pros.push('Подробное описание жилья');
        }
        const amenitiesCount = input.amenities?.length ?? 0;
        if (amenitiesCount >= 8) {
            pros.push('Много удобств');
        }
        else if (amenitiesCount >= 5) {
            pros.push('Хороший набор удобств');
        }
        const reviews = input.reviews ?? [];
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            if (avgRating >= 4.5) {
                pros.push('Отличные отзывы гостей');
            }
            else if (avgRating >= 4) {
                pros.push('Хорошие отзывы');
            }
        }
        if (input.coordinates?.lat && input.coordinates?.lng) {
            pros.push('Точное местоположение на карте');
        }
        const bookingsCount = input.bookings?.length ?? 0;
        if (bookingsCount >= 10) {
            pros.push('Проверенный владелец с опытом сдачи');
        }
        else if (bookingsCount >= 3) {
            pros.push('Есть успешный опыт сдачи');
        }
        if (pros.length === 0) {
            if (qualityResult.score >= 50) {
                pros.push('Базовая информация заполнена');
            }
        }
        return pros.slice(0, 5);
    }
};
exports.QualityAnalyzer = QualityAnalyzer;
exports.QualityAnalyzer = QualityAnalyzer = __decorate([
    (0, common_1.Injectable)()
], QualityAnalyzer);
