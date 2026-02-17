"use client";

import { cn } from "@/shared/utils/cn";

const inputCls =
  "w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]";

export interface AiParamFieldProps {
  label: string;
  id?: string;
  type?: "text" | "number";
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

/** ТЗ №8: один параметр AI — лейбл + инпут. */
export function AiParamField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  className,
}: AiParamFieldProps) {
  const inputId = id ?? `ai-param-${label.replace(/\s/g, "-")}`;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={inputId} className="block text-[13px] font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => (type === "number" ? onChange(Number(e.target.value) || 0) : onChange(e.target.value))}
        placeholder={placeholder}
        min={min}
        max={max}
        className={inputCls}
      />
    </div>
  );
}

export interface AiParamSelectOption {
  value: string;
  label: string;
}

export interface AiParamSelectProps {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: AiParamSelectOption[];
  className?: string;
}

/** Выбор из списка (тип жилья, длительность и т.д.). */
export function AiParamSelect({
  label,
  id,
  value,
  onChange,
  options,
  className,
}: AiParamSelectProps) {
  const inputId = id ?? `ai-select-${label.replace(/\s/g, "-")}`;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={inputId} className="block text-[13px] font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
