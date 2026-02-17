"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { apiFetch, apiFetchJson } from "@/shared/utils/apiFetch";
import { CityInput } from "@/shared/components/CityInput";
import { useAuthStore } from "@/domains/auth";
import { useQueryClient } from "@tanstack/react-query";
import { PhotoUploader } from "@/components/listing/PhotoUploader";
import type { ListingPhotoTag } from "@/components/listing/photo-upload-types";
import { REQUIRED_TAGS } from "@/components/listing/photo-upload-types";
import { ModeSelect, type ListingMode } from "@/components/listing/ModeSelect";
import { AiLoader } from "@/components/listing/AiLoader";
import { mockAnalyzePhotos } from "@/components/listing/mockAi";

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type ExistingPhoto = { id: string; url: string; tag?: ListingPhotoTag };

type NewPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  tag: ListingPhotoTag;
};

type WizardData = {
  newPhotos: NewPhoto[];
  existingPhotos: ExistingPhoto[];
  coverPhotoIndex: number; // index in combined list (new then existing)

  title: string;
  description: string;
  type: "apartment" | "room" | "house" | "studio";
  city: string;
  addressLine: string;

  rooms: string;
  area: string;
  floor: string;
  totalFloors: string;

  amenityKeys: string[];

  price: string;
  deposit: string;
  negotiable: boolean;
};

// Удобства по категориям (чипы, как в ТЗ)
const AMENITIES_BY_CATEGORY: Array<{ category: string; items: Array<{ key: string; label: string }> }> = [
  { category: "Кухня", items: [{ key: "stove", label: "Плита" }, { key: "microwave", label: "Микроволновка" }, { key: "dishwasher", label: "Посудомойка" }, { key: "fridge", label: "Холодильник" }] },
  { category: "Техника", items: [{ key: "washer", label: "Стиральная машина" }, { key: "tv", label: "ТВ" }, { key: "air_conditioner", label: "Кондиционер" }] },
  { category: "Интернет и связь", items: [{ key: "wifi", label: "Wi‑Fi" }] },
  { category: "Комфорт", items: [{ key: "balcony", label: "Балкон" }, { key: "elevator", label: "Лифт" }, { key: "parking", label: "Парковка" }, { key: "furniture", label: "Мебель" }] },
  { category: "Правила", items: [{ key: "pets_allowed", label: "Животные" }] },
];

const AMENITIES_FLAT = AMENITIES_BY_CATEGORY.flatMap((c) => c.items);

