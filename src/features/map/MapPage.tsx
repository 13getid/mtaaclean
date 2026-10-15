import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { MombasaMap, type PublicMapReport } from './MombasaMap'
import { Button } from '@/components/ui/Button'
import { API_BASE_URL } from '@/lib/constants'

export function MapPage() {
  const [reports, setReports] = useState<PublicMapReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPublicReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/api/reports/map/public`)
      if (!res.ok) {
        throw new Error('Failed to load map data from server.')
      }
      const data = await res.json()
      setReports(data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicReports()
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-brand-ink">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-brand-ink bg-brand-green px-2 py-0.5 text-xs font-bold uppercase mb-2">
            <MapPin size={12} />
            Tudor Operational Zone
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink">
            Tudor Waste Incident Map
          </h1>
          <p className="text-sm text-brand-ink/70 mt-1">
            Real-time public tracking of verified waste incidents and cleanup status across Tudor, Mombasa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPublicReports}
            leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            to="/report"
            leftIcon={<Plus size={16} />}
          >
            Report Waste
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="border-2 border-brand-red bg-brand-red/10 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-brand-red shrink-0" />
            <p className="text-sm font-semibold text-brand-ink">{error}</p>
          </div>
          <button
            onClick={fetchPublicReports}
            className="text-xs font-bold underline text-brand-ink hover:text-brand-red"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Interactive Map */}
      <MombasaMap reports={reports} isLoading={isLoading} height="580px" />

      {/* Footnote */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-brand-ink/60">
        <span>
          Showing public non-rejected reports within the Tudor Sub-county operational boundary.
        </span>
        <Link to="/reports" className="underline font-semibold hover:text-brand-ink">
          View your submitted reports &rarr;
        </Link>
      </div>
    </main>
  )
}
