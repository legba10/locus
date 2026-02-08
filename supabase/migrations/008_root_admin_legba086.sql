-- ============================================
-- LOCUS: Root administrator — legba086@mail.ru
-- Источник истины для роли: backend ROOT_ADMIN_EMAIL.
-- Эта миграция синхронизирует Supabase profiles для UI/совместимости.
-- ============================================

UPDATE public.profiles
SET is_admin = true
WHERE LOWER(TRIM(email)) = 'legba086@mail.ru';
