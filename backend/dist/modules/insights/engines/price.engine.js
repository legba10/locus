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
exports.PriceEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PriceEngine = class PriceEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async analyze(listing) {
        const similar = await this.prisma.listing.findMany({
            where: {
                city: listing.city,
                status: 'PUBLISHED',
                id: { not: listing.id }
            },
            select: { basePrice: true },
            take: 100,
        });
        let marketAvg = 3500;
        if (similar.length >= 5) {
            const prices = similar.map(l => l.basePrice).sort((a, b) => a - b);
            const mid = Math.floor(prices.length / 2);
            const lo = prices[mid - 1] ?? 0;
            const hi = prices[mid] ?? 0;
            marketAvg = prices.length % 2 ? hi : (lo + hi) / 2;
        }
        const currentPrice = listing.basePrice;
        const diff = Math.round(((currentPrice - marketAvg) / marketAvg) * 100);
        let position;
        let positionText;
        if (diff < -10) {
            position = 'below_market';
            positionText = `Ниже рынка на ${Math.abs(diff)}%`;
        }
        else if (diff > 10) {
            position = 'above_market';
            positionText = `Выше рынка на ${diff}%`;
        }
        else {
            position = 'market';
            positionText = 'Цена по рынку';
        }
        const demand = this.calculateDemand(similar.length);
        return {
            recommended: Math.round(marketAvg),
            diff,
            position,
            positionText,
            demand,
            marketAvg: Math.round(marketAvg),
        };
    }
    calculateDemand(competitorCount) {
        if (competitorCount < 10)
            return 'high';
        if (competitorCount < 30)
            return 'medium';
        return 'low';
    }
};
exports.PriceEngine = PriceEngine;
exports.PriceEngine = PriceEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PriceEngine);
