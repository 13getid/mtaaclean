-- =============================================================================
-- Migration 005: Create status_history table
-- MtaaClean Mombasa
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL CHECK (
    new_status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected')
  ),
  actor_id TEXT NOT NULL REFERENCES public.profiles(clerk_user_id) ON DELETE RESTRICT,
  notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_status_history_report_id ON public.status_history(report_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON public.status_history(changed_at ASC);

-- Enable RLS
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- RLS: Read access mirrors report visibility
DROP POLICY IF EXISTS "status_history_select" ON public.status_history;
CREATE POLICY "status_history_select"
  ON public.status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = status_history.report_id
      AND (
        r.reporter_id = (auth.jwt() ->> 'sub')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('staff', 'admin')
      )
    )
  );
