export type ParsedIntent = {
  city?: string;
  maxMonthlyPrice?: number;
  wantsQuiet?: boolean;
  wantsMetro?: boolean;
};

function parseMoneyToNumber(raw: string): number | null {
  const s = raw.trim().toLowerCase();
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*(k|к)?$/i);
  if (!m) return null;
  const n = Number(m[1]!.replace(",", "."));
  if (!Number.isFinite(n)) return null;
  const hasK = Boolean(m[2]);
  return hasK ? Math.round(n * 1000) : Math.round(n);
}

export function parseIntent(query: string, context?: { city?: string }): ParsedIntent {
  const q = query.toLowerCase();

  const wantsQuiet = /(тихо|тихая|тишина|спокойн)/i.test(q);
  const wantsMetro = /(метро|м\.|станц)/i.test(q);

  // "до 50k" / "до 50000"
  let maxMonthlyPrice: number | undefined;
  const budgetMatch = q.match(/до\s+(\d+(?:[.,]\d+)?)\s*(k|к)?/i);
  if (budgetMatch) {
    const parsed = parseMoneyToNumber(`${budgetMatch[1]}${budgetMatch[2] ?? ""}`);
    if (parsed !== null) maxMonthlyPrice = parsed;
  }

  // City: prefer explicit context (UI selection), fallback to keyword match
  let city = context?.city;
  if (!city) {
    if (/(moscow|москва)/i.test(q)) city = "Moscow";
    if (/(spb|питер|санкт)/i.test(q)) city = "Saint Petersburg";
  }

  return { city, maxMonthlyPrice, wantsQuiet, wantsMetro };
}

