# LOCUS Product Rules

## Core Principle

**User understands if listing fits them in < 3 seconds.**

---

## RULE 1 — 3-3-1

Per screen:
- **3 facts** maximum
- **3 reasons** maximum  
- **1 conclusion** only

If more content needed → hide under "More"

---

## RULE 2 — 1 AI Block Per Screen

**Allowed:** 1 decision block visible

**Others:** hidden under expandable section

---

## RULE 3 — Human Language Only

### FORBIDDEN UI Terms

```
model
algorithm
prediction
engine
insight
score
pipeline
backend
API
```

### ALLOWED Terms

```
fits / подходит
risk / риск
advice / совет
analysis / анализ
good option / хороший вариант
below market / ниже рынка
```

---

## RULE 4 — ListingCard Standard

**Max 5 elements:**

1. Photo
2. Price (large)
3. Decision score + verdict
4. 1 reason
5. CTA button

**Removed:**
- Extra metrics
- Long descriptions
- Multiple badges

---

## RULE 5 — ListingPage Order

**Block order (strict):**

1. LocusDecisionBlock (visible without scroll)
2. Price + booking
3. Gallery
4. Why fits (max 3 points)
5. Risks (max 2 points)
6. Description
7. Amenities
8. Map

---

## RULE 6 — OwnerDashboard = Money

**Show:**
- Current income
- Potential income
- Quick actions (2-3)

**Hide:**
- Complex tables
- Technical metrics
- Graphs

---

## RULE 7 — Decision Core

```typescript
interface LocusDecisionCore {
  matchScore: number;        // 0-100
  verdict: "fits" | "neutral" | "not_fits";
  reasons: string[];         // max 3
  priceSignal: "below_market" | "market" | "above_market";
  demandSignal: "low" | "medium" | "high";
  mainAdvice: string;        // max 120 chars
}
```

---

## RULE 8 — Verdict Mapping

```
score >= 75 → fits
score >= 50 → neutral
score < 50  → not_fits
```

---

## RULE 9 — Match Score Formula

```
matchScore = 
  priceScore * 0.4 +
  locationScore * 0.3 +
  demandScore * 0.2 +
  qualityScore * 0.1
```

---

## RULE 10 — Personalization

Always show "Why this fits you" block with:
- Budget match
- Location preference
- Guest count match

---

## Acceptance Criteria

Product is valid if:

✓ User sees "fits / not fits" in < 3 seconds  
✓ ListingCard contains max 5 elements  
✓ Decision block exists on ListingCard and ListingPage  
✓ OwnerDashboard shows money, not metrics  
✓ UI contains no technical terms  
✓ AI data is hidden behind simple conclusions
