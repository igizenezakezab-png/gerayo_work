import { useState } from 'react'
import { useAuth } from '../../context/authContext'
import { useLanguage } from '../../context/languageContext'
import { useNavigate, Link } from 'react-router-dom'
import '../auth.css'

export default function DriverRegister() {
  const { t, tt, th } = useLanguage()
  const [h, setH] = useState({})
  const hov = (k) => ({ onMouseEnter: () => setH(p => ({ ...p, [k]: true })), onMouseLeave: () => setH(p => ({ ...p, [k]: false })) })
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register('driver', form)
      navigate('/dashboard/driver')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">GERAYO</div>
        </div>
        <h2>Become a Driver</h2>
        <p className="auth-subtitle">Create your driver account</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder={h.name ? th('name') : t('name')} title={tt('name')} value={form.name} onChange={handleChange} {...hov('name')} required />
          <input name="email" type="email" placeholder={h.email ? th('email') : t('email')} title={tt('email')} value={form.email} onChange={handleChange} {...hov('email')} required />
          <input name="password" type="password" placeholder={h.password ? th('password') : t('password')} title={tt('password')} value={form.password} onChange={handleChange} {...hov('password')} required />
          <button type="submit" className="auth-btn" title={tt('createAccount')} {...hov('createAccount')}>{h.createAccount ? th('createAccount') : t('createAccount')}</button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/driver/login">Sign in</Link></p>
      </div>
    </div>
  )
}