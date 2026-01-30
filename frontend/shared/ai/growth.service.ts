/**
 * LOCUS Growth Service
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * AI-powered growth management.
 */

import { logger } from '../utils/logger'
import type { UserProfile } from '../domain/userProfile.model'
import {
  type UserGrowthEvaluation,
  type GrowthMetrics as GrowthMetricsType,
  evaluateUserGrowth,
  calculateGrowthMetrics,
  calculateChurnRisk,
} from '../analytics/growthMetrics'

/**
 * Growth action recommendation
 */
export interface GrowthAction {
  type: 'retention' | 'activation' | 'conversion' | 'monetization' | 'viral'
  action: string
  target: 'user' | 'segment' | 'platform'
  priority: 'low' | 'medium' | 'high' | 'critical'
  expectedImpact: number // 0-100
  description: string
}

/**
 * Growth evaluation result
 */
export interface GrowthEvaluation {
  user: UserGrowthEvaluation
  actions: GrowthAction[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Platform growth state
 */
export interface PlatformGrowthState {
  metrics: GrowthMetricsType
  healthScore: number // 0-100
  trend: 'declining' | 'stable' | 'growing' | 'thriving'
  risks: string[]
  opportunities: string[]
  recommendedActions: GrowthAction[]
}

// ==========================================
// USER-LEVEL GROWTH
// ==========================================

/**
 * Evaluate growth for a single user
 */
export function evaluateUser(profile: UserProfile): GrowthEvaluation {
  const user = evaluateUserGrowth(profile)
  const actions: GrowthAction[] = []
  
  // Determine actions based on stage
  switch (user.stage) {
    case 'new':
      actions.push({
        type: 'activation',
        action: 'onboarding_push',
        target: 'user',
        priority: 'high',
        expectedImpact: 40,
        description: 'Показать онбординг и первые рекомендации',
      })
      break
    
    case 'activated':
      actions.push({
        type: 'conversion',
        action: 'favorite_reminder',
        target: 'user',
        priority: 'medium',
        expectedImpact: 30,
        description: 'Напомнить о сохранённых объявлениях',
      })
      break
    
    case 'engaged':
      actions.push({
        type: 'conversion',
        action: 'contact_cta',
        target: 'user',
        priority: 'high',
        expectedImpact: 50,
        description: 'Показать CTA для связи с владельцем',
      })
      break
    
    case 'converted':
      actions.push({
        type: 'monetization',
        action: 'premium_offer',
        target: 'user',
        priority: 'medium',
        expectedImpact: 20,
        description: 'Предложить премиум подписку',
      })
      break
    
    case 'churning':
      actions.push({
        type: 'retention',
        action: 'win_back_email',
        target: 'user',
        priority: 'critical',
        expectedImpact: 35,
        description: 'Отправить письмо с новыми предложениями',
      })
      actions.push({
        type: 'retention',
        action: 'push_notification',
        target: 'user',
        priority: 'high',
        expectedImpact: 25,
        description: 'Push-уведомление с лучшими вариантами',
      })
      break
    
    case 'churned':
      actions.push({
        type: 'retention',
        action: 'reactivation_campaign',
        target: 'user',
        priority: 'low',
        expectedImpact: 10,
        description: 'Включить в кампанию реактивации',
      })
      break
  }
  
  // High churn risk = urgent
  const urgency = 
    user.churnRisk > 0.7 ? 'critical' :
    user.churnRisk > 0.5 ? 'high' :
    user.churnRisk > 0.3 ? 'medium' : 'low'
  
  return { user, actions, urgency }
}

/**
 * Get users needing attention
 */
export function getUsersNeedingAttention(
  profiles: UserProfile[],
  limit: number = 10
): GrowthEvaluation[] {
  return profiles
    .map(evaluateUser)
    .filter(e => e.urgency === 'high' || e.urgency === 'critical')
    .sort((a, b) => b.user.churnRisk - a.user.churnRisk)
    .slice(0, limit)
}

// ==========================================
// PLATFORM-LEVEL GROWTH
// ==========================================

/**
 * Evaluate platform growth state
 */
export function evaluatePlatform(profiles: UserProfile[]): PlatformGrowthState {
  logger.debug('GrowthService', 'Evaluating platform growth', { userCount: profiles.length })
  
  const metrics = calculateGrowthMetrics(profiles)
  
  // Calculate health score
  const healthScore = Math.round(
    metrics.activationRate * 0.25 +
    metrics.retentionRate * 0.3 +
    metrics.conversionRate * 0.25 +
    (1 - metrics.avgChurnRisk) * 100 * 0.2
  )
  
  // Determine trend
  const trend: PlatformGrowthState['trend'] = 
    healthScore >= 70 ? 'thriving' :
    healthScore >= 50 ? 'growing' :
    healthScore >= 30 ? 'stable' : 'declining'
  
  // Identify risks
  const risks: string[] = []
  if (metrics.activationRate < 30) risks.push('Низкая активация новых пользователей')
  if (metrics.retentionRate < 40) risks.push('Высокий отток пользователей')
  if (metrics.avgChurnRisk > 0.5) risks.push('Много пользователей на грани оттока')
  if (metrics.conversionRate < 5) risks.push('Низкая конверсия в контакты')
  
  // Identify opportunities
  const opportunities: string[] = []
  if (metrics.activationRate > 50) opportunities.push('Хорошая активация, можно усилить')
  if (metrics.monetizationPressure > 0.5) opportunities.push('Высокий потенциал монетизации')
  if (metrics.retentionRate > 60) opportunities.push('Лояльная база, готова к upsell')
  
  // Recommended actions
  const recommendedActions: GrowthAction[] = []
  
  if (metrics.activationRate < 40) {
    recommendedActions.push({
      type: 'activation',
      action: 'improve_onboarding',
      target: 'platform',
      priority: 'high',
      expectedImpact: 25,
      description: 'Улучшить онбординг новых пользователей',
    })
  }
  
  if (metrics.retentionRate < 50) {
    recommendedActions.push({
      type: 'retention',
      action: 'email_campaign',
      target: 'segment',
      priority: 'high',
      expectedImpact: 20,
      description: 'Запустить email-кампанию для неактивных',
    })
  }
  
  if (metrics.conversionRate < 10 && metrics.activationRate > 40) {
    recommendedActions.push({
      type: 'conversion',
      action: 'optimize_cta',
      target: 'platform',
      priority: 'medium',
      expectedImpact: 15,
      description: 'Оптимизировать CTA и воронку',
    })
  }
  
  if (metrics.monetizationPressure > 0.6) {
    recommendedActions.push({
      type: 'monetization',
      action: 'premium_push',
      target: 'segment',
      priority: 'medium',
      expectedImpact: 30,
      description: 'Активизировать продажу премиума',
    })
  }
  
  return {
    metrics,
    healthScore,
    trend,
    risks,
    opportunities,
    recommendedActions,
  }
}

// ==========================================
// CHURN PREVENTION
// ==========================================

/**
 * Get churn prevention actions
 */
export function getChurnPreventionActions(
  profile: UserProfile
): GrowthAction[] {
  const churnRisk = calculateChurnRisk(profile)
  const actions: GrowthAction[] = []
  
  if (churnRisk < 0.3) {
    return [] // Low risk, no action needed
  }
  
  if (churnRisk > 0.7) {
    // Critical risk
    actions.push({
      type: 'retention',
      action: 'urgent_outreach',
      target: 'user',
      priority: 'critical',
      expectedImpact: 40,
      description: 'Срочное сообщение с персональным предложением',
    })
    actions.push({
      type: 'retention',
      action: 'special_offer',
      target: 'user',
      priority: 'high',
      expectedImpact: 35,
      description: 'Специальная скидка на premium',
    })
  } else if (churnRisk > 0.5) {
    // High risk
    actions.push({
      type: 'retention',
      action: 'reengagement_push',
      target: 'user',
      priority: 'high',
      expectedImpact: 30,
      description: 'Push с новыми объявлениями по интересам',
    })
  } else {
    // Medium risk
    actions.push({
      type: 'retention',
      action: 'soft_reminder',
      target: 'user',
      priority: 'medium',
      expectedImpact: 20,
      description: 'Мягкое напоминание о сохранённых',
    })
  }
  
  return actions
}

// ==========================================
// GROWTH SERVICE NAMESPACE
// ==========================================

export const GrowthService = {
  evaluate: evaluateUser,
  evaluatePlatform,
  getUsersNeedingAttention,
  getChurnPreventionActions,
}

export default GrowthService
