import { Link } from 'react-router-dom'
import { Plus, AlertCircle, Calendar, MapPin, ChevronRight, Inbox } from 'lucide-react'
import { useMyReports } from './hooks/useMyReports'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Report } from '@/types'

export function MyReportsPage() {
  const { reports, isLoading, error, refresh } = useMyReports()

  const counts = {
    submitted: reports.filter((r) => r.status === 'submitted').length,
    in_progress: reports.filter((r) => ['under_review', 'assigned', 'in_progress'].includes(r.status)).length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-brand-ink">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink">
            My Submitted Reports
          </h1>
          <p className="text-sm text-brand-ink/70 mt-1">
            Track resolution status and updates on your reported waste issues in Tudor.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
            <span className="border border-brand-ink bg-brand-offwhite px-2 py-0.5 font-bold">
              {counts.submitted} Pending
            </span>
            <span className="border border-brand-ink bg-brand-orange px-2 py-0.5 font-bold">
              {counts.in_progress} Active / In Progress
            </span>
            <span className="border border-brand-ink bg-brand-green px-2 py-0.5 font-bold">
              {counts.resolved} Resolved
            </span>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          to="/report"
          leftIcon={<Plus size={18} />}
        >
          New Report
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="border-2 border-brand-red bg-brand-red/10 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-brand-red" size={20} />
            <p className="text-sm font-semibold text-brand-ink">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refresh()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
          <span
            className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-brand-ink border-t-transparent"
            aria-hidden="true"
          />
          <p className="font-semibold text-sm text-brand-ink font-body">Loading your reports...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && reports.length === 0 && (
        <Card className="text-center py-16 px-6 bg-white shadow-brutal flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-brand-sage border-2 border-brand-ink flex items-center justify-center">
            <Inbox size={32} className="text-brand-ink" />
          </div>
          <div className="max-w-md">
            <h2 className="font-display text-xl font-bold text-brand-ink mb-1">
              No reports submitted yet
            </h2>
            <p className="text-sm text-brand-ink/70">
              When you spot illegal dumping or uncollected refuse in Tudor, submit a report here and follow the cleanup progress.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            to="/report"
            leftIcon={<Plus size={18} />}
          >
            Submit Your First Report
          </Button>
        </Card>
      )}

      {/* Reports list */}
      {!isLoading && reports.length > 0 && (
        <div className="flex flex-col gap-4">
          {reports.map((report: Report) => {
            const formattedDate = new Date(report.submitted_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="group block"
              >
                <Card
                  hoverable
                  className="bg-white transition-all group-hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge status={report.status} />
                        <span className="text-xs text-brand-ink/60 flex items-center gap-1">
                          <Calendar size={13} />
                          {formattedDate}
                        </span>
                      </div>
                      <p className="font-display font-semibold text-base text-brand-ink line-clamp-2">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-brand-ink/70">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {report.area_name || 'Tudor'}
                        </span>
                        {report.address_hint && (
                          <span className="text-brand-ink/50 truncate max-w-xs">
                            • {report.address_hint}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-ink/10">
                      <span className="text-xs font-bold text-brand-ink group-hover:underline">
                        View Details
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
      )}
    </main>
  )
}
