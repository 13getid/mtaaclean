import { useState, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
} from 'react-leaflet'
import { Link } from 'react-router-dom'
import { Filter, Calendar, MapPin, Eye } from 'lucide-react'
import {
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  TILE_URL,
  TILE_ATTRIBUTION,
  TUDOR_POLYGON_LATLNGS,
  type ReportStatus,
} from '@/lib/constants'
import { createStatusMarkerIcon } from './ReportMarker'
import { Badge } from '@/components/ui/Badge'
import type { Report } from '@/types'

export type PublicMapReport = Pick<
  Report,
  'id' | 'status' | 'area_name' | 'latitude' | 'longitude' | 'submitted_at'
>

interface MombasaMapProps {
  reports: PublicMapReport[]
  isLoading?: boolean
  height?: string
}

export function MombasaMap({
  reports,
  isLoading = false,
  height = '540px',
}: MombasaMapProps) {
  const [selectedFilter, setSelectedFilter] = useState<ReportStatus | 'all'>('all')

  const filteredReports = useMemo(() => {
    if (selectedFilter === 'all') return reports
    return reports.filter((r) => r.status === selectedFilter)
  }, [reports, selectedFilter])

  return (
    <div className="flex flex-col gap-4">
      {/* Map Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-brand-ink p-3 shadow-brutal-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink">
          <Filter size={15} />
          <span>Status Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={[
              'px-2.5 py-1 text-xs border border-brand-ink font-semibold transition-colors',
              selectedFilter === 'all'
                ? 'bg-brand-ink text-brand-green'
                : 'bg-brand-offwhite text-brand-ink hover:bg-brand-sage',
            ].join(' ')}
          >
            All ({reports.length})
          </button>

          {(['submitted', 'under_review', 'assigned', 'in_progress', 'resolved'] as ReportStatus[]).map(
            (status) => {
              const count = reports.filter((r) => r.status === status).length
              const isSelected = selectedFilter === status
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedFilter(status)}
                  className={[
                    'px-2 py-1 text-xs border border-brand-ink font-semibold transition-colors',
                    isSelected
                      ? 'bg-brand-ink text-brand-green'
                      : 'bg-white text-brand-ink hover:bg-brand-sage',
                  ].join(' ')}
                >
                  <span className="capitalize">{status.replace('_', ' ')}</span> ({count})
                </button>
              )
            },
          )}
        </div>
      </div>

      {/* Main Leaflet Map */}
      <div
        className="relative border-2 border-brand-ink bg-white overflow-hidden shadow-brutal"
        style={{ height }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-[1000] bg-white/80 flex items-center justify-center gap-2 font-semibold text-sm">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-ink border-t-transparent" />
            Loading incident markers...
          </div>
        )}

        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#F7F5EE' }}
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

          {/* Operational Polygon Boundary */}
          <Polygon
            positions={TUDOR_POLYGON_LATLNGS}
            pathOptions={{
              color: '#20211D',
              weight: 2.5,
              fillColor: '#B8ED70',
              fillOpacity: 0.12,
              dashArray: '6, 6',
            }}
          />

          {/* Report Markers */}
          {filteredReports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createStatusMarkerIcon(report.status)}
            >
              <Popup className="mtaaclean-popup">
                <div className="p-1 min-w-[200px] flex flex-col gap-2 font-body text-brand-ink">
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-brand-ink/20">
                    <Badge status={report.status} />
                    <span className="text-[11px] text-brand-ink/60 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(report.submitted_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <MapPin size={13} className="text-brand-ink/70" />
                    <span>{report.area_name || 'Tudor'}</span>
                  </div>

                  <div className="text-[10px] font-mono text-brand-ink/50">
                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </div>

                  <Link
                    to={`/reports/${report.id}`}
                    className="mt-1 flex items-center justify-center gap-1.5 bg-brand-green text-brand-ink border border-brand-ink py-1 text-xs font-bold hover:bg-brand-ink hover:text-brand-green transition-colors"
                  >
                    <Eye size={12} />
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 border-2 border-brand-ink p-2.5 shadow-brutal-sm text-xs flex flex-col gap-1.5">
          <span className="font-display font-bold uppercase tracking-wider text-[10px]">
            Zone & Status Legend
          </span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-brand-green/30 border border-brand-ink border-dashed inline-block" />
            <span className="text-[11px]">Tudor Operational Zone</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 border-t border-brand-ink/10 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-offwhite border border-brand-ink inline-block" />
              Submitted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-sage border border-brand-ink inline-block" />
              Under Review
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-green border border-brand-ink inline-block" />
              Assigned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-orange border border-brand-ink inline-block" />
              In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-ink border border-brand-ink inline-block" />
              Resolved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
