-- =============================================================================
-- Migration 003: Create reports table
-- MtaaClean Mombasa
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL REFERENCES public.profiles(clerk_user_id) ON DELETE CASCADE,
  description TEXT NOT NULL CHECK (char_length(description) >= 20),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected')
  ),
  area_name TEXT DEFAULT 'Tudor',
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  address_hint TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_submitted_at ON public.reports(submitted_at DESC);

-- Automatic updated_at trigger
DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;
CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
-- 1. Residents can view their own reports
DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own"
  ON public.reports
  FOR SELECT
  USING (
    reporter_id = (auth.jwt() ->> 'sub')
  );

-- 2. Staff and Admins can view all reports
DROP POLICY IF EXISTS "reports_select_staff_admin" ON public.reports;
CREATE POLICY "reports_select_staff_admin"
  ON public.reports
  FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('staff', 'admin')
  );

-- Note: Privileged inserts and status changes are executed securely via FastAPI
-- using the Supabase service_role key to enforce boundary validation and audit logs.
