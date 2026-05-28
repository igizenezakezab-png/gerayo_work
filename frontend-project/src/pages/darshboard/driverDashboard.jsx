import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/authContext'
import { useLanguage } from '../../context/languageContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import LocationSearch from '../../components/LocationSearch'
import MapView from '../../components/MapView'
import './dashboard.css'

export default function DriverDashboard() {
  const { user, logout } = useAuth()
  const { t, lang, toggleLang, tt, th } = useLanguage()
  const navigate = useNavigate()
  const [h, setH] = useState({})
  const hov = (k) => ({ onMouseEnter: () => setH(p => ({ ...p, [k]: true })), onMouseLeave: () => setH(p => ({ ...p, [k]: false })) })
  const [form, setForm] = useState({
    currentLocation: '',
    destination: '',
    vehicleType: '',
    telephone: user?.telephone || '',
    latitude: null,
    longitude: null,
    destLat: null,
    destLng: null,
  })
  const [priceInfo, setPriceInfo] = useState({ price: 0, distance: 0, rate: 0 })
  const [message, setMessage] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [calcLoading, setCalcLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLocationChange = (label, lat, lng) => {
    setForm((prev) => ({ ...prev, currentLocation: label, latitude: lat, longitude: lng }))
  }

  const handleDestChange = (label, lat, lng) => {
    setForm((prev) => ({ ...prev, destination: label, destLat: lat, destLng: lng }))
  }

  const fetchPrice = useCallback(async () => {
    if (!form.currentLocation.trim() || !form.destination.trim() || !form.vehicleType.trim()) {
      setPriceInfo({ price: 0, distance: 0, rate: 0 })
      return
    }
    try {
      setCalcLoading(true)
      const { data } = await api.post('/api/price/calculate', {
        currentLocation: form.currentLocation,
        destination: form.destination,
        vehicleType: form.vehicleType,
      })
      setPriceInfo({ price: data.price || 0, distance: data.distance || 0, rate: data.rate || 0 })
    } catch {
      setPriceInfo({ price: 0, distance: 0, rate: 0 })
    } finally {
      setCalcLoading(false)
    }
  }, [form.currentLocation, form.destination, form.vehicleType])

  useEffect(() => {
    const timer = setTimeout(fetchPrice, 600)
    return () => clearTimeout(timer)
  }, [fetchPrice])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get(`/api/drivers/${user._id}`)
        if (data) {
          setForm((prev) => ({
            ...prev,
            currentLocation: data.currentLocation || '',
            destination: data.destination || '',
            vehicleType: data.vehicleType || '',
            telephone: data.telephone || user?.telephone || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            destLat: data.destLat || null,
            destLng: data.destLng || null,
          }))
          if (data.price) {
            setPriceInfo((prev) => ({ ...prev, price: data.price }))
          }
        }
      } catch {}
    })()
  }, [user._id])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/api/drivers/${user._id}/matches`)
      setMatches(data.matches || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put(`/api/drivers/${user._id}`, form)
      setMessage('Service details saved successfully!')
      setPriceInfo({ price: data.priceInfo?.price || 0, distance: priceInfo.distance, rate: priceInfo.rate })
      setMatches(data.matches || [])
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard driver-dash">
      <header className="dash-header">
        <span className="dash-logo">GERAYO</span>
        <button className="lang-toggle" onClick={toggleLang}>{lang === 'en' ? 'EN' : 'RW'}</button>
        <button className="logout-btn" onClick={handleLogout} title={tt('logout')} {...hov('logout')}>{h.logout ? th('logout') : t('logout')}</button>
      </header>

      <div className="dash-body">
        <div className="dash-welcome">
          <h2>Welcome back, {user?.name}</h2>
          <p>You are logged in as <span className="badge driver-badge">Driver</span></p>
        </div>

        <div className="dash-cards">
          <div className="info-card">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
          <div className="info-card">
            <label>Role</label>
            <p>Driver</p>
          </div>
        </div>

        <div className="dash-section">
          <h3>Where are you offering your service?</h3>
          {message && <p className="dash-message">{message}</p>}
          <form className="dash-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <LocationSearch value={form.currentLocation} onChange={handleLocationChange} placeholder={h.currentLocation ? th('currentLocation') : t('currentLocation')} title={tt('currentLocation')} {...hov('currentLocation')} />
              <LocationSearch value={form.destination} onChange={handleDestChange} placeholder={h.destination ? th('destination') : t('destination')} title={tt('destination')} {...hov('destination')} />
            </div>
            <div className="form-row">
              <input name="vehicleType" placeholder={h.vehicleType ? th('vehicleType') : t('vehicleType')} title={tt('vehicleType')} value={form.vehicleType} onChange={handleChange} {...hov('vehicleType')} required />
              <input name="telephone" placeholder={h.telephone ? th('telephone') : t('telephone')} title={tt('telephone')} value={form.telephone} onChange={handleChange} {...hov('telephone')} required />
            </div>
            <div className="price-display">
              {calcLoading ? (
                <span className="price-calculating">Calculating price...</span>
              ) : priceInfo.price > 0 ? (
                <>
                  <span className="price-value">{priceInfo.price.toLocaleString()} RWF</span>
                  <span className="price-meta">{priceInfo.distance.toFixed(1)} km × {priceInfo.rate} RWF/km</span>
                </>
              ) : (
                <span className="price-placeholder">Enter your locations and vehicle to see the price</span>
              )}
            </div>
            <button type="submit" className="dash-submit" title={tt('saveServiceDetails')} {...hov('saveServiceDetails')}>{h.saveServiceDetails ? th('saveServiceDetails') : t('saveServiceDetails')}</button>
          </form>
        </div>

        <div className="dash-section">
          <h3>Map View</h3>
          <MapView driver={form} customers={matches} />
        </div>

        <div className="dash-section">
          <div className="match-section-header">
            <h3>Customers Looking for a Ride</h3>
            <button className="refresh-btn" onClick={fetchMatches} disabled={loading}>
              {loading ? t('searching') : <span title={tt('refresh')} {...hov('refresh')}>{h.refresh ? th('refresh') : t('refresh')}</span>}
            </button>
          </div>
          {loading ? (
            <p className="match-empty">Searching for matching customers...</p>
          ) : matches.length > 0 ? (
            <div className="match-list">
              {matches.map((customer) => (
                <div key={customer._id} className="match-card">
                  <div className="match-header">
                    <span className="match-name">{customer.name}</span>
                    <span className="match-price">{customer.price?.toLocaleString()} RWF</span>
                  </div>
                  <div className="match-details">
                    <span>From: {customer.currentLocation}</span>
                    <span>To: {customer.destination}</span>
                    <span>Vehicle: {customer.vehicleChoice}</span>
                    <span>Tel: {customer.telephone || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="match-empty">No customers found yet. Save your service details and check again later.</p>
          )}
        </div>
      </div>
    </div>
  )
}
