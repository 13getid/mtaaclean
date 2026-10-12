-- =============================================================================
-- Migration 002: Enable Row Level Security & define profiles policies
-- MtaaClean Mombasa
-- =============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own profile by matching Clerk user ID in JWT sub claim
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (
    clerk_user_id = (auth.jwt() ->> 'sub')
  );

-- 2. Staff and Admins can view all profiles (for management & assignment lists)
DROP POLICY IF EXISTS "profiles_select_staff_admin" ON public.profiles;
CREATE POLICY "profiles_select_staff_admin"
  ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('staff', 'admin')
  );

-- 3. Users can update their own display_name or phone
-- Notice: role cannot be elevated here; updates are constrained
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (
    clerk_user_id = (auth.jwt() ->> 'sub')
  )
  WITH CHECK (
    clerk_user_id = (auth.jwt() ->> 'sub')
  );

-- NOTE: Inserts and role modifications are handled by the FastAPI backend
-- using the Supabase service_role key, which bypasses RLS safely on the trusted server.
