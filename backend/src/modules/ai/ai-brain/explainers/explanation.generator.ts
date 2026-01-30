import { Injectable } from '@nestjs/common';
import type { PricingResult } from '../strategies/pricing.strategy';

export interface ExplanationContext {
  qualityScore: number;
  demandScore: number;
  riskScore: number;
  riskFactors: string[];
  pricingResult: PricingResult;
  completenessScore: number;
  bookingProbability: number;
}

export interface Explanation {
  text: string;
  bullets: string[];
  suggestions: string[];
}

/**
 * Explanation Generator — генерация человекочитаемых объяснений.
 * 
 * Принцип: каждое AI-решение должно быть объяснимо.
 */
@Injectable()
export class ExplanationGenerator {
  generate(ctx: ExplanationContext): Explanation {
    const bullets: string[] = [];
    const suggestions: string[] = [];

    // Quality explanation
    if (ctx.qualityScore >= 80) {
      bullets.push(`Высокое качество объявления (${ctx.qualityScore}/100)`);
    } else if (ctx.qualityScore >= 50) {
      bullets.push(`Среднее качество объявления (${ctx.qualityScore}/100)`);
      suggestions.push('Добавьте больше фотографий и деталей в описание');
    } else {
      bullets.push(`Качество объявления требует улучшения (${ctx.qualityScore}/100)`);
      suggestions.push('Рекомендуем добавить фото, детальное описание и удобства');
    }

    // Demand explanation
    if (ctx.demandScore >= 70) {
      bullets.push(`Высокий спрос в этом районе (${ctx.demandScore}/100)`);
    } else if (ctx.demandScore >= 40) {
      bullets.push(`Умеренный спрос (${ctx.demandScore}/100)`);
    } else {
      bullets.push(`Низкий спрос (${ctx.demandScore}/100)`);
      suggestions.push('Рассмотрите снижение цены или улучшение описания');
    }

    // Risk explanation
    if (ctx.riskScore >= 60) {
      bullets.push(`Высокий уровень риска (${ctx.riskScore}/100)`);
      for (const factor of ctx.riskFactors.slice(0, 3)) {
        suggestions.push(`Риск: ${factor}`);
      }
    } else if (ctx.riskScore >= 35) {
      bullets.push(`Средний уровень риска (${ctx.riskScore}/100)`);
    } else {
      bullets.push(`Низкий риск (${ctx.riskScore}/100)`);
    }

    // Pricing explanation
    const { pricingResult } = ctx;
    if (pricingResult.marketPosition === 'below_market') {
      bullets.push(`Цена ниже рыночной — рекомендуем поднять на ${Math.abs(pricingResult.deltaPct)}%`);
      suggestions.push(`Рекомендованная цена: ${pricingResult.recommendedPrice} ₽/ночь`);
    } else if (pricingResult.marketPosition === 'above_market') {
      bullets.push(`Цена выше рыночной — может снижать конверсию`);
      suggestions.push(`Рассмотрите снижение до ${pricingResult.recommendedPrice} ₽/ночь`);
    } else {
      bullets.push('Цена соответствует рынку');
    }

    // Booking probability
    const probPct = Math.round(ctx.bookingProbability * 100);
    bullets.push(`Вероятность бронирования: ${probPct}%`);

    // Completeness
    if (ctx.completenessScore < 70) {
      suggestions.push(`Заполненность профиля: ${ctx.completenessScore}%. Добавьте недостающую информацию.`);
    }

    // Generate summary text
    const text = this.generateSummaryText(ctx);

    return { text, bullets, suggestions };
  }

  private generateSummaryText(ctx: ExplanationContext): string {
    const overall = Math.round(
      (ctx.qualityScore * 0.3 + ctx.demandScore * 0.3 + (100 - ctx.riskScore) * 0.2 + ctx.completenessScore * 0.2)
    );

    if (overall >= 75) {
      return 'Отличное объявление с высоким потенциалом бронирований. Продолжайте в том же духе!';
    } else if (overall >= 50) {
      return 'Хорошее объявление, но есть возможности для улучшения. Следуйте рекомендациям выше.';
    } else {
      return 'Объявление требует доработки. Рекомендуем улучшить описание, добавить фото и проверить цену.';
    }
  }

  /**
   * Generate explanation for host dashboard
   */
  generateHostSummary(properties: Array<{
    qualityScore: number;
    demandScore: number;
    riskScore: number;
    bookingProbability: number;
    recommendedPrice: number;
    currentPrice: number;
  }>): {
    overallHealth: 'excellent' | 'good' | 'needs_attention';
    summary: string;
    topRecommendations: string[];
  } {
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

    const recommendations: string[] = [];

    // Quality recommendations
    if (avgQuality < 60) {
      recommendations.push('Улучшите описания и добавьте больше фотографий');
    }

    // Pricing recommendations
    const underpriced = properties.filter(p => p.recommendedPrice > p.currentPrice * 1.1);
    if (underpriced.length > 0) {
      recommendations.push(`${underpriced.length} объявлений можно поднять в цене`);
    }

    const overpriced = properties.filter(p => p.recommendedPrice < p.currentPrice * 0.9);
    if (overpriced.length > 0) {
      recommendations.push(`${overpriced.length} объявлений имеют завышенную цену`);
    }

    // Risk recommendations
    const highRisk = properties.filter(p => p.riskScore >= 60);
    if (highRisk.length > 0) {
      recommendations.push(`${highRisk.length} объявлений требуют внимания (высокий риск)`);
    }

    // Determine overall health
    let overallHealth: 'excellent' | 'good' | 'needs_attention';
    const healthScore = avgQuality * 0.3 + avgDemand * 0.3 + (100 - avgRisk) * 0.2 + avgBookingProb * 100 * 0.2;

    if (healthScore >= 70) {
      overallHealth = 'excellent';
    } else if (healthScore >= 45) {
      overallHealth = 'good';
    } else {
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
}
