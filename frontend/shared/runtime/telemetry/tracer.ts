/**
 * LOCUS Runtime Tracer
 *
 * PATCH 8: System Runtime & Orchestration
 *
 * Lightweight tracing for execution spans.
 */

export interface Span {
  id: string
  name: string
  startedAt: number
  endedAt?: number
  durationMs?: number
  attributes?: Record<string, unknown>
}

const spans: Span[] = []
const MAX_SPANS = 200

function pushSpan(span: Span): void {
  spans.push(span)
  if (spans.length > MAX_SPANS) {
    spans.shift()
  }
}

export function startSpan(
  name: string,
  attributes?: Record<string, unknown>
): { span: Span; end: () => Span } {
  const span: Span = {
    id: `span_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    startedAt: Date.now(),
    attributes,
  }

  return {
    span,
    end: () => {
      span.endedAt = Date.now()
      span.durationMs = span.endedAt - span.startedAt
      pushSpan(span)
      return span
    },
  }
}

export function getSpans(limit?: number): Span[] {
  if (limit) {
    return spans.slice(-limit)
  }
  return [...spans]
}

export function clearSpans(): void {
  spans.length = 0
}

export const TelemetryTracer = {
  startSpan,
  get: getSpans,
  clear: clearSpans,
}

export default TelemetryTracer
