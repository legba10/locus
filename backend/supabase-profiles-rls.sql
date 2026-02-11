-- ============================================================
-- RLS для таблицы public.profiles (Supabase)
-- Выполнить в Supabase SQL Editor, если в логах:
--   "new row violates row-level security policy for table profiles"
--
-- Важно: бэкенд должен использовать Service Role Key (обходит RLS).
-- Если бэкенд использует anon key, апсерт профиля с сервера будет блокироваться.
-- Эти политики разрешают доступ к своей строке по auth.uid() (для клиента).
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики с такими именами, если есть
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Читать свой профиль
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Обновлять свой профиль
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Вставлять свою строку профиля (при первом логине)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
