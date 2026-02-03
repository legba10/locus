"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAnalyzer = void 0;
const common_1 = require("@nestjs/common");
let RiskAnalyzer = class RiskAnalyzer {
    analyze(input) {
        const risks = [];
        let riskScore = 0;
        const photosCount = input.photos?.length ?? 0;
        if (photosCount === 0) {
            risks.push('Нет фотографий — сложно оценить жильё');
            riskScore += 30;
        }
        else if (photosCount < 3) {
            risks.push('Мало фотографий');
            riskScore += 15;
        }
        const descLength = input.description?.length ?? 0;
        if (descLength < 30) {
            risks.push('Очень короткое описание');
            riskScore += 20;
        }
        else if (descLength < 100) {
            risks.push('Описание недостаточно подробное');
            riskScore += 10;
        }
        const reviews = input.reviews ?? [];
        if (reviews.length === 0) {
            risks.push('Нет отзывов от гостей');
            riskScore += 10;
        }
        else {
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            if (avgRating < 3.0) {
                risks.push('Низкий рейтинг по отзывам');
                riskScore += 20;
            }
            else if (avgRating < 3.5) {
                risks.push('Рейтинг ниже среднего');
                riskScore += 10;
            }
        }
        if (!input.coordinates?.lat || !input.coordinates?.lng) {
            risks.push('Не указано точное местоположение');
            riskScore += 10;
        }
        if (input.price < 500) {
            risks.push('Подозрительно низкая цена');
            riskScore += 15;
        }
        if (input.ownerBookingsCount === 0) {
            risks.push('Владелец ещё не сдавал жильё');
            riskScore += 5;
        }
        riskScore = Math.min(100, riskScore);
        let level;
        if (riskScore >= 40) {
            level = 'high';
        }
        else if (riskScore >= 20) {
            level = 'medium';
        }
        else {
            level = 'low';
        }
        return { risks, level, score: riskScore };
    }
};
exports.RiskAnalyzer = RiskAnalyzer;
exports.RiskAnalyzer = RiskAnalyzer = __decorate([
    (0, common_1.Injectable)()
], RiskAnalyzer);
//# sourceMappingURL=risk.analyzer.js.map