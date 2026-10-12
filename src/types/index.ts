/**
 * types/index.ts
 *
 * Shared TypeScript types used across the frontend.
 * These mirror the database schema defined in docs/backend_schema.md.
 */

import type { ReportStatus } from '@/lib/constants'

// ── User / Profile ───────────────────────────────────────────────
export type UserRole = 'resident' | 'staff' | 'admin'

export interface Profile {
  id: string
  clerk_user_id: string
  display_name: string
  email: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

// ── Reports ──────────────────────────────────────────────────────
export interface Report {
  id: string
  reporter_id: string
  description: string
  status: ReportStatus
  area_name?: string
  latitude: number
  longitude: number
  address_hint?: string
  submitted_at: string
  updated_at: string
  // Joined fields (populated on detail view)
  photos?: ReportPhoto[]
  status_history?: StatusHistoryEntry[]
  current_assignment?: Assignment
}

// ── Report photo ─────────────────────────────────────────────────
export type PhotoType = 'before' | 'after'

export interface ReportPhoto {
  id: string
  report_id: string
  storage_path: string
  mime_type: string
  photo_type: PhotoType
  uploaded_at: string
  // Populated client-side from a signed URL
  signed_url?: string
}

// ── Status history ───────────────────────────────────────────────
export interface StatusHistoryEntry {
  id: string
  report_id: string
  previous_status: ReportStatus | null
  new_status: ReportStatus
  actor_id: string
  actor_name?: string  // Joined from profiles for display
  notes?: string
  changed_at: string
}

// ── Assignment ───────────────────────────────────────────────────
export interface Assignment {
  id: string
  report_id: string
  assigned_to: string
  assigned_to_name?: string  // Joined for display
  assigned_by: string
  notes?: string
  assigned_at: string
}

// ── Audit log ────────────────────────────────────────────────────
export interface AuditLog {
  id: string
  actor_id: string
  actor_name?: string
  action: string
  target_type?: string
  target_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

// ── API response wrappers ────────────────────────────────────────
export interface ApiError {
  detail: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// ── Form types ───────────────────────────────────────────────────
export interface NewReportFormValues {
  description: string
  address_hint?: string
  latitude: number | null
  longitude: number | null
  photo: File | null
}
