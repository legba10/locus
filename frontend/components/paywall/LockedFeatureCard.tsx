"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";

export function LockedFeatureCard({
  title,
  description,
  ctaHref = "/pricing",
  ctaLabel = "Открыть тариф",
  className,
  icon,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-gray-100/80 bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[12px] bg-gray-100 text-gray-700">
          {icon ?? (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11V7m0 8h.01M7 11V7m10 4V7M5 11h14v10H5V11zm2-4h10a2 2 0 012 2v2H5V9a2 2 0 012-2z"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-[#1C1F26]">{title}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-semibold text-gray-600">
              <span aria-hidden>🔒</span> PRO
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#6B7280]">{description}</p>
          <div className="mt-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-[12px] bg-violet-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-violet-500"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

