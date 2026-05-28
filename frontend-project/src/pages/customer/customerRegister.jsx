import { useState } from 'react'
import { useAuth } from '../../context/authContext'
import { useLanguage } from '../../context/languageContext'
import { useNavigate, Link } from 'react-router-dom'
import '../auth.css'

export default function CustomerRegister() {
  const { t, tt, th } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', password: '', telephone: '' })
  const [error, setError] = useState('')
  const [h, setH] = useState({})
  const hov = (k) => ({ onMouseEnter: () => setH(p => ({ ...p, [k]: true })), onMouseLeave: () => setH(p => ({ ...p, [k]: false })) })
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register('customer', form)
      navigate('/dashboard/customer')
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
        <h2>Get Started</h2>
        <p className="auth-subtitle">Create your customer account</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder={h.name ? th('name') : t('name')} title={tt('name')} value={form.name} onChange={handleChange} {...hov('name')} required />
          <input name="email" type="email" placeholder={h.email ? th('email') : t('email')} title={tt('email')} value={form.email} onChange={handleChange} {...hov('email')} required />
          <input name="telephone" type="tel" placeholder={h.telephone ? th('telephone') : t('telephone')} title={tt('telephone')} value={form.telephone} onChange={handleChange} {...hov('telephone')} required />
          <input name="password" type="password" placeholder={h.password ? th('password') : t('password')} title={tt('password')} value={form.password} onChange={handleChange} {...hov('password')} required />
          <button type="submit" className="auth-btn" title={tt('createAccount')} {...hov('createAccount')}>{h.createAccount ? th('createAccount') : t('createAccount')}</button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/customer/login">Sign in</Link></p>
      </div>
    </div>
  )
}