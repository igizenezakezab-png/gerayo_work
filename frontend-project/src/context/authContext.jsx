import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const saveSession = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setToken(data.token)
    setUser(data)
  }

  const login = async (role, email, password) => {
    const { data } = await api.post(`/api/auth/${role}/login`, { email, password })
    saveSession(data)
    return data
  }

  const register = async (role, payload) => {
    const { data } = await api.post(`/api/auth/${role}/register`, payload)
    saveSession(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)