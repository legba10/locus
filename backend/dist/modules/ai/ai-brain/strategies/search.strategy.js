"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchStrategy = void 0;
const common_1 = require("@nestjs/common");
let SearchStrategy = class SearchStrategy {
    parseIntent(query, context) {
        const q = query.toLowerCase();
        const intent = {
            keywords: [],
        };
        if (context?.city) {
            intent.city = context.city;
        }
        const priceMatch = q.match(/до\s*(\d+(?:[.,]\d+)?)\s*(k|к|тыс)?/i);
        if (priceMatch) {
            let price = parseFloat((priceMatch[1] ?? "0").replace(',', '.'));
            if (priceMatch[2])
                price *= 1000;
            intent.maxPrice = price;
        }
        const minPriceMatch = q.match(/от\s*(\d+(?:[.,]\d+)?)\s*(k|к|тыс)?/i);
        if (minPriceMatch) {
            let price = parseFloat((minPriceMatch[1] ?? "0").replace(',', '.'));
            if (minPriceMatch[2])
                price *= 1000;
            intent.minPrice = price;
        }
        if (/(тихо|тишина|спокойн|quiet)/i.test(q)) {
            intent.wantsQuiet = true;
            intent.keywords.push('тихо');
        }
        if (/(метро|metro|подземк)/i.test(q)) {
            intent.wantsMetro = true;
            intent.keywords.push('метро');
        }
        if (/(парковк|parking|машин|авто)/i.test(q)) {
            intent.wantsParking = true;
            intent.keywords.push('парковка');
        }
        if (/(питом|животн|собак|кошк|pet)/i.test(q)) {
            intent.wantsPets = true;
            intent.keywords.push('животные');
        }
        const guestsMatch = q.match(/(\d+)\s*(чел|гост|person|guest)/i);
        if (guestsMatch?.[1]) {
            intent.guestsCount = parseInt(guestsMatch[1], 10);
        }
        const words = q.split(/\s+/).filter(w => w.length > 2);
        const stopWords = ['для', 'рядом', 'около', 'квартир', 'комнат', 'снять', 'аренд'];
        for (const word of words) {
            if (!stopWords.some(sw => word.includes(sw)) && !intent.keywords.includes(word)) {
                intent.keywords.push(word);
            }
        }
        return intent;
    }
    scoreListing(listing, intent) {
        let score = 50;
        const matchReasons = [];
        const riskFlags = [];
        if (intent.city && listing.city.toLowerCase() === intent.city.toLowerCase()) {
            score += 15;
            matchReasons.push(`Город: ${listing.city}`);
        }
        if (intent.maxPrice && listing.basePrice <= intent.maxPrice) {
            score += 10;
            matchReasons.push(`Цена в бюджете (до ${intent.maxPrice} ₽)`);
        }
        else if (intent.maxPrice && listing.basePrice > intent.maxPrice) {
            score -= 20;
            riskFlags.push('Цена выше указанного бюджета');
        }
        score += (listing.qualityScore - 50) / 5;
        score += (listing.demandScore - 50) / 10;
        if (listing.riskScore >= 60) {
            score -= 15;
            riskFlags.push('Высокий уровень риска');
        }
        else if (listing.riskScore >= 35) {
            score -= 5;
            riskFlags.push('Средний уровень риска');
        }
        const text = `${listing.title} ${listing.description}`.toLowerCase();
        const amenitiesText = listing.amenities.join(' ').toLowerCase();
        if (intent.wantsQuiet) {
            if (/(тихо|тишина|спокойн)/i.test(text)) {
                score += 10;
                matchReasons.push('Тихий район');
            }
            else {
                riskFlags.push('Нет информации о тишине');
            }
        }
        if (intent.wantsMetro) {
            if (/(метро)/i.test(text)) {
                score += 12;
                matchReasons.push('Рядом с метро');
            }
            else {
                riskFlags.push('Нет информации о метро');
            }
        }
        if (intent.wantsParking) {
            if (/(парков|parking)/i.test(text) || amenitiesText.includes('parking')) {
                score += 8;
                matchReasons.push('Есть парковка');
            }
        }
        if (intent.wantsPets) {
            if (/(питом|животн|pet)/i.test(text)) {
                score += 8;
                matchReasons.push('Можно с животными');
            }
        }
        for (const kw of intent.keywords.slice(0, 5)) {
            if (text.includes(kw)) {
                score += 3;
            }
        }
        return {
            listingId: listing.listingId,
            relevanceScore: Math.max(0, Math.min(100, Math.round(score))),
            matchReasons,
            riskFlags,
        };
    }
    generateExplanation(intent, resultsCount) {
        const bullets = [];
        if (intent.city)
            bullets.push(`Город: ${intent.city}`);
        if (intent.maxPrice)
            bullets.push(`Бюджет: до ${intent.maxPrice} ₽/ночь`);
        if (intent.wantsQuiet)
            bullets.push('Приоритет: тишина');
        if (intent.wantsMetro)
            bullets.push('Приоритет: рядом с метро');
        if (intent.wantsParking)
            bullets.push('Нужна парковка');
        if (intent.wantsPets)
            bullets.push('С животными');
        const text = resultsCount > 0
            ? `Найдено ${resultsCount} вариантов по вашим критериям. Результаты отсортированы по релевантности с учётом качества и рисков.`
            : 'По вашему запросу ничего не найдено. Попробуйте изменить критерии поиска.';
        return { text, bullets };
    }
};
exports.SearchStrategy = SearchStrategy;
exports.SearchStrategy = SearchStrategy = __decorate([
    (0, common_1.Injectable)()
], SearchStrategy);
//# sourceMappingURL=search.strategy.js.map