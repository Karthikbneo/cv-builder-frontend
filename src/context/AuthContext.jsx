import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api.js'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const json = localStorage.getItem('auth:user')
    return json ? JSON.parse(json) : null
  })
  const [access, setAccess] = useState(localStorage.getItem('auth:access') || '')
  const [refresh, setRefresh] = useState(localStorage.getItem('auth:refresh') || '')

  useEffect(() => {
    api.setToken(access)
  }, [access])

  const login = (payload) => {
    setUser(payload.user)
    setAccess(payload.access)
    setRefresh(payload.refresh)
    localStorage.setItem('auth:user', JSON.stringify(payload.user))
    localStorage.setItem('auth:access', payload.access)
    localStorage.setItem('auth:refresh', payload.refresh)
  }

  const logout = () => {
    setUser(null); setAccess(''); setRefresh('')
    localStorage.removeItem('auth:user')
    localStorage.removeItem('auth:access')
    localStorage.removeItem('auth:refresh')
    api.setToken('')
  }

  const value = { user, access, refresh, login, logout }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
