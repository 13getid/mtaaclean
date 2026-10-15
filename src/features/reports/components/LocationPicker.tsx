import { MapPin, Navigation, Info } from 'lucide-react'
import { MAP_CENTER } from '@/lib/constants'

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number) => void
  error?: string
}

// Preset verified locations within Tudor for quick picking in the MVP
const TUDOR_PRESETS = [
  { name: 'Tudor Creek Waterfront', lat: -4.0253, lng: 39.6632 },
  { name: 'Tudor Four Junction', lat: -4.0320, lng: 39.6680 },
  { name: 'Technical University of Mombasa (TUM) Area', lat: -4.0375, lng: 39.6648 },
  { name: 'Tom Mboya Avenue roadside', lat: -4.0410, lng: 39.6705 },
]

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  error,
}: LocationPickerProps) {
  const currentLat = latitude ?? MAP_CENTER[0]
  const currentLng = longitude ?? MAP_CENTER[1]

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
          Location in Tudor <span className="text-brand-red">*</span>
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

      {/* Demonstration Location Map / Target */}
      <div className="border-2 border-brand-ink bg-brand-sage/60 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between bg-white border border-brand-ink p-2 text-xs">
          <span className="font-mono font-bold text-brand-ink">
            Coordinates: {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
          </span>
          <span className="bg-brand-green border border-brand-ink px-1.5 py-0.5 font-bold uppercase tracking-wider text-[10px]">
            Tudor Operational Zone
          </span>
        </div>

        {/* Quick select buttons */}
        <div>
          <span className="text-xs font-bold text-brand-ink/70 block mb-1.5">
            Quick Select Common Tudor Spots:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    'text-left p-2 text-xs border border-brand-ink transition-colors font-medium flex items-center justify-between',
                    isSelected
                      ? 'bg-brand-ink text-brand-green font-bold'
                      : 'bg-white hover:bg-brand-offwhite text-brand-ink',
                  ].join(' ')}
                >
                  <span>{preset.name}</span>
                  {isSelected && <span className="text-xs">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Manual coordinate adjustment inputs */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-ink/20">
          <div>
            <label className="text-[11px] font-bold text-brand-ink block mb-0.5">
              Latitude (Tudor: -4.060 to -4.015)
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude ?? ''}
              onChange={(e) => onLocationChange(parseFloat(e.target.value) || 0, longitude ?? MAP_CENTER[1])}
              placeholder="-4.0253"
              className="w-full text-xs p-1.5 border border-brand-ink font-mono bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-brand-ink block mb-0.5">
              Longitude (Tudor: 39.645 to 39.690)
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude ?? ''}
              onChange={(e) => onLocationChange(latitude ?? MAP_CENTER[0], parseFloat(e.target.value) || 0)}
              placeholder="39.6632"
              className="w-full text-xs p-1.5 border border-brand-ink font-mono bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-brand-ink/70">
          <Info size={13} className="shrink-0" />
          <span>Full interactive Leaflet map pin-drop is enabled in Phase 4.</span>
        </div>
      </div>

      {error && <p className="text-xs text-brand-red font-semibold mt-1">{error}</p>}
    </div>
  )
}
