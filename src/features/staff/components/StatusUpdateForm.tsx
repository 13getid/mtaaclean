import { useState } from 'react'
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { ReportStatus } from '@/lib/constants'

interface StatusUpdateFormProps {
  reportId: string
  currentStatus: ReportStatus
  userRole?: string
  onStatusUpdated: () => void
  updateStatus: (
    reportId: string,
    newStatus: ReportStatus,
    notes?: string,
  ) => Promise<unknown>
}

// Permitted options based on current status
const NEXT_STATUS_OPTIONS: Record<ReportStatus, { status: ReportStatus; label: string }[]> = {
  submitted: [
    { status: 'under_review', label: 'Mark Under Review' },
    { status: 'rejected', label: 'Reject Report' },
  ],
  under_review: [
    { status: 'assigned', label: 'Mark Assigned' },
    { status: 'rejected', label: 'Reject Report' },
  ],
  assigned: [
    { status: 'in_progress', label: 'Mark In Progress (Crew on site)' },
    { status: 'resolved', label: 'Mark Resolved' },
    { status: 'rejected', label: 'Reject Report' },
  ],
  in_progress: [
    { status: 'resolved', label: 'Mark Resolved' },
    { status: 'rejected', label: 'Reject Report' },
  ],
  resolved: [],
  rejected: [{ status: 'under_review', label: 'Reopen Report (Admin only)' }],
}

export function StatusUpdateForm({
  reportId,
  currentStatus,
  userRole = 'staff',
  onStatusUpdated,
  updateStatus,
}: StatusUpdateFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | ''>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const availableOptions = NEXT_STATUS_OPTIONS[currentStatus] || []

  // Check if admin is required to reopen
  const filteredOptions = availableOptions.filter((opt) => {
    if (currentStatus === 'rejected' && opt.status === 'under_review') {
      return userRole === 'admin'
    }
    return true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStatus) {
      setError('Please select a new status.')
      return
    }

    if (selectedStatus === 'rejected' && (!notes || notes.trim().length < 10)) {
      setError('Rejection requires an explanation note of at least 10 characters.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await updateStatus(reportId, selectedStatus, notes)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onStatusUpdated()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Status transition failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-brand-ink bg-white p-5 shadow-brutal flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-brand-ink/10">
        <h3 className="font-display font-bold text-base text-brand-ink flex items-center gap-2">
          <Activity size={18} />
          Operational Status Transition
        </h3>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-brand-ink/60">Current:</span>
          <Badge status={currentStatus} />
        </div>
      </div>

      {error && (
        <div className="border border-brand-red bg-brand-red/10 p-2.5 text-xs font-semibold text-brand-ink flex items-center gap-2">
          <AlertCircle size={14} className="text-brand-red shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="border border-brand-green bg-brand-green/20 p-2.5 text-xs font-semibold text-brand-ink flex items-center gap-2">
          <CheckCircle2 size={14} className="text-brand-ink shrink-0" />
          Status transition recorded in audit trail!
        </div>
      )}

      {filteredOptions.length === 0 ? (
        <p className="text-xs text-brand-ink/70 italic py-2">
          This report is in a terminal state ({currentStatus}). No further transitions permitted.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-ink/70">
              Next Valid Operational Status <span className="text-brand-red">*</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
              className="p-2 border-2 border-brand-ink bg-brand-offwhite text-xs font-semibold text-brand-ink focus:outline-none"
            >
              <option value="">-- Select transition --</option>
              {filteredOptions.map((opt) => (
                <option key={opt.status} value={opt.status}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-ink/70">
              Transition Notes / Operational Justification
              {selectedStatus === 'rejected' && <span className="text-brand-red"> (Required)</span>}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                selectedStatus === 'rejected'
                  ? 'Mandatory reason for rejection (e.g. Outside service boundary, duplicate report #12...)'
                  : 'Optional operational progress note...'
              }
              className="p-2 border-2 border-brand-ink text-xs font-body bg-brand-offwhite focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-brand-ink/10">
            <Button
              type="submit"
              variant={selectedStatus === 'rejected' ? 'danger' : 'primary'}
              size="sm"
              isLoading={isSubmitting}
            >
              Update Operational Status
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
