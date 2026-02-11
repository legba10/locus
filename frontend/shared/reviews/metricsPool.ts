export type ReviewMetricKey =
  | "cleanliness"
  | "accuracy"
  | "location"
  | "communication"
  | "comfort"
  | "value"
  | "noise"
  | "wifi"
  | "checkin"
  | "safety";

export type ReviewMetricDefinition = {
  key: ReviewMetricKey;
  label: string;
  hint: string;
};

export const METRICS_POOL: ReviewMetricDefinition[] = [
  { key: "cleanliness", label: "Чистота", hint: "Насколько чисто было в квартире" },
  { key: "accuracy", label: "Соответствие", hint: "Насколько описание совпало с реальностью" },
  { key: "location", label: "Локация", hint: "Удобство района и инфраструктуры" },
  { key: "communication", label: "Коммуникация", hint: "Скорость и качество общения с хозяином" },
  { key: "comfort", label: "Комфорт", hint: "Уют, мебель, удобства" },
  { key: "value", label: "Цена/качество", hint: "Оправдана ли цена" },
  { key: "noise", label: "Тишина", hint: "Насколько было тихо" },
  { key: "wifi", label: "Wi‑Fi", hint: "Стабильность и скорость интернета" },
  { key: "checkin", label: "Заселение", hint: "Насколько удобно было заселиться" },
  { key: "safety", label: "Безопасность", hint: "Ощущение безопасности и надежности" },
];

/** Number of metrics to show in the review form (shuffled per user). */
export const REVIEW_METRICS_COUNT = 3;

/** Seeded shuffle for reproducible order (e.g. seed = userId + listingId). */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function pickRandomMetrics(count = REVIEW_METRICS_COUNT, seed?: number): ReviewMetricDefinition[] {
  const shuffled = [...METRICS_POOL];
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.max(1, Math.min(count, shuffled.length)));
}

export function metricLabelByKey(key: string): string {
  return METRICS_POOL.find((m) => m.key === key)?.label ?? key;
}

