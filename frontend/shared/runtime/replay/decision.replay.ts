/**
 * LOCUS Decision Replay Engine
 *
 * PATCH 9: Real World Simulation Engine
 *
 * Replays decisions and compares outputs.
 */

import type { PipelineInput } from '../pipeline'
import { runPipeline } from '../pipeline'
import type { DecisionResult } from '../../domain/decisions/decision.model'

export interface DecisionReplaySnapshot {
  input: PipelineInput
  decision: {
    primary: string | null
    count: number
  }
}

export interface ReplayComparison {
  ok: boolean
  expected: DecisionReplaySnapshot['decision']
  actual: DecisionReplaySnapshot['decision']
  differences: string[]
}

export async function createReplaySnapshot(
  input: PipelineInput
): Promise<DecisionReplaySnapshot> {
  const result = await runPipeline(input)
  return {
    input,
    decision: simplifyDecision(result.decision),
  }
}

export async function replayDecision(
  snapshot: DecisionReplaySnapshot
): Promise<ReplayComparison> {
  const result = await runPipeline(snapshot.input)
  const actual = simplifyDecision(result.decision)
  const expected = snapshot.decision

  const differences: string[] = []
  if (expected.primary !== actual.primary) {
    differences.push(`Primary mismatch: ${expected.primary} vs ${actual.primary}`)
  }
  if (expected.count !== actual.count) {
    differences.push(`Decision count mismatch: ${expected.count} vs ${actual.count}`)
  }

  return {
    ok: differences.length === 0,
    expected,
    actual,
    differences,
  }
}

function simplifyDecision(result: DecisionResult): DecisionReplaySnapshot['decision'] {
  return {
    primary: result.primaryDecision?.type || null,
    count: result.decisions.length,
  }
}
