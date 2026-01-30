# LOCUS Architecture Guard

## PATCH 7.5: Pre-Integration Architecture

This document defines the strict architectural rules for LOCUS integrations.

---

## 🔒 FORBIDDEN PATTERNS

### ❌ UI Cannot Call Integrations Directly

```typescript
// ❌ FORBIDDEN
import { TelegramService } from '@/shared/integrations'
function MyComponent() {
  const handleClick = () => TelegramService.sendMessage(...) // WRONG
}

// ✅ CORRECT
import { DecisionEngine } from '@/shared/domain/decisions'
function MyComponent() {
  const handleClick = () => {
    const decision = DecisionEngine.resolve(context)
    // Let decision engine handle the rest
  }
}
```

### ❌ Integrations Cannot Mutate Domain Models

```typescript
// ❌ FORBIDDEN (in telegram.service.ts)
import { userStore } from '@/domains/auth'
function handleMessage() {
  userStore.setUser(...)  // WRONG - direct mutation
}

// ✅ CORRECT
function handleMessage(): RawEvent {
  return { source: 'telegram', type: 'message', data: {...} }
  // Let DecisionEngine handle state changes
}
```

### ❌ AI Cannot Change Ranking Directly

```typescript
// ❌ FORBIDDEN
import { RankingService } from '@/shared/ai'
function aiCallback() {
  RankingService.setScores(...)  // WRONG
}

// ✅ CORRECT
function aiCallback(): AIResponse {
  return { recommendations: [...] }
  // Let RankingService consume recommendations through proper flow
}
```

### ❌ Telegram Cannot Change User State Directly

```typescript
// ❌ FORBIDDEN
import { authStore } from '@/domains/auth'
function telegramAuth() {
  authStore.setAuthenticated(true)  // WRONG
}

// ✅ CORRECT
function telegramAuth(): TelegramAuthResult {
  return { success: true, telegramUserId: 123 }
  // Let AuthService handle state changes
}
```

---

## ✅ ALLOWED PATTERNS

### Data Flow

```
[External Source] → [Integration Adapter] → [Raw Event]
                                               ↓
                                    [Event Normalizer]
                                               ↓
                                    [Normalized Event]
                                               ↓
                                    [Context Builder]
                                               ↓
                                    [Global Context]
                                               ↓
                                    [Decision Engine]
                                               ↓
                                    [Decision]
                                               ↓
                            [Services / Flows / UI]
```

### Approved Entry Points

| Source   | Entry Point           | Handler              |
|----------|----------------------|----------------------|
| UI       | User Action          | DecisionEngine       |
| Telegram | Webhook              | TelegramService → EventNormalizer |
| AI       | Response             | ExternalAIService → EventNormalizer |
| Payment  | Webhook              | PaymentsService → EventNormalizer |
| System   | Scheduled Job        | DecisionEngine       |

### Approved Mutation Points

Only these services can mutate state:

1. **AuthService** - User authentication state
2. **UserIntelligenceService** - User profile
3. **RankingService** - Listing rankings (internal)
4. **ProductFlow** - Product state

---

## 🛡️ SANDBOX RULES

### Default State

All integrations start in sandbox mode:

```typescript
IntegrationModes = {
  telegram: 'sandbox',
  ai: 'sandbox',
  payments: 'sandbox',
}
```

### Production Activation

Requires explicit configuration:

```typescript
// Only in production with proper env vars
if (process.env.TELEGRAM_BOT_TOKEN) {
  setIntegrationMode('telegram', 'production')
}
```

### Sandbox Behavior

- Telegram: Logs messages, no actual sends
- AI: Returns mock responses
- Payments: Simulates transactions

---

## 🧪 TEST REQUIREMENTS

### Integration Boundary Tests

```typescript
it('telegram cannot bypass decision engine', () => {
  expect(() => {
    // Direct state mutation should fail
    TelegramService.directMutation()
  }).toThrow()
})

it('ai response flows through normalizer', () => {
  const response = ExternalAIService.process(request)
  expect(response).toBeInstanceOf(NormalizedEvent)
})

it('payment webhook creates event', () => {
  const result = PaymentsService.handleWebhook(payload)
  expect(result.event).toBeDefined()
})
```

---

## 📋 CHECKLIST FOR NEW INTEGRATIONS

Before adding a new integration:

- [ ] Create types in `integrations/{name}/{name}.types.ts`
- [ ] Create adapter in `integrations/{name}/{name}.adapter.ts`
- [ ] Create service in `integrations/{name}/{name}.service.ts`
- [ ] Add sandbox mode support
- [ ] Add to `IntegrationModes`
- [ ] Events flow through `EventNormalizer`
- [ ] No direct domain model mutations
- [ ] No direct state changes
- [ ] Tests for boundary violations
- [ ] Documentation updated

---

## 🚨 VIOLATION HANDLING

If architecture violation is detected:

1. Log violation with context
2. Reject the operation
3. Return fallback/safe response
4. Alert in development mode

```typescript
function guardIntegrationCall(source: string, operation: string): void {
  if (isCalledFromUI(source)) {
    logger.error('ArchitectureGuard', `UI attempted direct ${operation}`)
    throw new ArchitectureViolationError(`UI cannot call ${operation} directly`)
  }
}
```

---

## 📚 REFERENCE

- [Decision Engine](./domain/decisions/)
- [Event Normalizer](./events/)
- [Context Builder](./context/)
- [Integrations](./integrations/)
