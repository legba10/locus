"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { apiFetch, apiFetchJson } from "@/shared/utils/apiFetch";
import { CityInput } from "@/shared/components/CityInput";
import { useAuthStore } from "@/domains/auth";
import { useQueryClient } from "@tanstack/react-query";

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

type ExistingPhoto = { id: string; url: string };

type NewPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type WizardData = {
  // Photos
  newPhotos: NewPhoto[];
  existingPhotos: ExistingPhoto[];

  // Main
  title: string;
  description: string;
  type: "apartment" | "room" | "house" | "studio";
  city: string;

  // Details
  rooms: string;
  area: string;
  floor: string;
  totalFloors: string;

  // Amenities
  amenityKeys: string[];

  // Price
  price: string;
  deposit: string;
  negotiable: boolean;
};

const AMENITIES: Array<{ key: string; label: string }> = [
  { key: "wifi", label: "Wi‑Fi" },
  { key: "washer", label: "Стиралка" },
  { key: "air_conditioner", label: "Кондиционер" },
  { key: "balcony", label: "Балкон" },
  { key: "parking", label: "Парковка" },
  { key: "elevator", label: "Лифт" },
  { key: "furniture", label: "Мебель" },
  { key: "pets_allowed", label: "Животные" },
];

function defaultData(): WizardData {
  return {
    newPhotos: [],
    existingPhotos: [],
    title: "",
    description: "",
    type: "apartment",
    city: "",
    rooms: "",
    area: "",
    floor: "",
    totalFloors: "",
    amenityKeys: [],
    price: "",
    deposit: "",
    negotiable: false,
  };
}

function clampFiles(files: File[]): File[] {
  return files.filter(Boolean).slice(0, 10);
}

