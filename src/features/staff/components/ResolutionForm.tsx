import { useState } from 'react'
import { CheckCircle2, AlertCircle, Camera } from 'lucide-react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getAuthenticatedSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import type { ReportStatus } from '@/lib/constants'

interface ResolutionFormProps {
  reportId: string
  onResolved: () => void
  updateStatus: (
    reportId: string,
    newStatus: ReportStatus,
    notes?: string,
    afterPhotoPath?: string,
    afterPhotoMime?: string,
  ) => Promise<unknown>
}

export function ResolutionForm({
  reportId,
  onResolved,
  updateStatus,
}: ResolutionFormProps) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAfterPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolutionNotes.trim()) {
      setError('Please provide resolution notes detailing the completed cleanup.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      let storagePath: string | undefined
      let mimeType: string | undefined

      // Optional upload of after-cleanup photo
      if (afterPhoto && user) {
        const token = await getToken({ template: 'supabase' }).catch(() => getToken())
        const supabase = getAuthenticatedSupabaseClient(token)
        const fileExt = afterPhoto.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${Date.now()}_after_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadErr } = await supabase.storage
          .from('report-photos')
          .upload(path, afterPhoto, { contentType: afterPhoto.type })

        if (uploadErr) {
          throw new Error(`Failed to upload after-photo: ${uploadErr.message}`)
        }

        storagePath = path
        mimeType = afterPhoto.type
      }

      await updateStatus(reportId, 'resolved', resolutionNotes, storagePath, mimeType)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onResolved()
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record resolution.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-brand-ink bg-white p-5 shadow-brutal flex flex-col gap-4">
      <div className="pb-3 border-b-2 border-brand-ink/10 flex items-center justify-between">
        <h3 className="font-display font-bold text-base text-brand-ink flex items-center gap-2">
          <CheckCircle2 size={18} className="text-brand-green" />
          Record Incident Resolution
        </h3>
        <span className="text-xs bg-brand-green border border-brand-ink px-2 py-0.5 font-bold uppercase">
          Finalize Report
        </span>
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
          Incident successfully marked resolved!
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-brand-ink/70">
          Completion Notes & Summary <span className="text-brand-red">*</span>
        </label>
        <textarea
          rows={3}
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          placeholder="e.g. 1.5 tons of illegal construction debris and mixed plastic waste collected by Team 2. Site swept clean and warning notice posted."
          className="p-2 border-2 border-brand-ink text-xs font-body bg-brand-offwhite focus:outline-none"
        />
      </div>

      {/* Optional After-Photo Evidence */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-brand-ink/70 flex items-center gap-1.5">
          <Camera size={14} />
          After-Cleanup Photograph (Optional)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="text-xs file:mr-3 file:py-1 file:px-3 file:border file:border-brand-ink file:bg-brand-sage file:text-brand-ink file:font-semibold"
        />
        {preview && (
          <div className="mt-2 w-32 h-24 border-2 border-brand-ink bg-brand-offwhite overflow-hidden">
            <img src={preview} alt="After cleanup preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-brand-ink/10">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
        >
          Confirm Resolution
        </Button>
      </div>
    </form>
  )
}
