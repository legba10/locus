/**
 * LOCUS Real Flow Engine
 *
 * PATCH 10: Real Product Activation
 *
 * UI → Event → Normalizer → Context → DecisionEngine → Action → UI
 */

import type { RawEvent } from '../../events/event.types'
import type { ListingCard, Listing } from '../../domain/listing.model'
import type { User } from '../../domain/user.model'
import type { UserProfile } from '../../domain/userProfile.model'
import { createEmptyProfile } from '../../domain/userProfile.model'
import { updateProfile } from '../../ai/userIntelligence.service'
import { Orchestrator } from '../orchestrator'
import type { ExecutionResult, RuntimeAction } from '../execution.model'
import type { PipelineInput } from '../pipeline'
import { FeatureFlags } from '../featureFlags'
import { logger } from '../../utils/logger'
import { dispatchToUI } from './ui.bridge'
import { TelegramService } from '../../integrations/telegram'
import { IntegrationFlags } from '../../integrations/sandbox'
import { RealMetrics } from '../../metrics/realMetrics'

export type FlowActionType =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.register'
  | 'ui.event'
  | 'telegram.event'
  | 'ai.signal'

export interface FlowAction {
  type: FlowActionType | string
  payload?: Record<string, unknown>
  source?: RawEvent['source']
  user?: User | null
  profile?: UserProfile | null
  listings?: (ListingCard | Listing)[]
  activeUsers?: UserProfile[]
  currentListingId?: string | null
}

const profileStore = new Map<string, UserProfile>()

export function getProfile(userId: string): UserProfile | null {
  return profileStore.get(userId) || null
}

export function setProfile(profile: UserProfile): void {
  profileStore.set(profile.userId, profile)
}

export async function handleAction(action: FlowAction): Promise<ExecutionResult> {
  if (!FeatureFlags.isEnabled('REAL_PIPELINE_ENABLED')) {
    logger.warn('RealFlow', 'Pipeline disabled by feature flag')
    return createEmptyExecution(action)
  }

  const rawEvent = toRawEvent(action)
  const { user, profile } = resolveUserProfile(action)

  const input: PipelineInput = {
    rawEvent,
    user,
    profile,
    listings: action.listings,
    activeUsers: action.activeUsers,
    currentListingId: action.currentListingId || null,
  }

  const result = await Orchestrator.run(input)
  RealMetrics.recordEvent(result.normalizedEvent)
  dispatchToUI(result.actions)
  return result
}

export async function handleTelegramUpdate(
  update: Parameters<typeof TelegramService.processUpdate>[0]
): Promise<ExecutionResult> {
  if (!FeatureFlags.isEnabled('TELEGRAM_ENABLED')) {
    logger.warn('RealFlow', 'Telegram disabled by feature flag')
    return createEmptyExecution({
      type: 'telegram.event',
      source: 'telegram',
      payload: { blocked: true },
    })
  }

  const event = TelegramService.handleControlledUpdate(update)
  if (!event) {
    return createEmptyExecution({
      type: 'telegram.event',
      source: 'telegram',
      payload: { ignored: true },
    })
  }
  const identity = resolveTelegramIdentity(event.data?.userId as number | undefined)
  return handleAction({
    type: 'telegram.event',
    source: 'telegram',
    payload: event.data || {},
    user: identity.user,
    profile: identity.profile,
  })
}

export async function dispatchAuthEvent(
  type: 'login' | 'logout' | 'register',
  user: User | null
): Promise<ExecutionResult> {
  const actionType = `auth.${type}` as FlowActionType
  return handleAction({
    type: actionType,
    source: 'ui',
    user,
    payload: user ? { userId: user.id } : undefined,
  })
}

// ==========================================
// HELPERS
// ==========================================

