import { Link } from 'react-router-dom'
import { Calendar, MapPin, ChevronRight, User, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { StaffReportItem } from '../hooks/useStaffOperations'

interface ReportQueueProps {
  reports: StaffReportItem[]
  isLoading: boolean
}

export function ReportQueue({ reports, isLoading }: ReportQueueProps) {
  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-brand-ink border-t-transparent"
          aria-hidden="true"
        />
        <p className="font-semibold text-sm text-brand-ink">Loading staff queue...</p>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <Card className="text-center py-16 px-6 bg-white shadow-brutal flex flex-col items-center gap-2">
        <h3 className="font-display font-bold text-lg text-brand-ink">No reports found</h3>
        <p className="text-xs text-brand-ink/60">
          Try adjusting your status filter or search query.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((report) => {
        const formattedDate = new Date(report.submitted_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <Link
            key={report.id}
            to={`/staff/reports/${report.id}`}
            className="group block"
          >
            <Card
              hoverable
              className="bg-white p-4 transition-all group-hover:-translate-y-0.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge status={report.status} />
                    <span className="text-xs text-brand-ink/60 flex items-center gap-1">
                      <Calendar size={12} />
                      {formattedDate}
                    </span>
                    {report.assigned_to_name && (
                      <span className="text-xs bg-brand-sage border border-brand-ink px-1.5 py-0.2 font-bold text-brand-ink">
                        Assigned: {report.assigned_to_name}
                      </span>
                    )}
                  </div>

                  <p className="font-display font-semibold text-base text-brand-ink line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-ink/70">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin size={13} />
                      {report.area_name || 'Tudor'}
                    </span>
                    {report.reporter_name && (
                      <span className="flex items-center gap-1 text-brand-ink/60">
                        <User size={13} />
                        {report.reporter_name}
                      </span>
                    )}
                    {report.photos_count > 0 && (
                      <span className="flex items-center gap-1 text-brand-ink/60">
                        <ImageIcon size={13} />
                        {report.photos_count} photo(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-ink/10">
                  <span className="text-xs font-bold text-brand-ink group-hover:underline">
                    Review / Action
                  </span>
                  <div className="w-8 h-8 bg-brand-offwhite border border-brand-ink flex items-center justify-center group-hover:bg-brand-green transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
