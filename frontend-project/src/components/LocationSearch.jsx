import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

export default function LocationSearch({ value, onChange, placeholder, title, onMouseEnter, onMouseLeave }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const justSelected = useRef(false)

  useEffect(() => {
    if (!justSelected.current) setQuery(value || '')
    justSelected.current = false
  }, [value])

  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/location/search?q=${encodeURIComponent(query)}`)
        setSuggestions(data.results || [])
        setOpen(true)
      } catch { setSuggestions([]) }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const geocodeText = async (text) => {
    if (!text || text.trim().length < 2) return
    try {
      const { data } = await api.get(`/api/location/geocode?q=${encodeURIComponent(text)}`)
      if (data.latitude && data.longitude) {
        onChange(text, data.latitude, data.longitude)
      }
    } catch {}
  }

  const handleInput = (e) => {
    setQuery(e.target.value)
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (!ref.current?.contains(document.activeElement)) {
        geocodeText(query)
      }
    }, 200)
  }

  const select = (place) => {
    const label = place.address ? `${place.title}, ${place.address}` : place.title
    justSelected.current = true
    setQuery(label)
    onChange(label, place.latitude, place.longitude)
    setOpen(false)
  }

  return (
    <div className="location-search" ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <input
        type="text"
        placeholder={placeholder}
        title={title}
        value={query}
        onChange={handleInput}
        onBlur={handleBlur}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((place, i) => (
            <li key={i} onClick={() => select(place)}>
              <span className="suggestion-title">{place.title}</span>
              {place.address && <span className="suggestion-addr">{place.address}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
