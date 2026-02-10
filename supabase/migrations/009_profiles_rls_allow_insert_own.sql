-- Allow authenticated user to INSERT their own profile row (id = auth.uid()).
-- Backend should use SUPABASE_SERVICE_ROLE_KEY for server-side upserts (RLS is then bypassed).
-- This policy helps when profile is created/updated in a context where auth.uid() is set.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
