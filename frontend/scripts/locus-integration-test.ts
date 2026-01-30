/**
 * LOCUS Integration Test Runner
 *
 * PATCH 11: Controlled Production Integration Layer
 */

import { runPipeline } from '../shared/runtime/pipeline'
import { FeatureFlags } from '../shared/runtime/featureFlags'
import { checkIntegrationSafety } from '../shared/runtime/integrationControl/integrationGuard'
import { ActionDispatcher, RealFlowEngine } from '../shared/runtime'
import type { RawEvent } from '../shared/events/event.types'
import type { ListingCard } from '../shared/domain/listing.model'

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message)
  }
}

async function testPipelineWithoutAI() {
  FeatureFlags.set('AI_ENABLED', false)
  FeatureFlags.set('AI_READ_ONLY', true)

  const event: RawEvent = {
    source: 'ui',
    type: 'listing_view',
    data: { listingId: 'listing_1' },
    timestamp: Date.now(),
  }

  const result = await runPipeline({ rawEvent: event })
  assert(result.context.aiSignals === null, 'AI signals should be null when AI disabled')
}

async function testPipelineWithAI() {
  FeatureFlags.set('AI_ENABLED', true)
  FeatureFlags.set('AI_READ_ONLY', true)

  const listing: ListingCard = {
    id: 'listing_ai',
    title: 'Квартира 1к',
    price: 35000,
    city: 'Москва',
    coverPhoto: null,
  }

  const event: RawEvent = {
    source: 'ui',
    type: 'listing_view',
    data: { listingId: listing.id },
    timestamp: Date.now(),
  }

  const result = await runPipeline({ rawEvent: event, listings: [listing] })
  assert(result.context.aiSignals !== null, 'AI signals should exist when AI enabled')
}

async function testTelegramUpdateMock() {
  FeatureFlags.set('TELEGRAM_ENABLED', true)
  FeatureFlags.set('TELEGRAM_SAFE_MODE', true)
  FeatureFlags.set('TELEGRAM_FULL_MODE', false)

  const update = {
    updateId: Date.now(),
    type: 'message' as const,
    message: {
      messageId: 1,
      chatId: 123,
      chatType: 'private' as const,
      from: { id: 99, firstName: 'Test' },
      text: '/start',
      date: Date.now(),
    },
  }

  const result = await RealFlowEngine.handleTelegramUpdate(update)
  assert(result.normalizedEvent.source === 'telegram', 'Telegram update should be processed')
}

async function testGuard() {
  FeatureFlags.set('AI_ENABLED', false)
  FeatureFlags.set('TELEGRAM_ENABLED', true)
  let failed = false
  try {
    checkIntegrationSafety()
  } catch {
    failed = true
  }
  assert(failed, 'Guard must block Telegram before AI')
}

async function testKillSwitch() {
  FeatureFlags.disableAll()
  const actions = await ActionDispatcher.dispatch({
    type: 'ui.event',
    source: 'ui',
    payload: { test: true },
  })
  assert(actions.length === 0, 'Kill switch should block actions')
}

async function run() {
  try {
    await testPipelineWithoutAI()
    await testPipelineWithAI()
    await testTelegramUpdateMock()
    await testGuard()
    await testKillSwitch()
    console.log('LOCUS integration tests: OK')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('LOCUS integration tests: FAIL', message)
    process.exit(1)
  }
}

run()
