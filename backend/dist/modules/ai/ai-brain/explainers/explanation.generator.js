"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplanationGenerator = void 0;
const common_1 = require("@nestjs/common");
let ExplanationGenerator = class ExplanationGenerator {
    generate(ctx) {
        const bullets = [];
        const suggestions = [];
        if (ctx.qualityScore >= 80) {
            bullets.push(`Высокое качество объявления (${ctx.qualityScore}/100)`);
        }
        else if (ctx.qualityScore >= 50) {
            bullets.push(`Среднее качество объявления (${ctx.qualityScore}/100)`);
            suggestions.push('Добавьте больше фотографий и деталей в описание');
        }
        else {
            bullets.push(`Качество объявления требует улучшения (${ctx.qualityScore}/100)`);
            suggestions.push('Рекомендуем добавить фото, детальное описание и удобства');
        }
        if (ctx.demandScore >= 70) {
            bullets.push(`Высокий спрос в этом районе (${ctx.demandScore}/100)`);
        }
        else if (ctx.demandScore >= 40) {
            bullets.push(`Умеренный спрос (${ctx.demandScore}/100)`);
        }
        else {
            bullets.push(`Низкий спрос (${ctx.demandScore}/100)`);
            suggestions.push('Рассмотрите снижение цены или улучшение описания');
        }
        if (ctx.riskScore >= 60) {
            bullets.push(`Высокий уровень риска (${ctx.riskScore}/100)`);
            for (const factor of ctx.riskFactors.slice(0, 3)) {
                suggestions.push(`Риск: ${factor}`);
            }
        }
        else if (ctx.riskScore >= 35) {
            bullets.push(`Средний уровень риска (${ctx.riskScore}/100)`);
        }
        else {
            bullets.push(`Низкий риск (${ctx.riskScore}/100)`);
        }
        const { pricingResult } = ctx;
        if (pricingResult.marketPosition === 'below_market') {
            bullets.push(`Цена ниже рыночной — рекомендуем поднять на ${Math.abs(pricingResult.deltaPct)}%`);
            suggestions.push(`Рекомендованная цена: ${pricingResult.recommendedPrice} ₽/ночь`);
        }
        else if (pricingResult.marketPosition === 'above_market') {
            bullets.push(`Цена выше рыночной — может снижать конверсию`);
            suggestions.push(`Рассмотрите снижение до ${pricingResult.recommendedPrice} ₽/ночь`);
        }
        else {
            bullets.push('Цена соответствует рынку');
        }
        const probPct = Math.round(ctx.bookingProbability * 100);
        bullets.push(`Вероятность бронирования: ${probPct}%`);
        if (ctx.completenessScore < 70) {
            suggestions.push(`Заполненность профиля: ${ctx.completenessScore}%. Добавьте недостающую информацию.`);
        }
        const text = this.generateSummaryText(ctx);
        return { text, bullets, suggestions };
    }
    generateSummaryText(ctx) {
        const overall = Math.round((ctx.qualityScore * 0.3 + ctx.demandScore * 0.3 + (100 - ctx.riskScore) * 0.2 + ctx.completenessScore * 0.2));
        if (overall >= 75) {
            return 'Отличное объявление с высоким потенциалом бронирований. Продолжайте в том же духе!';
        }
        else if (overall >= 50) {
            return 'Хорошее объявление, но есть возможности для улучшения. Следуйте рекомендациям выше.';
        }
        else {
            return 'Объявление требует доработки. Рекомендуем улучшить описание, добавить фото и проверить цену.';
        }
    }
    generateHostSummary(properties) {
        if (properties.length === 0) {
            return {
                overallHealth: 'needs_attention',
                summary: 'У вас пока нет объявлений. Создайте первое объявление, чтобы начать.',
                topRecommendations: ['Создайте первое объявление'],
            };
        }
        const avgQuality = properties.reduce((sum, p) => sum + p.qualityScore, 0) / properties.length;
        const avgDemand = properties.reduce((sum, p) => sum + p.demandScore, 0) / properties.length;
        const avgRisk = properties.reduce((sum, p) => sum + p.riskScore, 0) / properties.length;
        const avgBookingProb = properties.reduce((sum, p) => sum + p.bookingProbability, 0) / properties.length;
        const recommendations = [];
        if (avgQuality < 60) {
            recommendations.push('Улучшите описания и добавьте больше фотографий');
        }
        const underpriced = properties.filter(p => p.recommendedPrice > p.currentPrice * 1.1);
        if (underpriced.length > 0) {
            recommendations.push(`${underpriced.length} объявлений можно поднять в цене`);
        }
        const overpriced = properties.filter(p => p.recommendedPrice < p.currentPrice * 0.9);
        if (overpriced.length > 0) {
            recommendations.push(`${overpriced.length} объявлений имеют завышенную цену`);
        }
        const highRisk = properties.filter(p => p.riskScore >= 60);
        if (highRisk.length > 0) {
            recommendations.push(`${highRisk.length} объявлений требуют внимания (высокий риск)`);
        }
        let overallHealth;
        const healthScore = avgQuality * 0.3 + avgDemand * 0.3 + (100 - avgRisk) * 0.2 + avgBookingProb * 100 * 0.2;
        if (healthScore >= 70) {
            overallHealth = 'excellent';
        }
        else if (healthScore >= 45) {
            overallHealth = 'good';
        }
        else {
            overallHealth = 'needs_attention';
        }
        const summary = `Средняя вероятность бронирования: ${Math.round(avgBookingProb * 100)}%. ` +
            `Качество объявлений: ${Math.round(avgQuality)}/100. ` +
            `Уровень риска: ${avgRisk >= 50 ? 'требует внимания' : 'в норме'}.`;
        return {
            overallHealth,
            summary,
            topRecommendations: recommendations.slice(0, 5),
        };
    }
};
exports.ExplanationGenerator = ExplanationGenerator;
exports.ExplanationGenerator = ExplanationGenerator = __decorate([
    (0, common_1.Injectable)()
], ExplanationGenerator);
//# sourceMappingURL=explanation.generator.js.map