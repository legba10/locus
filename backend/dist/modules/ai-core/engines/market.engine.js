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
exports.MarketEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MarketEngine = class MarketEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMarketInsight(city) {
        const where = city ? { city, status: 'PUBLISHED' } : { status: 'PUBLISHED' };
        const listings = await this.prisma.listing.findMany({
            where,
            select: {
                basePrice: true,
                city: true,
            },
        });
        const prices = listings.map(l => l.basePrice);
        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        const cityMap = new Map();
        for (const l of listings) {
            if (!cityMap.has(l.city)) {
                cityMap.set(l.city, []);
            }
            cityMap.get(l.city).push(l.basePrice);
        }
        const topCities = Array.from(cityMap.entries())
            .map(([city, prices]) => ({
            city,
            count: prices.length,
            avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            demandLevel: this.getDemandLevel(prices.length),
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const recommendations = this.generateMarketRecommendations(listings, topCities);
        return {
            overview: {
                totalListings: listings.length,
                avgPrice: Math.round(avgPrice),
                avgScore: 65,
            },
            trends: {
                priceChange: 0,
                demandChange: 0,
                period: 'за последние 7 дней',
            },
            topCities,
            recommendations,
        };
    }
    getDemandLevel(count) {
        if (count >= 20)
            return 'high';
        if (count >= 10)
            return 'medium';
        return 'low';
    }
    generateMarketRecommendations(listings, topCities) {
        const recommendations = [];
        if (topCities.length > 0) {
            const topCity = topCities[0];
            recommendations.push(`${topCity.city} — самый популярный город с ${topCity.count} объявлениями`);
        }
        const avgPrice = listings.length > 0
            ? listings.reduce((s, l) => s + l.basePrice, 0) / listings.length
            : 0;
        recommendations.push(`Средняя цена по рынку: ${Math.round(avgPrice).toLocaleString('ru-RU')} ₽/ночь`);
        return recommendations;
    }
};
exports.MarketEngine = MarketEngine;
exports.MarketEngine = MarketEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketEngine);
