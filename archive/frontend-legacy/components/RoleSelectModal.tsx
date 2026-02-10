"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { apiFetchRaw } from "@/shared/api/client";

export function RoleSelectModal({
  open,
  onClose,
  onSelected,
}: {
  open: boolean;
  onClose: () => void;
  onSelected: (role: "renter" | "landlord") => Promise<void> | void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setIsSaving(false);
  }, [open]);

  if (!open) return null;

  async function select(role: "renter" | "landlord") {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await apiFetchRaw("/profile", {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Ошибка: ${res.status}`);
      }
      await onSelected(role);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось сохранить роль";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-[22px] border border-white/40 bg-white p-6 shadow-[0_30px_120px_rgba(0,0,0,0.25)]"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#1C1F26]">Выберите роль</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Это не регистрация — просто уточним, что вы хотите делать в LOCUS.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[12px] bg-gray-100 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-200"
            disabled={isSaving}
          >
            Закрыть
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void select("renter")}
            disabled={isSaving}
            className={cn(
              "rounded-[18px] border border-gray-100 bg-white p-4 text-left",
              "shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow",
              isSaving && "opacity-70 cursor-not-allowed"
            )}
          >
            <div className="text-[15px] font-bold text-[#1C1F26]">Ищу жильё</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">Подбор вариантов, избранное, сообщения</div>
          </button>

          <button
            type="button"
            onClick={() => void select("landlord")}
            disabled={isSaving}
            className={cn(
              "rounded-[18px] border border-violet-200 bg-violet-50 p-4 text-left",
              "shadow-[0_8px_30px_rgba(123,74,226,0.18)] hover:shadow-[0_14px_50px_rgba(123,74,226,0.24)] transition-shadow",
              isSaving && "opacity-70 cursor-not-allowed"
            )}
          >
            <div className="text-[15px] font-bold text-[#1C1F26]">Сдаю жильё</div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Бесплатно разместить 1 объявление (FREE), затем можно расширить лимит
            </div>
          </button>
        </div>

        {error && <div className="mt-4 text-[13px] text-red-600">{error}</div>}
      </div>
    </div>
  );
}

