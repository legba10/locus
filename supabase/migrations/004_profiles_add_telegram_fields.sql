-- ============================================
-- LOCUS: add Telegram identity fields to profiles
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.profiles.username IS 'Telegram username in @user format';
COMMENT ON COLUMN public.profiles.first_name IS 'Telegram first name';
COMMENT ON COLUMN public.profiles.last_name IS 'Telegram last name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Telegram photo URL';

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