function defaultData(): WizardData {
  return {
    newPhotos: [],
    existingPhotos: [],
    coverPhotoIndex: 0,
    title: "",
    description: "",
    type: "apartment",
    city: "",
    addressLine: "",
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
  return files.filter(Boolean).slice(0, 12);
}

function uuid(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function stepLabel(step: WizardStep, isEdit: boolean): string {
  if (isEdit) {
    const labels: Record<number, string> = { 1: "Фото", 2: "Город и цена", 3: "Основное", 4: "Удобства", 5: "Описание", 6: "Цена", 7: "Превью" };
    return labels[step] ?? "";
  }
  const labels: Record<number, string> = { 0: "Старт", 1: "Фото", 2: "Город и цена", 3: "Основное", 4: "Удобства", 5: "Описание", 6: "Цена", 7: "Превью" };
  return labels[step] ?? "";
}

function validateStep(step: WizardStep, d: WizardData, isEdit: boolean, mode: ListingMode | null): string | null {
  const photoCount = d.newPhotos.length + d.existingPhotos.length;
  if (step === 1) {
    // ТЗ №5: в режиме manual можно без фото
    if (mode === "manual" && !isEdit) return null;
    if (photoCount < 5) return "Добавьте минимум 5 фото (комната и санузел обязательны)";
    const tags = [
      ...d.newPhotos.map((p) => p.tag),
      ...d.existingPhotos.map((p) => p.tag ?? "other"),
    ];
    if (!REQUIRED_TAGS.every((t) => tags.includes(t)))
      return "Добавьте минимум 5 фото (комната и санузел обязательны)";
  }
  if (step === 2) {
    if (!d.city.trim()) return "Выберите город";
    const p = Number(d.price);
    if (!d.price.trim() || Number.isNaN(p) || p <= 0) return "Укажите цену";
  }
  if (step === 5) {
    if (!d.title.trim()) return "Введите название";
    if (!d.description.trim()) return "Добавьте описание";
  }
  if (step === 6) {
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
  /** ТЗ №5: режим размещения. null = экран выбора режима */
  const [mode, setMode] = useState<ListingMode | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  // Mobile UX: scroll to top on step change
  useEffect(() => {
    try {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      /* ignore */
    }
  }, [step]);

  // Autosave каждые 1–2 сек (Create Listing v3)
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!userId) return;
    if (isEdit) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        const payload = {
          title: data.title,
          description: data.description,
          type: data.type,
          city: data.city,
          addressLine: data.addressLine,
          rooms: data.rooms,
          area: data.area,
          floor: data.floor,
          totalFloors: data.totalFloors,
          amenityKeys: data.amenityKeys,
          price: data.price,
          deposit: data.deposit,
          negotiable: data.negotiable,
          coverPhotoIndex: data.coverPhotoIndex,
        };
        window.localStorage.setItem(draftKey(userId), JSON.stringify(payload));
      } catch {
        /* ignore */
      }
    }, 1500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isEdit, data.title, data.description, data.type, data.city, data.addressLine, data.rooms, data.area, data.floor, data.totalFloors, data.amenityKeys, data.price, data.deposit, data.negotiable, data.coverPhotoIndex]);

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
        addressLine: parsed.addressLine ?? prev.addressLine,
        rooms: parsed.rooms ?? prev.rooms,
        area: parsed.area ?? prev.area,
        floor: parsed.floor ?? prev.floor,
        totalFloors: parsed.totalFloors ?? prev.totalFloors,
        amenityKeys: Array.isArray(parsed.amenityKeys) ? parsed.amenityKeys : prev.amenityKeys,
        price: parsed.price ?? prev.price,
        deposit: parsed.deposit ?? prev.deposit,
        negotiable: typeof parsed.negotiable === "boolean" ? parsed.negotiable : prev.negotiable,
        coverPhotoIndex: typeof parsed.coverPhotoIndex === "number" ? parsed.coverPhotoIndex : prev.coverPhotoIndex,
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
    setStep(1); // edit: start at Photos
    setError(null);
    setData({
      newPhotos: [],
      existingPhotos: Array.isArray(initialListing.photos)
        ? initialListing.photos.map((p: any) => ({ id: p.id, url: p.url, tag: "other" as ListingPhotoTag }))
        : [],
      coverPhotoIndex: 0,
      title: initialListing.title ?? "",
      description: initialListing.description ?? "",
      city: initialListing.city ?? "",
      addressLine: initialListing.addressLine ?? "",
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

  // ТЗ №5: для manual поток 0 → 2,3,4,5,6 → 1 (фото) → 7
  const totalSteps = isEdit ? 7 : 8;
  const flowStepIndex = useMemo(() => {
    if (isEdit) return step - 1; // 1..7 → 0..6
    if (mode === "manual") {
      const order = [0, 2, 3, 4, 5, 6, 1, 7] as const;
      const i = order.indexOf(step as (typeof order)[number]);
      return i < 0 ? 0 : i;
    }
    return step; // fast: 0..7
  }, [step, mode, isEdit]);
  const currentStepIndex = isEdit ? step : flowStepIndex + 1;
  const progressPct = useMemo(() => Math.round((currentStepIndex / totalSteps) * 100), [currentStepIndex, totalSteps]);
  const stepError = validateStep(step, data, isEdit, mode);

  const photoItems = useMemo(
    () => [
      ...data.newPhotos.map((p) => ({ id: p.id, preview: p.previewUrl, tag: p.tag, isNew: true })),
      ...data.existingPhotos.map((p) => ({ id: p.id, preview: p.url, tag: (p.tag ?? "other") as ListingPhotoTag, isNew: false })),
    ],
    [data.newPhotos, data.existingPhotos]
  );

  const limit = user?.listingLimit ?? 1;
  const used = user?.listingUsed ?? 0;
  const canCreate = used < limit;

  async function removeExistingPhoto(photoId: string) {
    if (!initialListing?.id) return;
    await apiFetch(`/listings/${encodeURIComponent(initialListing.id)}/photos/${encodeURIComponent(photoId)}`, {
      method: "DELETE",
    });
    setData((prev) => {
      const existingIdx = prev.existingPhotos.findIndex((p) => p.id === photoId);
      if (existingIdx === -1) return prev;
      const idx = prev.newPhotos.length + existingIdx;
      const existingPhotos = prev.existingPhotos.filter((p) => p.id !== photoId);
      const total = prev.newPhotos.length + existingPhotos.length;
      let newCover = prev.coverPhotoIndex;
      if (idx >= 0) {
        if (idx === prev.coverPhotoIndex) newCover = 0;
        else if (idx < prev.coverPhotoIndex) newCover = prev.coverPhotoIndex - 1;
      }
      return { ...prev, existingPhotos, coverPhotoIndex: total ? Math.min(Math.max(0, newCover), total - 1) : 0 };
    });
  }

  function addFiles(files: File[]) {
    const safe = clampFiles(files);
    const mapped: NewPhoto[] = safe.map((f) => ({
      id: uuid(),
      file: f,
      previewUrl: URL.createObjectURL(f),
      tag: "other",
    }));
    setData((prev) => ({
      ...prev,
      newPhotos: [...prev.newPhotos, ...mapped].slice(0, 12),
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

    // Final validation (photos, quick, description, price)
    const v1 = validateStep(1, data, isEdit, mode);
    const v2 = validateStep(2, data, isEdit, mode);
    const v5 = validateStep(5, data, isEdit, mode);
    const v6 = validateStep(6, data, isEdit, mode);
    if (v1 || v2 || v5 || v6) {
      setError(v1 || v2 || v5 || v6);
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
        addressLine: data.addressLine.trim() || undefined,
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

      // Upload new photos (ТЗ №4: обложка первой)
      const photosToUpload = [...data.newPhotos];
      if (data.coverPhotoIndex < photosToUpload.length) {
        const [cover] = photosToUpload.splice(data.coverPhotoIndex, 1);
        if (cover) photosToUpload.unshift(cover);
      }
      for (let i = 0; i < photosToUpload.length; i++) {
        const file = photosToUpload[i]?.file;
        if (!file) continue;
        const form = new FormData();
        form.append("file", file);
        form.append("sortOrder", String(i));
        await apiFetch(`/listings/${encodeURIComponent(String(listingId))}/photos`, { method: "POST", body: form });
      }

      // Create Listing v3: не вызываем publish — объявление уходит на модерацию (PENDING_REVIEW)
      // if (!isEdit) { await apiFetch(.../publish...); }

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

  async function next() {
    const e = validateStep(step, data, isEdit, mode);
    if (e) {
      setError(e);
      return;
    }
    setError(null);
    // ТЗ №5 fast: фото → AI → форма с автозаполнением
    if (step === 1 && mode === "fast") {
      setAiAnalyzing(true);
      try {
        const result = await mockAnalyzePhotos();
        setData((prev) => ({
          ...prev,
          title: result.title,
          type: result.type,
          rooms: String(result.rooms),
          description: result.description ?? prev.description,
        }));
      } finally {
        setAiAnalyzing(false);
        setStep(2);
      }
      return;
    }
    // ТЗ №5 manual: после шага 6 (цена) → фото, после фото → превью
    if (mode === "manual" && !isEdit) {
      if (step === 6) {
        setStep(1);
        return;
      }
      if (step === 1) {
        setStep(7);
        return;
      }
    }
    setStep((s) => (Math.min(7, s + 1) as WizardStep));
  }

  function back() {
    setError(null);
    if (!isEdit && mode !== null) {
      if (mode === "fast") {
        if (step === 1) {
          setStep(0);
          setMode(null);
          return;
        }
        if (step === 2) {
          setStep(1);
          return;
        }
      }
      if (mode === "manual") {
        if (step === 2) {
          setStep(0);
          setMode(null);
          return;
        }
        if (step === 1) {
          setStep(6);
          return;
        }
        if (step === 7) {
          setStep(1);
          return;
        }
      }
    }
    setStep((s) => (Math.max(isEdit ? 1 : 0, s - 1) as WizardStep));
  }

  return (
    <div ref={topRef} className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          {!isEdit && mode !== null && step !== 0 && (
            <button
              type="button"
              onClick={() => {
                setMode(null);
                setStep(0);
                setData(defaultData());
              }}
              className="text-[13px] text-[var(--accent)] hover:underline mb-1 block"
            >
              ← изменить способ размещения
            </button>
          )}
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">{isEdit ? "Редактировать объявление" : "Добавить объявление"}</h1>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
            Шаг {currentStepIndex}/{totalSteps} • {stepLabel(step, isEdit)}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
          >
            Закрыть
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="h-2 w-full rounded-full bg-[var(--bg-input)]">
        <div className="h-2 rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <div
        className={cn(
          "bg-[var(--bg-card)] rounded-[18px] p-5 sm:p-6",
          "shadow-[0_6px_24px_rgba(0,0,0,0.08)]",
          "border border-[var(--border-main)]"
        )}
      >
        {/* ТЗ №5: экран выбора режима */}
        {step === 0 && !isEdit && (
          <ModeSelect
            onSelectFast={() => {
              setMode("fast");
              setStep(1);
            }}
            onSelectManual={() => {
              setMode("manual");
              setStep(2);
            }}
          />
        )}

        {step === 1 && (
          <div className="relative">
            {aiAnalyzing && (
              <div className="absolute inset-0 rounded-[18px] bg-[var(--bg-card)]/95 flex flex-col items-center justify-center gap-3 z-10">
                <AiLoader />
              </div>
            )}
            <PhotoUploader
              items={photoItems}
              coverIndex={data.coverPhotoIndex}
              onAddFiles={addFiles}
              onRemove={(id, isNew) => {
                if (isNew) {
                  setData((p) => {
                    const idx = p.newPhotos.findIndex((x) => x.id === id);
                    const newPhotos = p.newPhotos.filter((x) => x.id !== id);
                    const total = newPhotos.length + p.existingPhotos.length;
                    let newCover = p.coverPhotoIndex;
                    if (idx >= 0) {
                      if (idx === p.coverPhotoIndex) newCover = 0;
                      else if (idx < p.coverPhotoIndex) newCover = p.coverPhotoIndex - 1;
                    }
                    return { ...p, newPhotos, coverPhotoIndex: total ? Math.min(Math.max(0, newCover), total - 1) : 0 };
                  });
                } else void removeExistingPhoto(id);
              }}
              onReorder={(fromIndex, toIndex) => {
                const n = data.newPhotos.length;
                if (fromIndex >= n || toIndex >= n) return;
                setData((prev) => {
                  const arr = prev.newPhotos.slice();
                  const item = arr[fromIndex];
                  if (!item) return prev;
                  arr.splice(fromIndex, 1);
                  arr.splice(toIndex, 0, item);
                  const newCover =
                    fromIndex === prev.coverPhotoIndex ? toIndex : toIndex === prev.coverPhotoIndex ? fromIndex : prev.coverPhotoIndex;
                  return { ...prev, newPhotos: arr, coverPhotoIndex: newCover };
                });
              }}
              onSetCover={(index) => setData((p) => ({ ...p, coverPhotoIndex: index }))}
              onTagChange={(id, tag, isNew) => {
                if (isNew) setData((p) => ({ ...p, newPhotos: p.newPhotos.map((x) => (x.id === id ? { ...x, tag } : x)) }));
                else setData((p) => ({ ...p, existingPhotos: p.existingPhotos.map((x) => (x.id === id ? { ...x, tag } : x)) }));
              }}
              validationError={stepError}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Город">
              <CityInput value={data.city} onChange={(v: string) => setData((p) => ({ ...p, city: v }))} />
            </Field>
            <Field label="Тип жилья">
              <div className="flex flex-wrap gap-2">
                {(["apartment", "room", "house", "studio"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setData((p) => ({ ...p, type: t }))}
                    className={cn(
                      "rounded-[14px] border px-4 py-2.5 text-[13px] font-semibold transition-colors",
                      data.type === t ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                    )}
                  >
                    {humanType(t)}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Цена (₽/мес)">
              <input
                value={data.price}
                onChange={(e) => setData((p) => ({ ...p, price: e.target.value }))}
                className={inputCls}
                inputMode="numeric"
                placeholder="30000"
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Field label="Адрес (необязательно)">
              <input
                value={data.addressLine}
                onChange={(e) => setData((p) => ({ ...p, addressLine: e.target.value }))}
                className={inputCls}
                placeholder="Улица, дом"
              />
            </Field>
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
          </div>
        )}

        {step === 4 && (
          <AmenitiesStepChips
            amenityKeys={data.amenityKeys}
            onChange={(amenityKeys) => setData((p) => ({ ...p, amenityKeys }))}
          />
        )}

        {step === 5 && (
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
            <div className="rounded-[14px] border border-violet-100 bg-violet-50/70 p-4">
              <div className="text-[13px] font-semibold text-violet-700">AI‑описание</div>
              <div className="mt-1 text-[12px] text-[var(--text-secondary)]">Позже здесь можно будет сгенерировать описание одним кликом.</div>
            </div>
          </div>
        )}

        {step === 6 && (
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
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Торг</label>
                <button
                  type="button"
                  onClick={() => setData((p) => ({ ...p, negotiable: !p.negotiable }))}
                  className={cn(
                    "w-full rounded-[14px] px-4 py-3 border text-left text-[14px] font-semibold transition-colors",
                    data.negotiable ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                  )}
                  aria-pressed={data.negotiable}
                >
                  {data.negotiable ? "Возможен торг" : "Без торга"}
                </button>
              </div>
            </div>
            <div className="rounded-[14px] border border-violet-100 bg-violet-50/70 p-4">
              <div className="text-[13px] font-semibold text-violet-700">AI‑совет</div>
              <div className="mt-1 text-[12px] text-[var(--text-secondary)]">После одобрения покажем рекомендацию по цене.</div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <div className="text-[14px] font-semibold text-[var(--text-primary)]">Готово к публикации</div>
            {(data.newPhotos.length + data.existingPhotos.length) < 5 && (
              <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">Добавьте минимум 5 фото для лучшего отклика.</div>
            )}
            {!data.title.trim() && (
              <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">Заполните название.</div>
            )}
            {!data.description.trim() && (
              <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">Добавьте описание.</div>
            )}
            {(!data.price.trim() || Number.isNaN(Number(data.price)) || Number(data.price) <= 0) && (
              <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">Укажите цену.</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PreviewItem label="Название" value={data.title || "—"} />
              <PreviewItem label="Город" value={data.city || "—"} />
              <PreviewItem label="Тип" value={humanType(data.type)} />
              <PreviewItem label="Цена" value={data.price ? `${data.price} ₽/мес` : "—"} />
              <PreviewItem label="Депозит" value={data.deposit ? `${data.deposit} ₽` : "—"} />
              <PreviewItem label="Торг" value={data.negotiable ? "Да" : "Нет"} />
            </div>
            {data.amenityKeys.length > 0 && (
              <div className="rounded-[14px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
                <div className="text-[12px] text-[var(--text-secondary)]">Удобства</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.amenityKeys.slice(0, 10).map((k) => (
                    <span key={k} className="px-2.5 py-1 rounded-full bg-[var(--bg-input)] border border-[var(--border-main)] text-[12px] text-[var(--text-secondary)]">
                      {AMENITIES_FLAT.find((a) => a.key === k)?.label ?? k.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-[14px] bg-gray-50 p-4 text-[13px] text-[#6B7280]">
              После нажатия объявление отправится на проверку. Публикация — после одобрения модератором.
            </div>
          </div>
        )}
      </div>

      {/* Errors */}
      {(error || stepError) && (
        <div className="rounded-[14px] border border-[var(--border-main)] bg-[var(--bg-card)] p-3 text-[13px] text-[#ff6b6b]">
          {error || stepError}
        </div>
      )}

      {/* Sticky actions */}
      <div className="sticky bottom-4 z-10">
        <div className="rounded-[18px] border border-[var(--border-main)] bg-[var(--bg-card)] backdrop-blur px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.10)] flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || (isEdit && step === 1) || isSubmitting}
            className={cn(
              "px-4 py-2 rounded-[14px] text-[14px] font-semibold border",
              (step === 0 || (isEdit && step === 1) || isSubmitting) ? "border-[var(--border-main)] text-[var(--text-muted)]" : "border-[var(--border-main)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
            )}
          >
            Назад
          </button>
          <div className="flex-1" />
          {step < 7 ? (
            <button
              type="button"
              onClick={next}
              disabled={isSubmitting || (step === 0 && mode === null)}
              className={cn(
                "px-5 py-2 rounded-[14px] text-[14px] font-semibold text-[var(--text-on-accent)] bg-[var(--accent)] hover:opacity-95 shadow-[0_4px_14px_rgba(124,58,237,0.35)]",
                (isSubmitting || (step === 0 && mode === null)) && "opacity-70 cursor-not-allowed"
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
                "px-5 py-2 rounded-[14px] text-[14px] font-semibold text-[var(--text-on-accent)] bg-[var(--accent)] hover:opacity-95 shadow-[0_4px_14px_rgba(124,58,237,0.35)]",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Отправляем…" : isEdit ? "Сохранить" : "Отправить на проверку"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-[14px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">{label}</label>
      {children}
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--border-main)] bg-[var(--bg-card)] p-4">
      <div className="text-[12px] text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

function humanType(t: WizardData["type"]) {
  if (t === "room") return "Комната";
  if (t === "house") return "Дом";
  if (t === "studio") return "Студия";
  return "Квартира";
}

// Create Listing v3: фото — сетка мини-карточек [ + ] [ + ] …
const SLOT_SIZE = 88;
const GRID_COLS = 3;

function PhotoStepGrid({
  newPhotos,
  existingPhotos,
  coverPhotoIndex,
  onAddFiles,
  onRemoveNew,
  onRemoveExisting,
  onReorder,
  onSetCover,
}: {
  newPhotos: NewPhoto[];
  existingPhotos: ExistingPhoto[];
  coverPhotoIndex: number;
  onAddFiles: (files: File[]) => void;
  onRemoveNew: (id: string) => void;
  onRemoveExisting: (id: string) => void | Promise<void>;
  onReorder: (from: number, to: number) => void;
  onSetCover: (index: number) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const total = newPhotos.length + existingPhotos.length;
  const combined = useMemo(() => {
    const arr: Array<{ type: "new"; id: string; url: string; idx: number } | { type: "existing"; id: string; url: string; idx: number }> = [];
    newPhotos.forEach((p, i) => arr.push({ type: "new", id: p.id, url: p.previewUrl, idx: i }));
    existingPhotos.forEach((p, i) => arr.push({ type: "existing", id: p.id, url: p.url, idx: i }));
    return arr;
  }, [newPhotos, existingPhotos]);

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
    const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length) onAddFiles(files);
  };

  const slots = Math.max(6, Math.min(12, total + 3));
  const placeholders = Array.from({ length: Math.max(0, slots - total) }, (_, i) => i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">Фото (минимум 5: комната и санузел)</span>
        <span className="text-[12px] text-[#94A3B8]">{total}/12</span>
      </div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "grid gap-2 rounded-[16px] p-2 transition-colors",
          `grid-cols-${GRID_COLS}`,
          dragActive && "bg-violet-50"
        )}
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
      >
        {combined.map((item, globalIdx) => (
          <div
            key={item.type + item.id}
            className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-100 border border-gray-200"
            draggable
            onDragStart={() => (dragFrom.current = globalIdx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              const from = dragFrom.current;
              dragFrom.current = null;
              if (from == null || from === globalIdx) return;
              if (from < newPhotos.length && globalIdx < newPhotos.length) onReorder(from, globalIdx);
            }}
          >
            <Image src={item.url} alt="" fill className="object-cover" sizes={`${SLOT_SIZE}px`} />
            <button
              type="button"
              onClick={() => (item.type === "new" ? onRemoveNew(item.id) : void onRemoveExisting(item.id))}
              className="absolute top-1 right-1 rounded-full bg-black/55 text-white w-6 h-6 flex items-center justify-center hover:bg-black/65 text-[14px] leading-none"
              aria-label="Удалить"
            >
              ×
            </button>
            {coverPhotoIndex === globalIdx && (
              <div className="absolute bottom-1 left-1 rounded bg-violet-600 text-white px-1.5 py-0.5 text-[10px] font-medium">Обложка</div>
            )}
            {coverPhotoIndex !== globalIdx && (
              <button
                type="button"
                onClick={() => onSetCover(globalIdx)}
                className="absolute bottom-1 left-1 rounded bg-black/45 text-white px-1.5 py-0.5 text-[10px] hover:bg-black/55"
              >
                Сделать обложкой
              </button>
            )}
          </div>
        ))}
        {placeholders.map((i) => (
          <label
            key={`ph-${i}`}
            htmlFor="photo-upload-wizard-grid"
            className={cn(
              "aspect-square rounded-[12px] border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
              dragActive ? "border-violet-400 bg-violet-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            )}
          >
            <span className="text-[24px] text-gray-400">+</span>
          </label>
        ))}
      </div>
      <input
        type="file"
        multiple
        accept="image/*"
        id="photo-upload-wizard-grid"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length) onAddFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// Create Listing v3: удобства по категориям, чипы + «Показать всё»
function AmenitiesStepChips({ amenityKeys, onChange }: { amenityKeys: string[]; onChange: (keys: string[]) => void }) {
  const [showAll, setShowAll] = useState(false);
  const toggle = (key: string) => {
    if (amenityKeys.includes(key)) onChange(amenityKeys.filter((k) => k !== key));
    else onChange([...amenityKeys, key]);
  };
  const categories = showAll ? AMENITIES_BY_CATEGORY : AMENITIES_BY_CATEGORY.slice(0, 3);
  return (
    <div className="space-y-4">
      <div className="text-[13px] font-medium text-[#6B7280]">Удобства — выберите чипами</div>
      {categories.map(({ category, items }) => (
        <div key={category}>
          <div className="text-[12px] text-[var(--text-muted)] mb-2">{category}</div>
          <div className="flex flex-wrap gap-2">
            {items.map((a) => {
              const checked = amenityKeys.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggle(a.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                    checked ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                  )}
                  aria-pressed={checked}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!showAll && AMENITIES_BY_CATEGORY.length > 3 && (
        <button type="button" onClick={() => setShowAll(true)} className="text-[13px] font-semibold text-violet-600 hover:text-violet-700">
          Показать всё
        </button>
      )}
    </div>
  );
}

