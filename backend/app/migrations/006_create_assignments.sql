-- =============================================================================
-- Migration 006: Create assignments table
-- MtaaClean Mombasa
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL REFERENCES public.profiles(clerk_user_id) ON DELETE RESTRICT,
  assigned_by TEXT NOT NULL REFERENCES public.profiles(clerk_user_id) ON DELETE RESTRICT,
  notes TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_report_id ON public.assignments(report_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON public.assignments(assigned_to);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 1. Read access: staff and admins can view assignments, reporter can view assignments of their own report
DROP POLICY IF EXISTS "assignments_select" ON public.assignments;
CREATE POLICY "assignments_select"
  ON public.assignments
  FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('staff', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = assignments.report_id
      AND r.reporter_id = (auth.jwt() ->> 'sub')
    )
  );

-- Note: All assignment creation and re-assignment are executed securely by
-- the FastAPI backend using the Supabase service_role key to enforce audit logging.
