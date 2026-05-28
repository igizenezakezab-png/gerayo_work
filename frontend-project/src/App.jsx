import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/languageContext'
import Home from './pages/home'
import CustomerLogin from './pages/customer/customerLogin'
import CustomerRegister from './pages/customer/customerRegister'
import DriverLogin from './pages/driver/driverLogin'
import DriverRegister from './pages/driver/driverRegistre'
import CustomerDashboard from './pages/darshboard/customerDarshboard'
import DriverDashboard from './pages/darshboard/driverDashboard'

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route path="/dashboard/customer" element={<CustomerDashboard />} />
        <Route path="/dashboard/driver" element={<DriverDashboard />} />
      </Routes>
    </LanguageProvider>
  )
}