-- =============================================================================
-- Migration 004: Create report_photos table and storage bucket setup
-- MtaaClean Mombasa
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.report_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'before' CHECK (photo_type IN ('before', 'after')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_report_photos_report_id ON public.report_photos(report_id);

-- Enable RLS
ALTER TABLE public.report_photos ENABLE ROW LEVEL SECURITY;

-- 1. Read access: users can read photos belonging to reports they have access to
DROP POLICY IF EXISTS "report_photos_select" ON public.report_photos;
CREATE POLICY "report_photos_select"
  ON public.report_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.id = report_photos.report_id
      AND (
        r.reporter_id = (auth.jwt() ->> 'sub')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('staff', 'admin')
      )
    )
  );

-- =============================================================================
-- Supabase Storage bucket policy guidelines (to be executed in Supabase Storage)
-- =============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', true) ON CONFLICT DO NOTHING;
