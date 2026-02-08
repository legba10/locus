-- ============================================
-- LOCUS: add plan + listing limits to profiles
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS listing_limit INT DEFAULT 1;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS listing_used INT DEFAULT 0;

COMMENT ON COLUMN public.profiles.plan IS 'Business plan: free | landlord_basic | landlord_pro';
COMMENT ON COLUMN public.profiles.listing_limit IS 'How many listings user can create';
COMMENT ON COLUMN public.profiles.listing_used IS 'How many listings user already created (counter)';

CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);
