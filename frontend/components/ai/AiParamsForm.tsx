"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { AiParamField, AiParamSelect } from "./AiParamField";

export interface AiParamsData {
  budget: number;
  rooms: number;
  district: string;
  duration: string;
  propertyType: string;
}

const DEFAULT_PARAMS: AiParamsData = {
  budget: 0,
  rooms: 1,
  district: "",
  duration: "month",
  propertyType: "apartment",
};

const DURATION_OPTIONS = [
  { value: "night", label: "Посуточно" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "long", label: "Долгосрочно" },
];

const PROPERTY_OPTIONS = [
  { value: "apartment", label: "Квартира" },
  { value: "room", label: "Комната" },
  { value: "studio", label: "Студия" },
  { value: "house", label: "Дом" },
];

export interface AiParamsFormProps {
  initialValues?: Partial<AiParamsData>;
  onSave: (data: AiParamsData) => Promise<void>;
  onSkip: () => void;
  isSaving?: boolean;
  className?: string;
}

/** ТЗ №8: форма параметров AI — бюджет, районы, тип, длительность, комнаты. */
export function AiParamsForm({
  initialValues,
  onSave,
  onSkip,
  isSaving = false,
  className,
}: AiParamsFormProps) {
  const [data, setData] = useState<AiParamsData>({
    ...DEFAULT_PARAMS,
    ...initialValues,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", className)}>
      <div className="space-y-4">
        <AiParamField
          label="Бюджет (₽/мес)"
          type="number"
          value={data.budget || ""}
          onChange={(v) => setData((p) => ({ ...p, budget: Number(v) || 0 }))}
          placeholder="30000"
          min={0}
        />
        <AiParamField
          label="Районы (через запятую)"
          value={data.district}
          onChange={(v) => setData((p) => ({ ...p, district: String(v) }))}
          placeholder="Центр, Арбат"
        />
        <AiParamSelect
          label="Тип жилья"
          value={data.propertyType}
          onChange={(v) => setData((p) => ({ ...p, propertyType: v }))}
          options={PROPERTY_OPTIONS}
        />
        <AiParamSelect
          label="Длительность"
          value={data.duration}
          onChange={(v) => setData((p) => ({ ...p, duration: v }))}
          options={DURATION_OPTIONS}
        />
        <AiParamField
          label="Количество комнат"
          type="number"
          value={data.rooms || ""}
          onChange={(v) => setData((p) => ({ ...p, rooms: Number(v) || 0 }))}
          min={1}
          max={10}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "flex-1 sm:flex-none px-6 py-3 rounded-[14px] font-semibold text-[15px]",
            "bg-[var(--accent)] text-[var(--text-on-accent)] hover:opacity-95 transition-opacity",
            "disabled:opacity-70 disabled:cursor-not-allowed"
          )}
        >
          {isSaving ? "Сохранение…" : "Сохранить и продолжить"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={isSaving}
          className={cn(
            "px-6 py-3 rounded-[14px] font-semibold text-[15px]",
            "text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors",
            "disabled:opacity-70"
          )}
        >
          Пропустить
        </button>
      </div>
    </form>
  );
}
