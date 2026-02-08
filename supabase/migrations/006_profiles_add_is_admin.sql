-- ============================================
-- LOCUS: add is_admin to profiles
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.is_admin IS 'Admin flag for UI and backend access checks';

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

