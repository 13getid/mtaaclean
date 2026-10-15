import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, FileText, Compass, Send } from 'lucide-react'
import { reportSchema, type ReportFormData } from '../schemas/reportSchema'
import { PhotoUpload } from './PhotoUpload'
import { LocationPicker } from './LocationPicker'
import { useSubmitReport } from '../hooks/useSubmitReport'
import { Button } from '@/components/ui/Button'
import { MAP_CENTER } from '@/lib/constants'

export function ReportForm() {
  const navigate = useNavigate()
  const { submitReport, isSubmitting, error: submitError } = useSubmitReport()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      description: '',
      address_hint: '',
      latitude: MAP_CENTER[0],
      longitude: MAP_CENTER[1],
    },
  })

  const watchedLat = watch('latitude')
  const watchedLng = watch('longitude')

  const onSubmit = async (data: ReportFormData) => {
    try {
      const res = await submitReport(data)
      setSuccessMessage('Report submitted successfully! Redirecting to your reports...')
      setTimeout(() => {
        navigate(`/reports/${res.id}`)
      }, 1500)
    } catch {
      // Error handled by useSubmitReport
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {submitError && (
        <div className="border-2 border-brand-red bg-brand-red/10 p-4 flex items-center gap-3">
          <AlertCircle className="text-brand-red shrink-0" size={20} />
          <p className="text-sm font-semibold text-brand-ink">{submitError}</p>
        </div>
      )}

      {successMessage && (
        <div className="border-2 border-brand-green bg-brand-green/20 p-4 flex items-center gap-3">
          <CheckCircle2 className="text-brand-ink shrink-0" size={20} />
          <p className="text-sm font-semibold text-brand-ink">{successMessage}</p>
        </div>
      )}

      {/* 1. Incident Description */}
      <div className="flex flex-col gap-2">
        <label className="font-display font-bold text-sm text-brand-ink uppercase tracking-wider flex items-center gap-1.5">
          <FileText size={16} />
          Incident Description <span className="text-brand-red">*</span>
        </label>
        <p className="text-xs text-brand-ink/70">
          Describe the type and scale of waste, hazard level, or overflow status (minimum 20 characters).
        </p>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="e.g. Accumulation of domestic plastic waste and uncollected garbage along the drainage trench near Tudor creek..."
          className={[
            'w-full p-3 border-2 border-brand-ink font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green',
            errors.description ? 'border-brand-red' : '',
          ].join(' ')}
        />
        {errors.description && (
          <p className="text-xs text-brand-red font-semibold flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.description.message}
          </p>
        )}
      </div>

      {/* 2. Photo Evidence Upload */}
      <PhotoUpload
        onPhotoSelected={(file) => {
          if (file) {
            setValue('photo', file, { shouldValidate: true })
          }
        }}
        error={errors.photo?.message as string | undefined}
      />

      {/* 3. Location Picker */}
      <LocationPicker
        latitude={watchedLat}
        longitude={watchedLng}
        onLocationChange={(lat, lng) => {
          setValue('latitude', lat, { shouldValidate: true })
          setValue('longitude', lng, { shouldValidate: true })
        }}
        error={errors.latitude?.message || errors.longitude?.message}
      />

      {/* 4. Landmark / Address Hint */}
      <div className="flex flex-col gap-2">
        <label className="font-display font-bold text-sm text-brand-ink uppercase tracking-wider flex items-center gap-1.5">
          <Compass size={16} />
          Landmark or Address Hint (Optional)
        </label>
        <input
          {...register('address_hint')}
          type="text"
          placeholder="e.g. Opposite the dispensary gate, behind the market stall"
          className="w-full p-3 border-2 border-brand-ink font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
        {errors.address_hint && (
          <p className="text-xs text-brand-red font-semibold">
            {errors.address_hint.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t-2 border-brand-ink flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<Send size={18} />}
        >
          {isSubmitting ? 'Validating & Submitting...' : 'Submit Waste Report'}
        </Button>
      </div>
    </form>
  )
}
