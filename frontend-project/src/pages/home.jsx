import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/languageContext'
import './home.css'

export default function Home() {
    const { t, lang, toggleLang, tt, th } = useLanguage()
    const [h, setH] = useState({})
    const hov = (k) => ({ onMouseEnter: () => setH({ ...h, [k]: true }), onMouseLeave: () => setH({ ...h, [k]: false }) })
    return (
        <div className="home">
            <button className="lang-toggle" onClick={toggleLang} title={`Switch to ${lang === 'en' ? 'Kinyarwanda' : 'English'}`}>
                {lang === 'en' ? 'EN' : 'RW'}
            </button>
            <div className="home-hero">
                <div className="home-brand">
                    <div className="home-brand-icon">GERAYO</div>
                </div>
                <h1>GERAYO</h1>
                <p className="home-tagline">Your one-stop solution for all your transportation needs</p>
            </div>

            <div className="home-accounts">
                <div className="account-card">
                    <div className="account-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
                    </div>
                    <h3>Customer</h3>
                    <p>Book a ride and reach your destination safely</p>
                    <div className="account-actions">
                        <Link to="/customer/login" className="btn-signin" title={tt('signIn')} {...hov('signIn')}>{h.signIn ? th('signIn') : t('signIn')}</Link>
                        <Link to="/customer/register" className="btn-register" title={tt('register')} {...hov('register')}>{h.register ? th('register') : t('register')}</Link>
                    </div>
                </div>

                <div className="account-card">
                    <div className="account-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17l2 3h4l-2-3M19 17l-2 3h-4l2-3"/><circle cx="7" cy="12" r="1.5"/><circle cx="17" cy="12" r="1.5"/></svg>
                    </div>
                    <h3>Driver</h3>
                    <p>Offer your driving services and earn</p>
                    <div className="account-actions">
                        <Link to="/driver/login" className="btn-signin" title={tt('signIn')} {...hov('signIn2')}>{h.signIn2 ? th('signIn') : t('signIn')}</Link>
                        <Link to="/driver/register" className="btn-register" title={tt('register')} {...hov('register2')}>{h.register2 ? th('register') : t('register')}</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}