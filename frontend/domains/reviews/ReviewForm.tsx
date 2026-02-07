"use client";

import { useMemo, useState } from "react";
import { apiFetchJson } from "@/shared/utils/apiFetch";
import { cn } from "@/shared/utils/cn";
import { pickRandomMetrics, type ReviewMetricDefinition } from "@/shared/reviews/metricsPool";

type MetricState = { metricKey: string; value: number };

export function ReviewForm({
  listingId,
  onSubmitted,
}: {
  listingId: string;
  onSubmitted?: () => void;
}) {
  const metricsDefs = useMemo<ReviewMetricDefinition[]>(() => pickRandomMetrics(6), []);
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState("");
  const [metrics, setMetrics] = useState<MetricState[]>(
    metricsDefs.map((m) => ({ metricKey: m.key, value: 75 }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setMetricValue = (metricKey: string, value: number) => {
    setMetrics((prev) =>
      prev.map((m) => (m.metricKey === metricKey ? { ...m, value } : m))
    );
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await apiFetchJson("/reviews", {
        method: "POST",
        body: JSON.stringify({
          listingId,
          rating,
          text: text.trim() || null,
          metrics,
        }),
      });
      setSuccess(true);
      onSubmitted?.();
    } catch (e: any) {
      if (e?.code === "REVIEW_ALREADY_EXISTS") {
        setError("Вы уже оставили отзыв для этого объявления.");
      } else {
        setError(e instanceof Error ? e.message : "Не удалось отправить отзыв");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("rounded-[18px] border border-gray-100/80 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.08)]")}>
      <h3 className="text-[18px] font-bold text-[#1C1F26]">Оставить отзыв</h3>
      <p className="mt-1 text-[13px] text-[#6B7280]">
        Оцените по шкале и настройте метрики (0–100). Выберем 6 случайных, чтобы форма была быстрой.
      </p>

      <div className="mt-5">
        <div className="text-[13px] font-semibold text-[#1C1F26] mb-2">Рейтинг</div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const v = i + 1;
            const active = v <= rating;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setRating(v)}
                className={cn(
                  "h-9 w-9 rounded-[12px] border text-[14px] font-bold transition-colors",
                  active ? "border-amber-200 bg-amber-50 text-amber-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                )}
                aria-label={`Рейтинг ${v}`}
              >
                ★
              </button>
            );
          })}
          <span className="ml-2 text-[13px] text-[#6B7280]">{rating}/5</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[13px] font-semibold text-[#1C1F26] mb-2">Комментарий</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Коротко: что понравилось / что улучшить"
          className={cn(
            "w-full rounded-[14px] border border-gray-200/70 bg-white px-4 py-3 text-[14px] text-[#1C1F26]",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
          )}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metricsDefs.map((def) => {
          const value = metrics.find((m) => m.metricKey === def.key)?.value ?? 0;
          return (
            <div key={def.key} className="rounded-[16px] border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-bold text-[#1C1F26]">{def.label}</div>
                  <div className="text-[12px] text-[#6B7280]">{def.hint}</div>
                </div>
                <div className="text-[13px] font-extrabold text-violet-700">{value}</div>
              </div>
              <input
                className="mt-3 w-full accent-violet-600"
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) => setMetricValue(def.key, Number(e.target.value))}
              />
            </div>
          );
        })}
      </div>

      {error && <div className="mt-4 text-[13px] text-red-600">{error}</div>}
      {success && <div className="mt-4 text-[13px] text-emerald-700">Спасибо! Отзыв отправлен.</div>}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className={cn(
            "inline-flex flex-1 items-center justify-center rounded-[14px] bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-violet-500",
            submitting && "opacity-70 cursor-not-allowed"
          )}
        >
          {submitting ? "Отправка..." : "Отправить отзыв"}
        </button>
      </div>
    </div>
  );
}

