"use client";

import Link from "next/link";
import { useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import type { UserPlan } from "@/shared/contracts/api";
import { PlanBadge } from "@/components/planBadge/PlanBadge";

export function UpgradeModal({
  open,
  onClose,
  currentPlan,
  used,
  limit,
  reason,
  className,
}: {
  open: boolean;
  onClose: () => void;
  currentPlan: UserPlan;
  used?: number;
  limit?: number;
  reason?: "limit" | "analytics" | "ai" | "general";
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title =
    reason === "limit"
      ? "Хотите больше объявлений?"
      : reason === "analytics"
        ? "Подробная аналитика доступна в PRO"
        : reason === "ai"
          ? "AI‑анализ доступен в PRO"
          : "Улучшить тариф";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Закрыть"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-[22px] border border-white/40 bg-white p-6 shadow-[0_30px_120px_rgba(0,0,0,0.25)]",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#1C1F26]">{title}</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Ваш тариф: <PlanBadge plan={currentPlan} className="ml-2 align-middle" />
              {typeof used === "number" && typeof limit === "number" && (
                <span className="ml-2 text-[#6B7280]">
                  • использовано {used} из {limit}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[12px] bg-gray-100 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-200"
          >
            Закрыть
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <PlanRow plan="FREE" label="FREE" desc="1 объявление, минимальная аналитика" />
          <PlanRow plan="PRO" label="PRO" desc="до 5 объявлений, аналитика и продвижение" highlight />
          <PlanRow plan="AGENCY" label="AGENCY" desc="10+ объявлений, полная аналитика и AI" />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/pricing?reason=${encodeURIComponent(reason ?? "general")}`}
            className="inline-flex flex-1 items-center justify-center rounded-[14px] bg-violet-600 px-5 py-3 text-[14px] font-semibold text-white hover:bg-violet-500"
          >
            Выбрать тариф
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-[14px] bg-gray-100 px-5 py-3 text-[14px] font-semibold text-gray-700 hover:bg-gray-200"
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanRow({
  plan,
  label,
  desc,
  highlight,
}: {
  plan: UserPlan;
  label: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border px-4 py-3",
        highlight
          ? "border-violet-200 bg-violet-50"
          : "border-gray-100 bg-white"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlanBadge plan={plan} />
          <div>
            <div className="text-[14px] font-bold text-[#1C1F26]">{label}</div>
            <div className="text-[12px] text-[#6B7280]">{desc}</div>
          </div>
        </div>
        {highlight && (
          <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-violet-700 border border-violet-200">
            рекомендуем
          </span>
        )}
      </div>
    </div>
  );
}

