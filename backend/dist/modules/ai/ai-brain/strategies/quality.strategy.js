"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityStrategy = void 0;
const common_1 = require("@nestjs/common");
let QualityStrategy = class QualityStrategy {
    calculate(context) {
        let score = 0;
        const ratingScore = Math.min(20, (context.avgRating || 0) * 4);
        score += ratingScore;
        const photosScore = Math.min(20, context.photosCount * 2);
        score += photosScore;
        const descLen = context.description?.length ?? 0;
        const descScore = Math.min(20, descLen * 0.1);
        score += descScore;
        const descQuality = this.analyzeDescriptionQuality(context.description);
        score += descQuality;
        if (context.hasCoordinates)
            score += 10;
        if (context.amenitiesCount >= 3)
            score += 10;
        if (context.title && context.title.length >= 20)
            score += 5;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    analyzeDescriptionQuality(description) {
        if (!description)
            return 0;
        const text = description.toLowerCase();
        let bonus = 0;
        if (/(метро|транспорт|пешком|минут|остановк)/i.test(text))
            bonus += 3;
        if (/(тихо|тишина|спокойн|уютн|комфорт)/i.test(text))
            bonus += 3;
        if (/(интернет|wi-?fi|рабоч|работа)/i.test(text))
            bonus += 2;
        if (/(правила|курени|животн|дети|вечерин)/i.test(text))
            bonus += 2;
        if (/(центр|район|рядом|близко|парк|магазин)/i.test(text))
            bonus += 2;
        if (/(кухня|холодильник|стир|посуд)/i.test(text))
            bonus += 2;
        if (/(спальн|кроват|диван|балкон|терраса)/i.test(text))
            bonus += 1;
        return Math.min(15, bonus);
    }
};
exports.QualityStrategy = QualityStrategy;
exports.QualityStrategy = QualityStrategy = __decorate([
    (0, common_1.Injectable)()
], QualityStrategy);
