import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const API = 'http://127.0.0.1:8000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [notifications, setNotifications] = useState([])

  async function login(email, password) {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'Login failed')
    setUser({ id: data.id, name: data.name, role: data.role, email })
    setToken(data.token)
  }

  function logout() { setUser(null); setToken(null); setNotifications([]) }

  async function authed(path, opts={}) {
    const res = await fetch(API + path, {
      ...opts,
      headers: { 'Content-Type':'application/json', ...(opts.headers||{}), ...(token? {Authorization: 'Bearer ' + token} : {}) }
    })
    return res.json()
  }

  // bootstrap
  useEffect(() => {
    if (!token) return
    const tick = async () => {
      const ns = await authed('/notifications')
      setNotifications(ns || [])
    }
    tick()
    const id = setInterval(tick, 5000)
    return () => clearInterval(id)
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authed, notifications, setNotifications }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }