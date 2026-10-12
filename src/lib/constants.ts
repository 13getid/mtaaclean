/**
 * lib/constants.ts
 *
 * Single source of truth for palette tokens, map configuration,
 * report status labels, and any other values used across components.
 * Import from here instead of hard-coding strings in components.
 */

// ── Brand palette ────────────────────────────────────────────────
export const COLORS = {
  offwhite: '#F7F5EE',
  ink:      '#20211D',
  green:    '#B8ED70',
  sage:     '#DCE8D4',
  orange:   '#F1A078',
  red:      '#E53935',
  white:    '#FFFFFF',
} as const

// ── Map configuration ────────────────────────────────────────────
// Centre of Tudor, Mombasa (approximate)
export const MAP_CENTER: [number, number] = [-4.0253, 39.6632]
export const MAP_DEFAULT_ZOOM = 14

// Rough bounding box for Tudor Sub-county, Mombasa
// Used as a first-pass filter before the full polygon check.
// Source: demonstration boundary — not an official government dataset.
export const TUDOR_BOUNDS = {
  north: -4.000,
  south: -4.060,
  east:  39.700,
  west:  39.630,
} as const

// Tile provider — configurable via env variable
export const TILE_URL =
  import.meta.env.VITE_TILE_URL ??
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const TILE_ATTRIBUTION =
  import.meta.env.VITE_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// ── Report status definitions ────────────────────────────────────
export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'

export const STATUS_LABELS: Record<ReportStatus, string> = {
  submitted:    'Submitted',
  under_review: 'Under Review',
  assigned:     'Assigned',
  in_progress:  'In Progress',
  resolved:     'Resolved',
  rejected:     'Rejected',
}

// Tailwind classes for each status badge
// bg and text are chosen to meet WCAG AA contrast requirements
export const STATUS_STYLES: Record<ReportStatus, { bg: string; text: string }> = {
  submitted:    { bg: 'bg-brand-offwhite', text: 'text-brand-ink' },
  under_review: { bg: 'bg-brand-sage',     text: 'text-brand-ink' },
  assigned:     { bg: 'bg-brand-green',    text: 'text-brand-ink' },
  in_progress:  { bg: 'bg-brand-orange',   text: 'text-brand-ink' },
  resolved:     { bg: 'bg-brand-ink',      text: 'text-brand-green' },
  rejected:     { bg: 'bg-brand-red',      text: 'text-white' },
}

// ── API base URL ─────────────────────────────────────────────────
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
