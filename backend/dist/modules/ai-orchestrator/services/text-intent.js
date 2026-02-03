"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIntent = parseIntent;
function parseMoneyToNumber(raw) {
    const s = raw.trim().toLowerCase();
    const m = s.match(/^(\d+(?:[.,]\d+)?)\s*(k|к)?$/i);
    if (!m)
        return null;
    const n = Number(m[1].replace(",", "."));
    if (!Number.isFinite(n))
        return null;
    const hasK = Boolean(m[2]);
    return hasK ? Math.round(n * 1000) : Math.round(n);
}
function parseIntent(query, context) {
    const q = query.toLowerCase();
    const wantsQuiet = /(тихо|тихая|тишина|спокойн)/i.test(q);
    const wantsMetro = /(метро|м\.|станц)/i.test(q);
    let maxMonthlyPrice;
    const budgetMatch = q.match(/до\s+(\d+(?:[.,]\d+)?)\s*(k|к)?/i);
    if (budgetMatch) {
        const parsed = parseMoneyToNumber(`${budgetMatch[1]}${budgetMatch[2] ?? ""}`);
        if (parsed !== null)
            maxMonthlyPrice = parsed;
    }
    let city = context?.city;
    if (!city) {
        if (/(moscow|москва)/i.test(q))
            city = "Moscow";
        if (/(spb|питер|санкт)/i.test(q))
            city = "Saint Petersburg";
    }
    return { city, maxMonthlyPrice, wantsQuiet, wantsMetro };
}
//# sourceMappingURL=text-intent.js.map