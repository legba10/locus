-- ТЗ-6, ТЗ-8: расширение Review и Listing (без удаления существующих полей)

-- Review: metrics_json, ai_weight, visit_type, stay_days, updatedAt
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "metricsJson" JSONB;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "aiWeight" DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "visitType" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "stayDays" INTEGER;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Review" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Listing: rating_cache для кэша рейтинга и метрик (ТЗ-8)
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "ratingCache" JSONB;

-- ТЗ-9: таблица вопросов для формы отзыва
CREATE TABLE IF NOT EXISTS "ReviewQuestion" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewQuestion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ReviewQuestion_key_key" ON "ReviewQuestion"("key");
CREATE INDEX IF NOT EXISTS "ReviewQuestion_active_idx" ON "ReviewQuestion"("active");

-- Сид вопросов (ТЗ-9): вставка только при отсутствии
INSERT INTO "ReviewQuestion" ("id", "key", "label", "active") VALUES
  ('q-cleanliness', 'cleanliness', 'Чистота', true),
  ('q-noise', 'noise', 'Тишина', true),
  ('q-comfort', 'comfort', 'Комфорт', true),
  ('q-location', 'location', 'Район', true),
  ('q-host', 'host', 'Хозяин', true),
  ('q-safety', 'safety', 'Безопасность', true),
  ('q-light', 'light', 'Освещение', true),
  ('q-internet', 'internet', 'Интернет', true),
  ('q-value', 'value', 'Цена/качество', true)
ON CONFLICT ("key") DO NOTHING;