function resolveUserProfile(action: FlowAction): { user: User | null; profile: UserProfile | null } {
  const user = action.user || null
  let profile = action.profile || null

  if (user && !profile) {
    profile = getProfile(user.id)
  }

  if (action.type === 'auth.login' || action.type === 'auth.register') {
    if (user) {
      const existing = profile || getProfile(user.id)
      if (existing) {
        profile = existing
      } else {
        const created = updateProfile(createEmptyProfile(user.id), { type: 'session_start' })
        setProfile(created)
        profile = created
      }
    }
  }

  if (action.type === 'auth.logout' && user) {
    profile = getProfile(user.id)
  }

  return { user, profile }
}

function resolveTelegramIdentity(telegramUserId?: number): { user: User | null; profile: UserProfile | null } {
  if (!telegramUserId || !IntegrationFlags.TELEGRAM_AUTH) {
    return { user: null, profile: null }
  }

  const userId = `tg_${telegramUserId}`
  let profile = getProfile(userId)

  if (!profile) {
    profile = updateProfile(createEmptyProfile(userId), { type: 'session_start' })
    setProfile(profile)
  }

  return {
    user: {
      id: userId,
      supabaseId: userId,
      role: 'guest',
      roles: ['guest'],
      provider: 'telegram',
    },
    profile,
  }
}

function toRawEvent(action: FlowAction): RawEvent {
  const source = action.source || 'ui'
  const payload = action.payload || {}

  if (action.type.startsWith('auth.')) {
    return {
      source,
      type: action.type.replace('auth.', 'auth_'),
      data: payload,
      timestamp: Date.now(),
    }
  }

  if (action.type === 'telegram.event') {
    return {
      source: 'telegram',
      type: 'telegram_event',
      data: payload,
      timestamp: Date.now(),
    }
  }

  return {
    source,
    type: action.type,
    data: payload,
    timestamp: Date.now(),
  }
}

function createEmptyExecution(action: FlowAction): ExecutionResult {
  return {
    rawEvent: toRawEvent(action),
    normalizedEvent: {
      id: 'noop',
      name: 'noop',
      source: action.source || 'ui',
      timestamp: Date.now(),
      data: {},
      metadata: { version: 1, processedAt: Date.now(), originalType: 'noop' },
    },
    context: {
      user: action.user || null,
      profile: action.profile || null,
      isAuthenticated: !!action.user,
      isOwner: false,
      productState: 'anonymous',
      ranking: null,
      currentListingId: null,
      market: null,
      strategy: null,
      source: action.source || 'ui',
      sessionId: null,
      timestamp: Date.now(),
      timezone: 'UTC',
      flags: {
        isFirstVisit: true,
        isReturning: false,
        isMobile: false,
        hasSubscription: false,
        abTestGroup: null,
      },
      aiSignals: null,
    },
    market: null,
    ranking: null,
    strategy: {
      config: {
        mode: 'balanced',
        priority: 'engagement',
        monetizationLevel: 'none',
        acquisitionIntensity: 0,
        retentionFocus: 0,
        supplyIncentive: 0,
        qualityThreshold: 0,
      },
      reasoning: [],
      kpis: [],
      alerts: [],
    },
    decision: {
      decisions: [],
      primaryDecision: null,
      context: {
        profile: action.profile || null,
        productState: 'anonymous',
        isAuthenticated: !!action.user,
        isOwner: false,
        timestamp: new Date().toISOString(),
        dayOfWeek: new Date().getDay(),
        hourOfDay: new Date().getHours(),
        aiSignals: null,
      },
      processingTime: 0,
    },
    policies: {
      allowContact: true,
      allowPayment: true,
      allowFavorite: true,
      allowSearch: true,
      reasons: [],
    },
    actions: [] as RuntimeAction[],
    steps: [],
    totalDurationMs: 0,
  }
}

export const RealFlowEngine = {
  handleAction,
  handleTelegramUpdate,
  dispatchAuthEvent,
  getProfile,
  setProfile,
}

export default RealFlowEngine
