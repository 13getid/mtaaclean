/**
 * components/ui/Badge.tsx
 *
 * Status badge for report statuses.
 * Colour-coded per STATUS_STYLES in constants.ts.
 * Always includes a text label (colour is never the only signal).
 */

import { STATUS_LABELS, STATUS_STYLES, type ReportStatus } from '@/lib/constants'

interface BadgeProps {
  status: ReportStatus
  className?: string
}

export function Badge({ status, className = '' }: BadgeProps) {
  const { bg, text } = STATUS_STYLES[status]
  return (
    <span
      className={`badge ${bg} ${text} ${className}`}
      role="status"
      aria-label={`Status: ${STATUS_LABELS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
