-- ============================================================
-- ВЫПОЛНИТЬ В SUPABASE SQL EDITOR (Dashboard → SQL Editor)
-- Таблица: public.profiles (Supabase Auth profiles)
-- Цель: убрать ошибку "missing column username" и синхронизировать с кодом
-- ============================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Если в таблице уже есть full_name / avatar_url — ничего не делаем.
-- Если колонки id (uuid PK) нет — таблица создаётся через Supabase Auth.
