-- ============================================
-- LOCUS: add tariff to profiles
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tariff TEXT DEFAULT 'free';

COMMENT ON COLUMN public.profiles.tariff IS 'User tariff: free | landlord_basic | landlord_pro';

CREATE INDEX IF NOT EXISTS idx_profiles_tariff ON public.profiles(tariff);