function uuid(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function stepLabel(step: WizardStep): string {
  switch (step) {
    case 0:
      return "Фото";
    case 1:
      return "Основное";
    case 2:
      return "Характеристики";
    case 3:
      return "Удобства";
    case 4:
      return "Цена";
    case 5:
      return "Превью";
  }
}

function validateStep(step: WizardStep, d: WizardData): string | null {
  if (step === 0) {
    const count = d.newPhotos.length + d.existingPhotos.length;
    if (count === 0) return "Добавьте хотя бы одно фото";
  }
  if (step === 1) {
    if (!d.title.trim()) return "Введите название";
    if (!d.description.trim()) return "Добавьте описание";
    if (!d.city.trim()) return "Выберите город";
  }
  if (step === 4) {
    const p = Number(d.price);
    if (!d.price.trim() || Number.isNaN(p) || p <= 0) return "Укажите цену";
  }
  return null;
}

function draftKey(userId: string): string {
  return `locus_listing_wizard_draft_${userId}`;
}

export function ListingWizard({
  onSuccess,
  onCancel,
  initialListing,
  onLimitReached,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialListing?: any | null;
  onLimitReached?: () => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id ?? "";

  const isEdit = Boolean(initialListing?.id);
  const [step, setStep] = useState<WizardStep>(0);
  const [data, setData] = useState<WizardData>(() => defaultData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  // Mobile UX: scroll to top on step change
  useEffect(() => {
    try {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      /* ignore */
    }
  }, [step]);

  // Autosave (text-only fields) to localStorage
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!userId) return;
    if (isEdit) return; // no autosave for edit
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        const payload = {
          title: data.title,
          description: data.description,
          type: data.type,
          city: data.city,
          rooms: data.rooms,
          area: data.area,
          floor: data.floor,
          totalFloors: data.totalFloors,
          amenityKeys: data.amenityKeys,
          price: data.price,
          deposit: data.deposit,
          negotiable: data.negotiable,
        };
        window.localStorage.setItem(draftKey(userId), JSON.stringify(payload));
      } catch {
        /* ignore */
      }
    }, 450);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isEdit, data.title, data.description, data.type, data.city, data.rooms, data.area, data.floor, data.totalFloors, data.amenityKeys, data.price, data.deposit, data.negotiable]);

  // Load draft on first open (create only)
  useEffect(() => {
    if (!userId) return;
    if (isEdit) return;
    try {
      const raw = window.localStorage.getItem(draftKey(userId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<WizardData>;
      setData((prev) => ({
        ...prev,
        title: parsed.title ?? prev.title,
        description: parsed.description ?? prev.description,
        type: (parsed.type as any) ?? prev.type,
        city: parsed.city ?? prev.city,
        rooms: parsed.rooms ?? prev.rooms,
        area: parsed.area ?? prev.area,
        floor: parsed.floor ?? prev.floor,
        totalFloors: parsed.totalFloors ?? prev.totalFloors,
        amenityKeys: Array.isArray(parsed.amenityKeys) ? parsed.amenityKeys : prev.amenityKeys,
        price: parsed.price ?? prev.price,
        deposit: parsed.deposit ?? prev.deposit,
        negotiable: typeof parsed.negotiable === "boolean" ? parsed.negotiable : prev.negotiable,
      }));
    } catch {
      /* ignore */
    }
    // only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isEdit]);

  // Init from listing (edit)
  useEffect(() => {
    if (!initialListing) {
      setStep(0);
      setError(null);
      setData(defaultData());
      return;
    }
    const houseRules = initialListing.houseRules || {};
    setStep(0);
    setError(null);
    setData({
      newPhotos: [],
      existingPhotos: Array.isArray(initialListing.photos)
        ? initialListing.photos.map((p: any) => ({ id: p.id, url: p.url }))
        : [],
      title: initialListing.title ?? "",
      description: initialListing.description ?? "",
      city: initialListing.city ?? "",
      price: String(initialListing.basePrice ?? ""),
      rooms: String(initialListing.bedrooms ?? ""),
      area: String(houseRules.area ?? ""),
      floor: String(houseRules.floor ?? ""),
      totalFloors: String(houseRules.totalFloors ?? ""),
      type: (houseRules.type ?? initialListing.type ?? "apartment") as WizardData["type"],
      amenityKeys: Array.isArray(initialListing.amenities)
        ? initialListing.amenities.map((a: any) => a?.amenity?.key).filter(Boolean)
        : [],
      deposit: String(houseRules.deposit ?? ""),
      negotiable: Boolean(houseRules.negotiable ?? false),
    });
  }, [initialListing]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      for (const p of data.newPhotos) {
        try {
          URL.revokeObjectURL(p.previewUrl);
        } catch {
          /* ignore */
        }
      }
    };
  }, [data.newPhotos]);

  const progressPct = useMemo(() => Math.round(((step + 1) / 6) * 100), [step]);
  const stepError = validateStep(step, data);

  const limit = user?.listingLimit ?? 1;
  const used = user?.listingUsed ?? 0;
  const canCreate = used < limit;

  async function removeExistingPhoto(photoId: string) {
    if (!initialListing?.id) return;
    await apiFetch(`/listings/${encodeURIComponent(initialListing.id)}/photos/${encodeURIComponent(photoId)}`, {
      method: "DELETE",
    });
    setData((prev) => ({ ...prev, existingPhotos: prev.existingPhotos.filter((p) => p.id !== photoId) }));
  }

  function addFiles(files: File[]) {
    const safe = clampFiles(files);
    const mapped: NewPhoto[] = safe.map((f) => ({
      id: uuid(),
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setData((prev) => ({
      ...prev,
      newPhotos: [...prev.newPhotos, ...mapped].slice(0, 10),
    }));
  }

  function reorderNew(from: number, to: number) {
    setData((prev) => {
      const arr = prev.newPhotos.slice();
      const item = arr[from];
      if (!item) return prev;
      arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...prev, newPhotos: arr };
    });
  }

  async function submit() {
    if (isSubmitting) return;
    setError(null);

    // Final validation (all steps)
    const step0 = validateStep(0, data);
    const step1 = validateStep(1, data);
    const step4 = validateStep(4, data);
    if (step0 || step1 || step4) {
      setError(step0 || step1 || step4);
      return;
    }

    if (!canCreate && !isEdit) {
      onLimitReached?.();
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: data.title.trim(),
        description: data.description.trim(),
        city: data.city.trim(),
        basePrice: Number(data.price),
        currency: "RUB",
        capacityGuests: 2,
        bedrooms: Number(data.rooms || "1") || 1,
        bathrooms: 1,
        type: (data.type ?? "apartment").toUpperCase(),
        houseRules: {
          area: Number(data.area || "0") || undefined,
          floor: Number(data.floor || "0") || undefined,
          totalFloors: Number(data.totalFloors || "0") || undefined,
          type: data.type,
          deposit: data.deposit.trim() ? Number(data.deposit) || undefined : undefined,
          negotiable: Boolean(data.negotiable),
        },
        amenityKeys: data.amenityKeys,
      };

      let listingId: string | undefined = initialListing?.id;
      if (isEdit) {
        await apiFetchJson(`/listings/${encodeURIComponent(String(listingId))}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        const createData = await apiFetchJson<any>("/listings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        listingId = createData?.listing?.id ?? createData?.item?.id ?? createData?.id ?? createData?.listingId;
        if (!listingId) throw new Error("Сервер не вернул ID нового объявления");
      }

      // Upload new photos
      for (let i = 0; i < data.newPhotos.length; i++) {
        const file = data.newPhotos[i]?.file;
        if (!file) continue;
        const form = new FormData();
        form.append("file", file);
        form.append("sortOrder", String(i));
        await apiFetch(`/listings/${encodeURIComponent(String(listingId))}/photos`, { method: "POST", body: form });
      }

      if (!isEdit) {
        await apiFetch(`/listings/${encodeURIComponent(String(listingId))}/publish`, { method: "POST" });
      }

      // Clear draft after success
      if (userId && !isEdit) {
        try {
          window.localStorage.removeItem(draftKey(userId));
        } catch {
          /* ignore */
        }
      }

      // Invalidate listings query (works even if queryClient is not available)
      try {
        await queryClient?.invalidateQueries({ queryKey: ["owner-listings"] });
      } catch {
        /* ignore */
      }

      onSuccess?.();
    } catch (err: any) {
      if (err?.code === "LIMIT_REACHED") {
        onLimitReached?.();
        setError(err?.message ?? "Лимит объявлений исчерпан");
      } else {
        setError(err instanceof Error ? err.message : "Ошибка при сохранении объявления");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function next() {
    const e = validateStep(step, data);
    if (e) {
      setError(e);
      return;
    }
    setError(null);
    setStep((s) => (Math.min(5, (s + 1) as WizardStep) as WizardStep));
  }

  function back() {
    setError(null);
    setStep((s) => (Math.max(0, (s - 1) as WizardStep) as WizardStep));
  }

  return (
    <div ref={topRef} className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[#1C1F26]">{isEdit ? "Редактировать объявление" : "Добавить объявление"}</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Шаг {step + 1}/6 • {stepLabel(step)}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[12px] border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            Закрыть
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-violet-600 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <div
        className={cn(
          "bg-white rounded-[18px] p-5 sm:p-6",
          "shadow-[0_6px_24px_rgba(0,0,0,0.08)]",
          "border border-gray-100/80"
        )}
      >
        {step === 0 && (
          <PhotoStep
            newPhotos={data.newPhotos}
            existingPhotos={data.existingPhotos}
            onAddFiles={addFiles}
            onRemoveNew={(id) => setData((p) => ({ ...p, newPhotos: p.newPhotos.filter((x) => x.id !== id) }))}
            onRemoveExisting={removeExistingPhoto}
            onReorder={reorderNew}
          />
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Field label="Название">
              <input
                value={data.title}
                onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
                className={inputCls}
                placeholder="Квартира в центре"
              />
            </Field>
            <Field label="Описание">
              <textarea
                value={data.description}
                onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
                className={cn(inputCls, "min-h-[120px] resize-none")}
                placeholder="Опишите жильё: ремонт, техника, рядом метро, условия…"
              />
            </Field>
            <Field label="Тип жилья">
              <select
                value={data.type}
                onChange={(e) => setData((p) => ({ ...p, type: e.target.value as any }))}
                className={inputCls}
              >
                <option value="apartment">Квартира</option>
                <option value="room">Комната</option>
                <option value="house">Дом</option>
                <option value="studio">Студия</option>
              </select>
            </Field>
            <Field label="Город">
              <CityInput value={data.city} onChange={(v: string) => setData((p) => ({ ...p, city: v }))} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Комнаты">
              <input value={data.rooms} onChange={(e) => setData((p) => ({ ...p, rooms: e.target.value }))} className={inputCls} inputMode="numeric" placeholder="2" />
            </Field>
            <Field label="Площадь (м²)">
              <input value={data.area} onChange={(e) => setData((p) => ({ ...p, area: e.target.value }))} className={inputCls} inputMode="numeric" placeholder="50" />
            </Field>
            <Field label="Этаж">
              <input value={data.floor} onChange={(e) => setData((p) => ({ ...p, floor: e.target.value }))} className={inputCls} inputMode="numeric" placeholder="7" />
            </Field>
            <Field label="Этажность">
              <input value={data.totalFloors} onChange={(e) => setData((p) => ({ ...p, totalFloors: e.target.value }))} className={inputCls} inputMode="numeric" placeholder="16" />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-[#6B7280]">Выберите удобства</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AMENITIES.map((a) => {
                const checked = data.amenityKeys.includes(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() =>
                      setData((p) => ({
                        ...p,
                        amenityKeys: checked ? p.amenityKeys.filter((x) => x !== a.key) : [...p.amenityKeys, a.key],
                      }))
                    }
                    className={cn(
                      "rounded-[14px] border px-3 py-3 text-[13px] font-semibold text-left transition-colors",
                      checked ? "border-violet-200 bg-violet-50 text-violet-700" : "border-gray-200 bg-white text-[#1C1F26] hover:bg-gray-50"
                    )}
                    aria-pressed={checked}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <Field label="Цена (₽/мес)">
              <input
                value={data.price}
                onChange={(e) => setData((p) => ({ ...p, price: e.target.value }))}
                className={inputCls}
                inputMode="numeric"
                placeholder="30000"
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Депозит (₽)">
                <input
                  value={data.deposit}
                  onChange={(e) => setData((p) => ({ ...p, deposit: e.target.value }))}
                  className={inputCls}
                  inputMode="numeric"
                  placeholder="Например, 30000"
                />
              </Field>
              <div>
                <label className="block text-[13px] font-medium text-[#6B7280] mb-2">Торг</label>
                <button
                  type="button"
                  onClick={() => setData((p) => ({ ...p, negotiable: !p.negotiable }))}
                  className={cn(
                    "w-full rounded-[14px] px-4 py-3 border text-left text-[14px] font-semibold transition-colors",
                    data.negotiable ? "border-violet-200 bg-violet-50 text-violet-700" : "border-gray-200 bg-white text-[#1C1F26] hover:bg-gray-50"
                  )}
                  aria-pressed={data.negotiable}
                >
                  {data.negotiable ? "Возможен торг" : "Без торга"}
                </button>
              </div>
            </div>
            <div className="rounded-[14px] border border-violet-100 bg-violet-50/70 p-4">
              <div className="text-[13px] font-semibold text-violet-700">AI‑совет</div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                После публикации мы покажем динамическую рекомендацию по цене и кнопку «применить цену».
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="text-[14px] font-semibold text-[#1C1F26]">Проверьте данные</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PreviewItem label="Название" value={data.title || "—"} />
              <PreviewItem label="Город" value={data.city || "—"} />
              <PreviewItem label="Тип" value={humanType(data.type)} />
              <PreviewItem label="Цена" value={data.price ? `${data.price} ₽/мес` : "—"} />
              <PreviewItem label="Депозит" value={data.deposit ? `${data.deposit} ₽` : "—"} />
              <PreviewItem label="Торг" value={data.negotiable ? "Да" : "Нет"} />
            </div>
            {data.amenityKeys.length > 0 && (
              <div className="rounded-[14px] border border-gray-100 bg-white p-4">
                <div className="text-[12px] text-[#6B7280]">Удобства</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.amenityKeys.slice(0, 10).map((k) => (
                    <span key={k} className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[12px] text-[#4B5563]">
                      {k.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-[14px] bg-gray-50 p-4 text-[13px] text-[#6B7280]">
              Публикация займёт несколько секунд — загрузим фото и включим объявление.
            </div>
          </div>
        )}
      </div>

      {/* Errors */}
      {(error || stepError) && (
        <div className="rounded-[14px] border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
          {error || stepError}
        </div>
      )}

      {/* Sticky actions */}
      <div className="sticky bottom-4 z-10">
        <div className="rounded-[18px] border border-gray-100 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.10)] flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || isSubmitting}
            className={cn(
              "px-4 py-2 rounded-[14px] text-[14px] font-semibold border",
              step === 0 || isSubmitting ? "border-gray-200 text-gray-400" : "border-gray-200 text-[#1C1F26] hover:bg-gray-50"
            )}
          >
            Назад
          </button>
          <div className="flex-1" />
          {step < 5 ? (
            <button
              type="button"
              onClick={next}
              disabled={isSubmitting}
              className={cn(
                "px-5 py-2 rounded-[14px] text-[14px] font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-[0_4px_14px_rgba(124,58,237,0.35)]",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              Далее
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={isSubmitting}
              className={cn(
                "px-5 py-2 rounded-[14px] text-[14px] font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-[0_4px_14px_rgba(124,58,237,0.35)]",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Публикуем…" : isEdit ? "Сохранить" : "Опубликовать"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-[14px] px-4 py-3 border border-gray-200/60 bg-white/95 text-[#1C1F26] text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#6B7280] mb-2">{label}</label>
      {children}
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-gray-100 bg-white p-4">
      <div className="text-[12px] text-[#6B7280]">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-[#1C1F26]">{value}</div>
    </div>
  );
}

function humanType(t: WizardData["type"]) {
  if (t === "room") return "Комната";
  if (t === "house") return "Дом";
  if (t === "studio") return "Студия";
  return "Квартира";
}

const PhotoStep = ({
  newPhotos,
  existingPhotos,
  onAddFiles,
  onRemoveNew,
  onRemoveExisting,
  onReorder,
}: {
  newPhotos: NewPhoto[];
  existingPhotos: ExistingPhoto[];
  onAddFiles: (files: File[]) => void;
  onRemoveNew: (id: string) => void;
  onRemoveExisting: (id: string) => void | Promise<void>;
  onReorder: (from: number, to: number) => void;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const dragFrom = useRef<number | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) onAddFiles(files);
  };

  const total = newPhotos.length + existingPhotos.length;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-medium text-[#6B7280]">Фотографии</div>
          <div className="text-[12px] text-[#94A3B8]">{total}/10</div>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-[16px] px-6 py-6 text-center transition-colors",
            "min-h-[160px] flex items-center justify-center",
            dragActive ? "border-violet-400 bg-violet-50" : "border-gray-300 bg-gray-50"
          )}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (files.length) onAddFiles(files);
            }}
            className="hidden"
            id="photo-upload-wizard"
          />
          <label htmlFor="photo-upload-wizard" className="cursor-pointer select-none">
            <div className="mx-auto mb-2 h-10 w-10 rounded-[14px] bg-white border border-gray-200 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/photo.svg" alt="" className="h-5 w-5 opacity-70" onError={(e) => ((e.currentTarget.style.display = "none"))} />
              <span className="text-gray-400 text-[18px] leading-none">+</span>
            </div>
            <div className="text-[14px] font-semibold text-[#1C1F26]">Перетащите фото или выберите файлы</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Лучше 5–10 фото, чтобы объявление выглядело живо</div>
          </label>
        </div>
      </div>

      {existingPhotos.length > 0 && (
        <div>
          <div className="text-[12px] text-[#6B7280] mb-2">Текущие фото</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {existingPhotos.map((p) => (
              <div key={p.id} className="relative aspect-square rounded-[14px] overflow-hidden bg-gray-100">
                <Image src={p.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => void onRemoveExisting(p.id)}
                  className="absolute top-2 right-2 rounded-full bg-black/55 text-white w-7 h-7 flex items-center justify-center hover:bg-black/65"
                  aria-label="Удалить фото"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {newPhotos.length > 0 && (
        <div>
          <div className="text-[12px] text-[#6B7280] mb-2">Новые фото (можно перетаскивать для порядка)</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {newPhotos.map((p, idx) => (
              <div
                key={p.id}
                className="relative aspect-square rounded-[14px] overflow-hidden bg-gray-100"
                draggable
                onDragStart={() => (dragFrom.current = idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={() => {
                  const from = dragFrom.current;
                  dragFrom.current = null;
                  if (from == null || from === idx) return;
                  onReorder(from, idx);
                }}
              >
                <Image src={p.previewUrl} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => onRemoveNew(p.id)}
                  className="absolute top-2 right-2 rounded-full bg-black/55 text-white w-7 h-7 flex items-center justify-center hover:bg-black/65"
                  aria-label="Удалить фото"
                >
                  ×
                </button>
                <div className="absolute bottom-2 left-2 rounded-full bg-black/55 text-white px-2 py-0.5 text-[11px]">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

