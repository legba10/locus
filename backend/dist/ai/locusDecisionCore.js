"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMAND_LABELS = exports.PRICE_LABELS = exports.VERDICT_LABELS = void 0;
exports.validateDecision = validateDecision;
exports.VERDICT_LABELS = {
    fits: 'Подходит',
    neutral: 'Нормально',
    not_fits: 'Не подходит',
};
exports.PRICE_LABELS = {
    below_market: 'Цена ниже рынка',
    market: 'Цена по рынку',
    above_market: 'Цена выше рынка',
};
exports.DEMAND_LABELS = {
    low: 'Низкий спрос',
    medium: 'Средний спрос',
    high: 'Высокий спрос',
};
function validateDecision(decision) {
    if (decision.reasons.length > 3) {
        console.warn('Decision has more than 3 reasons');
        return false;
    }
    if (decision.mainAdvice.length > 120) {
        console.warn('mainAdvice exceeds 120 chars');
        return false;
    }
    if (decision.matchScore < 0 || decision.matchScore > 100) {
        console.warn('matchScore out of range');
        return false;
    }
    return true;
}
