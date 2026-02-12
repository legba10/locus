-- ТЗ-8: meta в Notification для дедупа напоминаний об отзыве
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "meta" JSONB;
