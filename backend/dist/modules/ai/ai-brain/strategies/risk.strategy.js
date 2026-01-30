"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskStrategy = void 0;
const common_1 = require("@nestjs/common");
let RiskStrategy = class RiskStrategy {
    calculate(context) {
        const factors = [];
        let score = 10;
        if (context.ownerStatus !== 'ACTIVE') {
            score += 40;
            factors.push('Владелец не в статусе ACTIVE');
        }
        const descLen = context.description?.length ?? 0;
        if (descLen < 50) {
            score += 15;
            factors.push('Короткое описание — риск недопонимания условий');
        }
        else if (descLen < 100) {
            score += 5;
            factors.push('Описание могло бы быть подробнее');
        }
        if (!context.hasCoordinates) {
            score += 10;
            factors.push('Нет координат — сложнее верифицировать локацию');
        }
        if (context.photosCount === 0) {
            score += 20;
            factors.push('Нет фотографий — высокий риск несоответствия');
        }
        else if (context.photosCount < 3) {
            score += 10;
            factors.push('Мало фотографий — рекомендуется добавить больше');
        }
        if (context.basePrice < 1000) {
            score += 15;
            factors.push('Подозрительно низкая цена');
        }
        if (context.reviewsCount === 0 && context.bookingsCount === 0) {
            score += 5;
            factors.push('Новое объявление без истории бронирований');
        }
        if (context.reviewsCount > 0 && context.avgRating < 3.5) {
            score += 15;
            factors.push('Низкий рейтинг по отзывам');
        }
        score = Math.max(0, Math.min(100, score));
        let level;
        if (score >= 60) {
            level = 'high';
        }
        else if (score >= 35) {
            level = 'medium';
        }
        else {
            level = 'low';
        }
        return { score, level, factors };
    }
};
exports.RiskStrategy = RiskStrategy;
exports.RiskStrategy = RiskStrategy = __decorate([
    (0, common_1.Injectable)()
], RiskStrategy);
