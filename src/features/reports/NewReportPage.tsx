import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { ReportForm } from './components/ReportForm'
import { Card } from '@/components/ui/Card'

export function NewReportPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Back to My Reports
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink">
              Report Waste Incident
            </h1>
            <p className="text-sm text-brand-ink/70 mt-1">
              Submit photo evidence and coordinates within Tudor, Mombasa.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 border border-brand-ink bg-brand-green/30 px-2.5 py-1 text-xs font-bold text-brand-ink">
            <ShieldCheck size={14} />
            <span>Tudor Scope Verified</span>
          </div>
        </div>
      </div>

      <Card className="shadow-brutal bg-white p-6 sm:p-8">
        <ReportForm />
      </Card>
    </main>
  )
}
