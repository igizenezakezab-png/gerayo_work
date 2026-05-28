import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const iconRetina = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

const defaultIcon = L.icon({ iconUrl, iconRetina, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] })
L.Marker.prototype.options.icon = defaultIcon

export default function MapView({ driver, customers }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (mapInstance.current) return
    mapInstance.current = L.map(mapRef.current).setView([-1.9441, 30.0619], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current)
    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    map.eachLayer((layer) => { if (layer instanceof L.Marker) map.removeLayer(layer) })

    const bounds = []
    const addMarker = (lat, lng, label, color) => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};color:#fff;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${label}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })
      L.marker([lat, lng], { icon }).addTo(map)
      bounds.push([lat, lng])
    }

    if (driver?.latitude && driver?.longitude) {
      addMarker(driver.latitude, driver.longitude, `Driver: ${driver.name || ''}`, '#1D9E75')
    }
    if (driver?.destLat && driver?.destLng) {
      addMarker(driver.destLat, driver.destLng, `Destination: ${driver.destination || ''}`, '#f5c518')
    }

    if (customers && customers.length > 0) {
      customers.forEach((c) => {
        if (c.latitude && c.longitude) {
          addMarker(c.latitude, c.longitude, `Customer: ${c.name || ''}`, '#378ADD')
        }
        if (c.destLat && c.destLng) {
          addMarker(c.destLat, c.destLng, `Dest: ${c.destination || ''}`, '#f5c518')
        }
      })
    }

    if (bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50] })
  }, [driver, customers])

  return <div ref={mapRef} className="map-container" />
}
