-- ============================================
-- LOCUS: RLS policy fix for profile updates
-- ============================================
-- Allows a logged-in user to update their own profile row.
-- NOTE: For testing you can disable RLS on profiles:
--   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

