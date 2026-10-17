import { useState } from 'react'
import { UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { StaffMember } from '../hooks/useStaffOperations'

interface AssignmentFormProps {
  reportId: string
  currentAssigneeName?: string
  staffMembers: StaffMember[]
  onAssigned: () => void
  assignReport: (reportId: string, assignedTo: string, notes?: string) => Promise<unknown>
}

export function AssignmentForm({
  reportId,
  currentAssigneeName,
  staffMembers,
  onAssigned,
  assignReport,
}: AssignmentFormProps) {
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaffId) {
      setError('Please select a staff member or cleanup team.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await assignReport(reportId, selectedStaffId, instructions)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onAssigned()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Assignment failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-brand-ink bg-white p-5 shadow-brutal flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-brand-ink/10">
        <h3 className="font-display font-bold text-base text-brand-ink flex items-center gap-2">
          <UserCheck size={18} />
          Assign to Cleanup Team
        </h3>
        {currentAssigneeName && (
          <span className="text-xs bg-brand-sage border border-brand-ink px-2 py-0.5 font-bold">
            Assigned: {currentAssigneeName}
          </span>
        )}
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
          Assignment recorded successfully!
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-brand-ink/70">
          Responsible Staff / Lead <span className="text-brand-red">*</span>
        </label>
        <select
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          className="p-2 border-2 border-brand-ink bg-brand-offwhite text-xs font-semibold text-brand-ink focus:outline-none"
        >
          <option value="">-- Choose staff member --</option>
          {staffMembers.map((member) => (
            <option key={member.clerk_user_id} value={member.clerk_user_id}>
              {member.display_name} ({member.role})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-brand-ink/70">
          Assignment Instructions / Crew Notes
        </label>
        <textarea
          rows={2}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. Needs small truck dispatch for bulk vegetative refuse by Thursday morning..."
          className="p-2 border-2 border-brand-ink text-xs font-body bg-brand-offwhite focus:outline-none"
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-brand-ink/10">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
        >
          Confirm Assignment
        </Button>
      </div>
    </form>
  )
}
