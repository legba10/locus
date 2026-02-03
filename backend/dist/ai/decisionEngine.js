"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecision = generateDecision;
exports.generateDecisions = generateDecisions;
exports.sortByMatch = sortByMatch;
const locusDecisionCore_1 = require("./locusDecisionCore");
function calculatePriceScore(listing, context) {
    const price = listing.price;
    const marketPrice = listing.marketPrice || price;
    const marketDiff = ((marketPrice - price) / marketPrice) * 100;
    let score = 50 + marketDiff;
    if (context.priceMax && price > context.priceMax) {
        score -= 30;
    }
    else if (context.priceMin && context.priceMax) {
        const mid = (context.priceMin + context.priceMax) / 2;
        if (price <= mid) {
            score += 15;
        }
    }
    return Math.max(0, Math.min(100, score));
}
function calculateLocationScore(listing, context) {
    let score = 50;
    if (context.preferredCities?.includes(listing.city)) {
        score += 40;
    }
    if (context.searchHistory?.includes(listing.city)) {
        score += 20;
    }
    return Math.max(0, Math.min(100, score));
}
function calculateDemandScore(listing) {
    const demandMap = {
        high: 85,
        medium: 60,
        low: 35,
    };
    return demandMap[listing.demandLevel || 'medium'];
}
function calculateQualityScore(listing) {
    let score = listing.qualityScore || 50;
    if (listing.photoCount && listing.photoCount >= 5) {
        score += 10;
    }
    else if (!listing.photoCount || listing.photoCount < 3) {
        score -= 15;
    }
    if (listing.descriptionLength && listing.descriptionLength >= 200) {
        score += 5;
    }
    return Math.max(0, Math.min(100, score));
}
function getPriceSignal(listing) {
    if (!listing.marketPrice)
        return 'market';
    const diff = ((listing.marketPrice - listing.price) / listing.marketPrice) * 100;
    if (diff > 5)
        return 'below_market';
    if (diff < -5)
        return 'above_market';
    return 'market';
}
function getVerdict(score) {
    if (score >= 75)
        return 'fits';
    if (score >= 50)
        return 'neutral';
    return 'not_fits';
}
function generateReasons(listing, context, priceSignal, demandSignal, verdict) {
    const reasons = [];
    if (priceSignal === 'below_market') {
        reasons.push('Цена ниже рынка');
    }
    else if (priceSignal === 'above_market' && verdict !== 'fits') {
        reasons.push('Цена выше среднего');
    }
    if (context.priceMax && listing.price <= context.priceMax) {
        reasons.push('Вписывается в бюджет');
    }
    if (context.preferredCities?.includes(listing.city)) {
        reasons.push('В нужном районе');
    }
    if (demandSignal === 'high') {
        reasons.push('Высокий спрос');
    }
    else if (demandSignal === 'low' && verdict !== 'fits') {
        reasons.push('Низкий спрос');
    }
    if (context.guests && listing.beds && listing.beds >= context.guests) {
        reasons.push(`Подходит для ${context.guests} гостей`);
    }
    if (listing.photoCount && listing.photoCount >= 5) {
        reasons.push('Хорошие фото');
    }
    else if (!listing.photoCount || listing.photoCount < 3) {
        reasons.push('Мало фото');
    }
    return reasons.slice(0, 3);
}
function generateAdvice(listing, verdict, priceSignal, demandSignal) {
    if (verdict === 'fits') {
        if (priceSignal === 'below_market' && demandSignal === 'high') {
            return 'Выгодное предложение — бронируйте быстрее';
        }
        if (priceSignal === 'below_market') {
            return 'Хорошая цена для этого района';
        }
        if (demandSignal === 'high') {
            return 'Популярный вариант — не затягивайте с решением';
        }
        return 'Хороший вариант для бронирования';
    }
    if (verdict === 'neutral') {
        if (priceSignal === 'above_market') {
            return 'Сравните с похожими вариантами по цене';
        }
        return 'Изучите детали перед решением';
    }
    if (priceSignal === 'above_market') {
        return 'Есть варианты дешевле в этом районе';
    }
    return 'Рассмотрите другие варианты';
}
function generateDecision(listing, userContext = {}) {
    const priceScore = calculatePriceScore(listing, userContext);
    const locationScore = calculateLocationScore(listing, userContext);
    const demandScore = calculateDemandScore(listing);
    const qualityScore = calculateQualityScore(listing);
    const matchScore = Math.round(priceScore * 0.4 +
        locationScore * 0.3 +
        demandScore * 0.2 +
        qualityScore * 0.1);
    const priceSignal = getPriceSignal(listing);
    const demandSignal = listing.demandLevel || 'medium';
    const verdict = getVerdict(matchScore);
    const reasons = generateReasons(listing, userContext, priceSignal, demandSignal, verdict);
    const mainAdvice = generateAdvice(listing, verdict, priceSignal, demandSignal);
    const decision = {
        matchScore,
        verdict,
        reasons,
        priceSignal,
        demandSignal,
        mainAdvice,
    };
    (0, locusDecisionCore_1.validateDecision)(decision);
    return decision;
}
function generateDecisions(listings, userContext = {}) {
    const decisions = new Map();
    for (const listing of listings) {
        decisions.set(listing.id, generateDecision(listing, userContext));
    }
    return decisions;
}
function sortByMatch(listings, userContext = {}) {
    const decisions = generateDecisions(listings, userContext);
    return [...listings].sort((a, b) => {
        const scoreA = decisions.get(a.id)?.matchScore || 0;
        const scoreB = decisions.get(b.id)?.matchScore || 0;
        return scoreB - scoreA;
    });
}
//# sourceMappingURL=decisionEngine.js.map