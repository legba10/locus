"use client";

import { cn } from "@/shared/utils/cn";
import type { UserPlan } from "@/shared/contracts/api";

const LABEL: Record<UserPlan, string> = {
  FREE: "FREE",
  PRO: "PRO",
  AGENCY: "AGENCY",
};

const STYLES: Record<UserPlan, string> = {
  FREE: "bg-gray-100 text-gray-700 border-gray-200/70",
  PRO: "bg-violet-50 text-violet-700 border-violet-200/70",
  AGENCY: "bg-amber-50 text-amber-800 border-amber-200/70",
};

export function PlanBadge({
  plan,
  className,
}: {
  plan: UserPlan;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold tracking-wide",
        STYLES[plan],
        className
      )}
    >
      {LABEL[plan]}
    </span>
  );
}

