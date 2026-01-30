/**
 * LOCUS UI System
 * 
 * Единый дизайн-системный слой.
 * 
 * Visual Identity:
 * - Brand Blue (бренд)
 * - AI Purple (интеллект)
 * - Liquid Glass (глубина)
 * 
 * ❗ Никаких кастомных UI-стилей в доменных компонентах.
 */

// Design Tokens
export * from './tokens'

// Glass Components (Liquid Glass UI)
export * from './glass'

// AI Decision Components
export * from './decision'

// Base Components (legacy, will migrate to glass)
export { Button } from './Button'
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card'
export { Badge, ScoreBadge } from './Badge'
export { ScoreBadgeV2 } from './ScoreBadgeV2'
export { Tag, DemandTag, PriceTag } from './Tag'
export { InfoBlock, ProsList, RisksList, TipBlock } from './InfoBlock'
export { DecisionBlock, PersonalizedFitBlock, type LocusDecision } from './DecisionBlock'
export { DecisionBlockV2, type DecisionData } from './DecisionBlockV2'
export { ReasonList, createReasonsFromDecision } from './ReasonList'
export { AIHint } from './AIHint'
export { SmartSearchInput } from './SmartSearchInput'
export { Metric, MoneyMetric } from './Metric'
export { Divider } from './Divider'
