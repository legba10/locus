"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandAnalyzer = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DemandAnalyzer = class DemandAnalyzer {
    constructor(prisma) {
        this.prisma = prisma;
        this.cityDemand = {
            'Москва': 0.85,
            'Moscow': 0.85,
            'Санкт-Петербург': 0.80,
            'Saint Petersburg': 0.80,
            'Сочи': 0.90,
            'Sochi': 0.90,
            'Казань': 0.70,
            'Kazan': 0.70,
            'Краснодар': 0.75,
            'default': 0.65,
        };
    }
    async analyze(input) {
        const reasoning = [];
        const baseFactor = (this.cityDemand[input.city] ?? this.cityDemand['default']) ?? 0.5;
        let probability = baseFactor * 100;
        if (input.qualityScore >= 80) {
            probability += 15;
            reasoning.push('Высокое качество объявления повышает интерес');
        }
        else if (input.qualityScore >= 60) {
            probability += 8;
        }
        else if (input.qualityScore < 40) {
            probability -= 15;
            reasoning.push('Улучшите объявление для повышения спроса');
        }
        const amenitiesCount = input.amenities?.length ?? 0;
        if (amenitiesCount >= 8) {
            probability += 10;
            reasoning.push('Много удобств привлекает гостей');
        }
        else if (amenitiesCount < 3) {
            probability -= 10;
            reasoning.push('Добавьте удобства для повышения привлекательности');
        }
        probability = Math.max(10, Math.min(95, probability));
        let level;
        if (probability >= 70) {
            level = 'high';
            reasoning.unshift('Высокий спрос в этом районе');
        }
        else if (probability >= 45) {
            level = 'medium';
            reasoning.unshift('Средний спрос');
        }
        else {
            level = 'low';
            reasoning.unshift('Низкий спрос — рассмотрите снижение цены');
        }
        return {
            level,
            bookingProbability: Math.round(probability),
            reasoning,
        };
    }
    async getCityDemand(city) {
        const factor = (this.cityDemand[city] ?? this.cityDemand['default']) ?? 0.5;
        if (factor >= 0.80)
            return 'high';
        if (factor >= 0.65)
            return 'medium';
        return 'low';
    }
};
exports.DemandAnalyzer = DemandAnalyzer;
exports.DemandAnalyzer = DemandAnalyzer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DemandAnalyzer);
//# sourceMappingURL=demand.analyzer.js.map