-- ============================================
-- LOCUS: Supabase Profiles Table & Auth Setup
-- ============================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates the profiles table, RLS policies, and auto-create trigger

-- ============================================
-- 1. CREATE PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  telegram_id TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles - single source of truth for user data and roles';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users(id) - same as auth.uid()';
COMMENT ON COLUMN public.profiles.role IS 'User role: user, landlord, manager, admin';

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS POLICIES
-- ============================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Users can update their own profile (but NOT role)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Service role can insert profiles (for backend/triggers)
CREATE POLICY "Service role can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- ============================================
-- 4. AUTO-CREATE PROFILE TRIGGER
-- ============================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NULL
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. INDEX FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- 6. ADMIN ROLE ASSIGNMENT
-- ============================================

-- Set admin role for the specified email
-- Run this AFTER the user has signed up
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'legba086@mail.ru';

-- ============================================
-- VERIFICATION QUERIES (run after setup)
-- ============================================

-- Check table exists:
-- SELECT * FROM public.profiles LIMIT 5;

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- Check trigger exists:
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'users';

-- Check admin:
-- SELECT id, email, role FROM public.profiles WHERE email = 'legba086@mail.ru';
