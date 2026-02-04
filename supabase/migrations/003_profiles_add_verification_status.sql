-- Add verification status to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

COMMENT ON COLUMN public.profiles.verification_status IS 'Verification status: pending | verified';

UPDATE public.profiles
SET verification_status = COALESCE(verification_status, 'pending')
WHERE verification_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
