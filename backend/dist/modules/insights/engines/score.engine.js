"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreEngine = void 0;
const common_1 = require("@nestjs/common");
let ScoreEngine = class ScoreEngine {
    calculate(listing) {
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
            const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            score += Math.round(avgRating * 4);
        }
        if (listing.addressLine)
            score += 3;
        if (listing.lat && listing.lng)
            score += 3;
        if (listing.houseRules)
            score += 2;
        score += 2;
        const bookingsCount = listing.bookings?.length ?? 0;
        score += Math.min(10, bookingsCount);
        score = Math.max(0, Math.min(100, score));
        return {
            score,
            verdict: this.getVerdict(score),
            verdictText: this.getVerdictText(score),
        };
    }
    getVerdict(score) {
        if (score >= 80)
            return 'excellent';
        if (score >= 60)
            return 'good';
        if (score >= 40)
            return 'average';
        return 'bad';
    }
    getVerdictText(score) {
        if (score >= 80)
            return 'Отличный вариант';
        if (score >= 60)
            return 'Хороший вариант';
        if (score >= 40)
            return 'Средний вариант';
        return 'Требует улучшения';
    }
};
exports.ScoreEngine = ScoreEngine;
exports.ScoreEngine = ScoreEngine = __decorate([
    (0, common_1.Injectable)()
], ScoreEngine);
//# sourceMappingURL=score.engine.js.map