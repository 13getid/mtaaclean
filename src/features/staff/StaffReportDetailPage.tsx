import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Calendar, MapPin, AlertCircle, Clock } from 'lucide-react'
import { getAuthenticatedSupabaseClient } from '@/lib/supabase'
import { useStaffOperations } from './hooks/useStaffOperations'
import { AssignmentForm } from './components/AssignmentForm'
import { StatusUpdateForm } from './components/StatusUpdateForm'
import { ResolutionForm } from './components/ResolutionForm'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useProfile } from '@/hooks/useProfile'
import type { Report, ReportPhoto, StatusHistoryEntry } from '@/types'

export function StaffReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getToken } = useAuth()
  const { role } = useProfile()
  const { staffMembers, assignReport, updateStatus } = useStaffOperations()

  const [report, setReport] = useState<Report | null>(null)
  const [photos, setPhotos] = useState<ReportPhoto[]>([])
  const [history, setHistory] = useState<StatusHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const token = await getToken({ template: 'supabase' }).catch(() => getToken())
      const supabase = getAuthenticatedSupabaseClient(token)

      // Fetch report
      const { data: reportData, error: repErr } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single()

      if (repErr) throw repErr
      setReport(reportData as Report)

      // Fetch photos
      const { data: photoData } = await supabase
        .from('report_photos')
        .select('*')
        .eq('report_id', id)

      if (photoData) {
        const resolved = await Promise.all(
          photoData.map(async (p) => {
            const { data: urlData } = await supabase.storage
              .from('report-photos')
              .createSignedUrl(p.storage_path, 3600)
            return { ...p, signed_url: urlData?.signedUrl }
          }),
        )
        setPhotos(resolved)
      }

      // Fetch status history
      const { data: histData } = await supabase
        .from('status_history')
        .select('*')
        .eq('report_id', id)
        .order('changed_at', { ascending: true })

      if (histData) setHistory(histData as StatusHistoryEntry[])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading report.')
    } finally {
      setIsLoading(false)
    }
  }, [id, getToken])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  if (isLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-brand-ink border-t-transparent"
          aria-hidden="true"
        />
        <p className="font-semibold text-sm text-brand-ink">Loading incident file...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Card className="p-8 bg-white shadow-brutal flex flex-col items-center gap-3">
          <AlertCircle size={32} className="text-brand-red" />
          <h2 className="font-display text-xl font-bold">Report Not Found</h2>
          <p className="text-sm text-brand-ink/70">{error || 'Unable to open incident file.'}</p>
          <Link to="/staff" className="text-sm font-bold underline text-brand-ink hover:text-brand-green">
            Return to Queue
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/staff"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline mb-6"
      >
        <ArrowLeft size={16} />
        Back to Staff Queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Incident Report Information */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-white p-6 shadow-brutal flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-brand-ink/10">
              <Badge status={report.status} />
              <span className="text-xs text-brand-ink/60 flex items-center gap-1">
                <Calendar size={13} />
                {new Date(report.submitted_at).toLocaleString('en-GB')}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-ink/50 mb-1">
                Report Description
              </h3>
              <p className="text-base text-brand-ink font-body leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            <div className="pt-3 border-t border-brand-ink/10 flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-brand-ink">
                <MapPin size={14} />
                <span>{report.area_name || 'Tudor'}</span>
                {report.address_hint && <span className="text-brand-ink/60">({report.address_hint})</span>}
              </div>
              <span className="font-mono text-brand-ink/50 pl-5">
                Coordinates: {report.latitude}, {report.longitude}
              </span>
            </div>
          </Card>

          {/* Evidence Photos */}
          <Card className="bg-white p-6 shadow-brutal">
            <h3 className="font-display text-lg font-bold text-brand-ink mb-4">
              Photographic Evidence
            </h3>
            {photos.length === 0 ? (
              <p className="text-xs text-brand-ink/60">No photos attached.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="border-2 border-brand-ink bg-brand-offwhite p-1">
                    {photo.signed_url ? (
                      <img
                        src={photo.signed_url}
                        alt={`${photo.photo_type} evidence`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-brand-sage/40 flex items-center justify-center text-xs">
                        Loading image...
                      </div>
                    )}
                    <div className="p-2 flex items-center justify-between text-[11px] font-bold uppercase">
                      <span>{photo.photo_type} cleanup evidence</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Status Timeline */}
          <Card className="bg-white p-6 shadow-brutal">
            <h3 className="font-display text-lg font-bold text-brand-ink mb-4 flex items-center gap-2">
              <Clock size={18} />
              Status History Audit Trail
            </h3>
            <div className="relative border-l-2 border-brand-ink ml-3 pl-4 flex flex-col gap-5 my-2">
              {history.map((step) => (
                <div key={step.id} className="relative flex flex-col gap-1">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 bg-brand-green border-2 border-brand-ink rounded-full" />
                  <div className="flex items-center gap-2">
                    <Badge status={step.new_status} />
                  </div>
                  <span className="text-[11px] text-brand-ink/50">
                    {new Date(step.changed_at).toLocaleString('en-GB')}
                  </span>
                  {step.notes && <p className="text-xs text-brand-ink/80 italic mt-0.5">"{step.notes}"</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Operational Actions Panel */}
        <div className="flex flex-col gap-6">
          {/* Assignment Module */}
          <AssignmentForm
            reportId={report.id}
            staffMembers={staffMembers}
            onAssigned={loadReport}
            assignReport={assignReport}
          />

          {/* Operational Status Transitions */}
          <StatusUpdateForm
            reportId={report.id}
            currentStatus={report.status}
            userRole={role}
            onStatusUpdated={loadReport}
            updateStatus={updateStatus}
          />

          {/* Resolution & Completion */}
          {['assigned', 'in_progress'].includes(report.status) && (
            <ResolutionForm
              reportId={report.id}
              onResolved={loadReport}
              updateStatus={updateStatus}
            />
          )}
        </div>
      </div>
    </main>
  )
}
