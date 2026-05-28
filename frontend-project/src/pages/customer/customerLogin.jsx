import { useState } from 'react'
import { useAuth } from '../../context/authContext'
import { useLanguage } from '../../context/languageContext'
import { useNavigate, Link } from 'react-router-dom'
import '../auth.css'

export default function CustomerLogin() {
  const { t, tt, th } = useLanguage()
  const [h, setH] = useState({})
  const hov = (k) => ({ onMouseEnter: () => setH(p => ({ ...p, [k]: true })), onMouseLeave: () => setH(p => ({ ...p, [k]: false })) })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login('customer', email, password)
      navigate('/dashboard/customer')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">⚡</div>
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your customer account</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder={h.email ? th('email') : t('email')} title={tt('email')} value={email} onChange={(e) => setEmail(e.target.value)} {...hov('email')} required />
          <input type="password" placeholder={h.password ? th('password') : t('password')} title={tt('password')} value={password} onChange={(e) => setPassword(e.target.value)} {...hov('password')} required />
          <button type="submit" className="auth-btn" title={tt('signIn')} {...hov('signIn')}>{h.signIn ? th('signIn') : t('signIn')}</button>
        </form>
        <p className="auth-link">No account? <Link to="/customer/register">Create one</Link></p>
      </div>
    </div>
  )
}
