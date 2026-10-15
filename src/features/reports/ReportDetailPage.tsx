import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Calendar, MapPin, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { getAuthenticatedSupabaseClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Report, ReportPhoto, StatusHistoryEntry } from '@/types'

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getToken } = useAuth()
  const [report, setReport] = useState<Report | null>(null)
  const [photos, setPhotos] = useState<ReportPhoto[]>([])
  const [history, setHistory] = useState<StatusHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReportDetail() {
      if (!id) return

      try {
        setIsLoading(true)
        setError(null)

        const token = await getToken({ template: 'supabase' }).catch(() => getToken())
        const supabase = getAuthenticatedSupabaseClient(token)

        // 1. Fetch report details
        const { data: reportData, error: reportErr } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single()

        if (reportErr) throw reportErr
        setReport(reportData as Report)

        // 2. Fetch photos
        const { data: photoData } = await supabase
          .from('report_photos')
          .select('*')
          .eq('report_id', id)

        if (photoData) {
          // Resolve signed URLs or public URLs for display
          const resolvedPhotos = await Promise.all(
            photoData.map(async (photo) => {
              const { data: urlData } = await supabase.storage
                .from('report-photos')
                .createSignedUrl(photo.storage_path, 3600)

              return {
                ...photo,
                signed_url: urlData?.signedUrl || undefined,
              }
            }),
          )
          setPhotos(resolvedPhotos)
        }

        // 3. Fetch status history
        const { data: historyData } = await supabase
          .from('status_history')
          .select('*')
          .eq('report_id', id)
          .order('changed_at', { ascending: true })

        if (historyData) {
          setHistory(historyData as StatusHistoryEntry[])
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load report details.')
      } finally {
        setIsLoading(false)
      }
    }

    loadReportDetail()
  }, [id, getToken])

  if (isLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-brand-ink border-t-transparent"
          aria-hidden="true"
        />
        <p className="font-semibold text-sm text-brand-ink font-body">Loading report data...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Card className="p-8 bg-white shadow-brutal flex flex-col items-center gap-4">
          <AlertCircle size={32} className="text-brand-red" />
          <h1 className="font-display text-2xl font-bold">Report Not Found</h1>
          <p className="text-sm text-brand-ink/70">
            {error || 'This report does not exist or you do not have permission to view it.'}
          </p>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 font-bold text-sm underline text-brand-ink hover:text-brand-green"
          >
            <ArrowLeft size={16} /> Return to My Reports
          </Link>
        </Card>
      </main>
    )
  }

  const formattedDate = new Date(report.submitted_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link
        to="/reports"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline mb-6"
      >
        <ArrowLeft size={16} />
        Back to My Reports
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Report Content & Evidence */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-white p-6 shadow-brutal flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-brand-ink/10">
              <Badge status={report.status} />
              <span className="text-xs text-brand-ink/60 flex items-center gap-1">
                <Calendar size={13} />
                {formattedDate}
              </span>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-ink/50 mb-1">
                Description
              </h2>
              <p className="text-base text-brand-ink font-body leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            <div className="pt-4 border-t border-brand-ink/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-brand-ink">
                <MapPin size={16} className="text-brand-ink shrink-0" />
                <span className="font-semibold">{report.area_name || 'Tudor'}</span>
                {report.address_hint && (
                  <span className="text-brand-ink/60">({report.address_hint})</span>
                )}
              </div>
              <div className="text-xs font-mono text-brand-ink/50 pl-6">
                Lat: {report.latitude}, Lng: {report.longitude}
              </div>
            </div>
          </Card>

          {/* Evidence Photos */}
          <Card className="bg-white p-6 shadow-brutal">
            <h2 className="font-display text-lg font-bold text-brand-ink mb-4">
              Photographic Evidence
            </h2>
            {photos.length === 0 ? (
              <p className="text-xs text-brand-ink/60">No photos available for this report.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="border-2 border-brand-ink bg-brand-offwhite p-1">
                    {photo.signed_url ? (
                      <img
                        src={photo.signed_url}
                        alt="Evidence photo"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-brand-sage/40 flex items-center justify-center text-xs text-brand-ink/60">
                        Loading image...
                      </div>
                    )}
                    <div className="p-2 flex items-center justify-between text-[11px] font-bold uppercase">
                      <span>{photo.photo_type} evidence</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Status Timeline & Audit */}
        <div className="flex flex-col gap-6">
          <Card className="bg-white p-6 shadow-brutal">
            <h2 className="font-display text-lg font-bold text-brand-ink mb-4 flex items-center gap-2">
              <Clock size={18} />
              Status History
            </h2>

            {history.length === 0 ? (
              <p className="text-xs text-brand-ink/60">No status changes recorded yet.</p>
            ) : (
              <div className="relative border-l-2 border-brand-ink ml-3 pl-4 flex flex-col gap-6 my-2">
                {history.map((step) => {
                  const stepDate = new Date(step.changed_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <div key={step.id} className="relative flex flex-col gap-1">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 bg-brand-green border-2 border-brand-ink rounded-full" />
                      <div className="flex items-center gap-2">
                        <Badge status={step.new_status} />
                      </div>
                      <span className="text-[11px] text-brand-ink/50">{stepDate}</span>
                      {step.notes && (
                        <p className="text-xs text-brand-ink/80 mt-1 italic">"{step.notes}"</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-brand-ink/10 flex items-center gap-2 text-xs text-brand-ink/60">
              <CheckCircle2 size={14} className="text-brand-green" />
              <span>Immutable audit trail maintained server-side.</span>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
