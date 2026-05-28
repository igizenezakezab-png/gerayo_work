import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/authContext'
import { useLanguage } from '../../context/languageContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import LocationSearch from '../../components/LocationSearch'
import MapView from '../../components/MapView'
import './dashboard.css'

export default function CustomerDashboard() {
  const { user, logout } = useAuth()
  const { t, lang, toggleLang, tt, th } = useLanguage()
  const navigate = useNavigate()
  const [h, setH] = useState({})
  const hov = (k) => ({ onMouseEnter: () => setH(p => ({ ...p, [k]: true })), onMouseLeave: () => setH(p => ({ ...p, [k]: false })) })
  const [form, setForm] = useState({
    currentLocation: '',
    destination: '',
    vehicleChoice: 'motorcycle',
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
    if (!form.currentLocation.trim() || !form.destination.trim()) {
      setPriceInfo({ price: 0, distance: 0, rate: 0 })
      return
    }
    try {
      setCalcLoading(true)
      const { data } = await api.post('/price/calculate', {
        currentLocation: form.currentLocation,
        destination: form.destination,
        vehicleType: form.vehicleChoice,
      })
      setPriceInfo({ price: data.price || 0, distance: data.distance || 0, rate: data.rate || 0 })
    } catch {
      setPriceInfo({ price: 0, distance: 0, rate: 0 })
    } finally {
      setCalcLoading(false)
    }
  }, [form.currentLocation, form.destination, form.vehicleChoice])

  useEffect(() => {
    const timer = setTimeout(fetchPrice, 600)
    return () => clearTimeout(timer)
  }, [fetchPrice])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get(`/customers/${user._id}`)
        if (data) {
          setForm((prev) => ({
            ...prev,
            currentLocation: data.currentLocation || '',
            destination: data.destination || '',
            vehicleChoice: data.vehicleChoice || 'motorcycle',
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
      const { data } = await api.get(`/customers/${user._id}/matches`)
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
      const { data } = await api.put(`/customers/${user._id}`, form)
      setMessage('Trip details saved successfully!')
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
    <div className="dashboard customer-dash">
      <header className="dash-header">
        <span className="dash-logo">GERAYO</span>
        <button className="lang-toggle" onClick={toggleLang}>{lang === 'en' ? 'EN' : 'RW'}</button>
        <button className="logout-btn" onClick={handleLogout} title={tt('logout')} {...hov('logout')}>{h.logout ? th('logout') : t('logout')}</button>
      </header>

      <div className="dash-body">
        <div className="dash-welcome">
          <h2>Welcome back, {user?.name}</h2>
          <p>You are logged in as <span className="badge customer-badge">Customer</span></p>
        </div>

        <div className="dash-cards">
          <div className="info-card">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
          <div className="info-card">
            <label>Role</label>
            <p>Customer</p>
          </div>
        </div>

        <div className="dash-section">
          <h3>Where do you need to go?</h3>
          {message && <p className="dash-message">{message}</p>}
          <form className="dash-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <LocationSearch value={form.currentLocation} onChange={handleLocationChange} placeholder={h.currentLocation ? th('currentLocation') : t('currentLocation')} title={tt('currentLocation')} {...hov('currentLocation')} />
              <LocationSearch value={form.destination} onChange={handleDestChange} placeholder={h.destination ? th('destination') : t('destination')} title={tt('destination')} {...hov('destination')} />
            </div>
            <div className="form-row">
              <select name="vehicleChoice" value={form.vehicleChoice} onChange={handleChange}>
                <option value="motorcycle" title={tt('motorcycle')} {...hov('motorcycle')}>{h.motorcycle ? th('motorcycle') : t('motorcycle')}</option>
                <option value="van" title={tt('van')} {...hov('van')}>{h.van ? th('van') : t('van')}</option>
                <option value="bus" title={tt('bus')} {...hov('bus')}>{h.bus ? th('bus') : t('bus')}</option>
              </select>
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
                <span className="price-placeholder">Enter your locations to see the price</span>
              )}
            </div>
            <button type="submit" className="dash-submit" title={tt('saveTripDetails')} {...hov('saveTripDetails')}>{h.saveTripDetails ? th('saveTripDetails') : t('saveTripDetails')}</button>
          </form>
        </div>

        <div className="dash-section">
          <h3>Map View</h3>
          <MapView driver={form} customers={matches} />
        </div>

        <div className="dash-section">
          <div className="match-section-header">
            <h3>Available Drivers</h3>
            <button className="refresh-btn" onClick={fetchMatches} disabled={loading}>
              {loading ? t('searching') : <span title={tt('refresh')} {...hov('refresh')}>{h.refresh ? th('refresh') : t('refresh')}</span>}
            </button>
          </div>
          {loading ? (
            <p className="match-empty">Searching for matching drivers...</p>
          ) : matches.length > 0 ? (
            <div className="match-list">
              {matches.map((driver) => (
                <div key={driver._id} className="match-card">
                  <div className="match-header">
                    <span className="match-name">Driver: {driver.name}</span>
                    <span className="match-price">{driver.price?.toLocaleString()} RWF</span>
                  </div>
                  <div className="match-details">
                    <span>From: {driver.currentLocation}</span>
                    <span>To: {driver.destination}</span>
                    <span>Vehicle: {driver.vehicleType}</span>
                    <span>Tel: {driver.telephone || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="match-empty">No drivers found matching your trip yet. Save your trip details and check again later.</p>
          )}
        </div>
      </div>
    </div>
  )
}
