import L from 'leaflet'
import type { ReportStatus } from '@/lib/constants'

// Color map according to neo-brutalist theme
const STATUS_HEX: Record<ReportStatus, string> = {
  submitted: '#F7F5EE',
  under_review: '#DCE8D4',
  assigned: '#B8ED70',
  in_progress: '#F1A078',
  resolved: '#20211D',
  rejected: '#E53935',
}

/**
 * Creates an accessible SVG pin icon styled in neo-brutalist aesthetic with status-coded fill.
 */
export function createStatusMarkerIcon(status: ReportStatus = 'submitted') {
  const fillColor = STATUS_HEX[status] || '#B8ED70'
  const strokeColor = '#20211D'
  const innerDot = status === 'resolved' ? '#B8ED70' : '#20211D'

  const svgHtml = `
    <div style="position: relative; width: 30px; height: 38px; transform: translate(-15px, -36px);">
      <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 1C7.268 1 1 7.268 1 15C1 25.5 15 37 15 37C15 37 29 25.5 29 15C29 7.268 22.732 1 15 1Z" 
          fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="15" cy="14" r="5" fill="${innerDot}" stroke="${strokeColor}" stroke-width="1.5"/>
      </svg>
      <div style="position: absolute; bottom: 0; left: 11px; width: 8px; height: 3px; background: rgba(32,33,29,0.3); border-radius: 50%;"></div>
    </div>
  `

  return L.divIcon({
    html: svgHtml,
    className: 'mtaaclean-pin-marker',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -38],
  })
}

/**
 * Pin marker for interactive picking
 */
export const locationPickerIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 34px; height: 42px; transform: translate(-17px, -40px);">
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 1C8.716 1 2 7.716 2 16C2 27.5 17 40 17 40C17 40 32 27.5 32 16C32 7.716 25.284 1 17 1Z" 
          fill="#B8ED70" stroke="#20211D" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="17" cy="15" r="5.5" fill="#20211D" stroke="#FFFFFF" stroke-width="1.5"/>
      </svg>
      <div style="position: absolute; top: -6px; left: 6px; background: #20211D; color: #FFFFFF; font-size: 8px; font-weight: 800; padding: 1px 4px; border: 1px solid #20211D; text-transform: uppercase;">PIN</div>
    </div>
  `,
  className: 'mtaaclean-picker-marker',
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -42],
})
