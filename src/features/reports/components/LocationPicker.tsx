import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { MapPin, Navigation } from 'lucide-react'
import {
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  TILE_URL,
  TILE_ATTRIBUTION,
  TUDOR_POLYGON_LATLNGS,
} from '@/lib/constants'
import { locationPickerIcon } from '@/features/map/ReportMarker'

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number) => void
  error?: string
}

// Preset locations within Tudor for quick picking
const TUDOR_PRESETS = [
  { name: 'Tudor Creek Waterfront', lat: -4.0253, lng: 39.6632 },
  { name: 'Tudor Four Junction', lat: -4.032, lng: 39.668 },
  { name: 'Technical University of Mombasa (TUM)', lat: -4.0375, lng: 39.6648 },
  { name: 'Tom Mboya Avenue', lat: -4.041, lng: 39.6705 },
]

/**
 * Component to handle map clicks and sync marker position
 */
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/**
 * Controller to smoothly pan the map when external coordinates change
 */
function PanController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.panTo([lat, lng], { animate: true })
  }, [lat, lng, map])
  return null
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  error,
}: LocationPickerProps) {
  const selectedLat = latitude ?? MAP_CENTER[0]
  const selectedLng = longitude ?? MAP_CENTER[1]

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        alert(`Location access denied or unavailable: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-display font-bold text-sm text-brand-ink uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={16} />
          Pin Location in Tudor <span className="text-brand-red">*</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-xs font-semibold text-brand-ink bg-brand-green border border-brand-ink px-2 py-1 shadow-brutal-sm hover:translate-x-0.5 transition-transform flex items-center gap-1"
        >
          <Navigation size={12} />
          Detect My GPS
        </button>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="border-2 border-brand-ink bg-white overflow-hidden shadow-brutal-sm">
        <div className="h-64 sm:h-72 w-full relative z-0">
          <MapContainer
            center={[selectedLat, selectedLng]}
            zoom={MAP_DEFAULT_ZOOM}
            scrollWheelZoom={false}
            className="h-full w-full"
            style={{ height: '100%', width: '100%', background: '#F7F5EE' }}
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

            {/* Operational Boundary Overlay */}
            <Polygon
              positions={TUDOR_POLYGON_LATLNGS}
              pathOptions={{
                color: '#20211D',
                weight: 2,
                fillColor: '#B8ED70',
                fillOpacity: 0.15,
                dashArray: '4, 4',
              }}
            />

            {/* Interactive Selected Marker */}
            <Marker
              position={[selectedLat, selectedLng]}
              icon={locationPickerIcon}
            />

            {/* Event Handler and Pan Controller */}
            <MapClickHandler onLocationSelect={onLocationChange} />
            <PanController lat={selectedLat} lng={selectedLng} />
          </MapContainer>

          {/* Map Helper overlay badge */}
          <div className="absolute bottom-2 left-2 z-[400] bg-white/95 border border-brand-ink px-2 py-0.5 text-[11px] font-semibold text-brand-ink pointer-events-none shadow-brutal-sm">
            Click anywhere in the green zone to move the pin
          </div>
        </div>

        {/* Selected Coordinates Status */}
        <div className="p-3 bg-brand-offwhite border-t-2 border-brand-ink flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-brand-ink">
              {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
            </span>
            <span className="bg-brand-green border border-brand-ink px-1.5 py-0.5 font-bold uppercase tracking-wider text-[10px]">
              Tudor Zone
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-brand-ink/70">Presets:</span>
            {TUDOR_PRESETS.map((preset) => {
              const isSelected =
                latitude !== null &&
                longitude !== null &&
                Math.abs(latitude - preset.lat) < 0.0001 &&
                Math.abs(longitude - preset.lng) < 0.0001

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onLocationChange(preset.lat, preset.lng)}
                  className={[
                    'px-2 py-0.5 text-[11px] border border-brand-ink transition-colors font-medium',
                    isSelected
                      ? 'bg-brand-ink text-brand-green font-bold'
                      : 'bg-white hover:bg-brand-sage text-brand-ink',
                  ].join(' ')}
                >
                  {preset.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-brand-red font-semibold mt-1">{error}</p>}
    </div>
  )
}
