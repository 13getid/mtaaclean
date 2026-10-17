import { useState } from 'react'
import { Filter, Search, RefreshCw, LayoutDashboard } from 'lucide-react'
import { useStaffOperations } from './hooks/useStaffOperations'
import { ReportQueue } from './components/ReportQueue'
import { Button } from '@/components/ui/Button'
import type { ReportStatus } from '@/lib/constants'

export function StaffDashboardPage() {
  const { reports, isLoading, error, fetchQueue } = useStaffOperations()
  const [selectedFilter, setSelectedFilter] = useState<ReportStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const handleFilterChange = (status: ReportStatus | 'all') => {
    setSelectedFilter(status)
    fetchQueue(status, search)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchQueue(selectedFilter, search)
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-brand-ink">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-brand-ink bg-brand-sage px-2 py-0.5 text-xs font-bold uppercase mb-2">
            <LayoutDashboard size={13} />
            Staff Portal · Tudor Operations
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink">
            Incident Review & Assignment Queue
          </h1>
          <p className="text-sm text-brand-ink/70 mt-1">
            Review incoming resident reports, dispatch cleanup teams, and track operational resolution.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchQueue(selectedFilter, search)}
          leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
        >
          Refresh Queue
        </Button>
      </div>

      {error && (
        <div className="border-2 border-brand-red bg-brand-red/10 p-3 mb-6 text-sm font-semibold text-brand-ink">
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 bg-white border-2 border-brand-ink p-3 shadow-brutal-sm">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold uppercase text-brand-ink/60 flex items-center gap-1 mr-1">
            <Filter size={13} /> Status:
          </span>
          <button
            onClick={() => handleFilterChange('all')}
            className={[
              'px-2.5 py-1 text-xs border border-brand-ink font-semibold transition-colors',
              selectedFilter === 'all'
                ? 'bg-brand-ink text-brand-green'
                : 'bg-brand-offwhite hover:bg-brand-sage text-brand-ink',
            ].join(' ')}
          >
            All
          </button>
          {(['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'] as ReportStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={[
                  'px-2 py-1 text-xs border border-brand-ink font-semibold transition-colors capitalize',
                  selectedFilter === status
                    ? 'bg-brand-ink text-brand-green'
                    : 'bg-white hover:bg-brand-sage text-brand-ink',
                ].join(' ')}
              >
                {status.replace('_', ' ')}
              </button>
            ),
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description..."
              className="w-full text-xs p-1.5 pl-7 border border-brand-ink bg-brand-offwhite focus:outline-none"
            />
            <Search size={13} className="absolute left-2 top-2 text-brand-ink/50" />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Incident Queue List */}
      <ReportQueue reports={reports} isLoading={isLoading} />
    </main>
  )
}
