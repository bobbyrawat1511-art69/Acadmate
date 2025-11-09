import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ active, onChange, tabs }) {
  const { user, login, logout, notifications, setNotifications, authed } = useAuth()

  async function handleLogin(role) {
    const creds = role==='faculty' ? ['faculty@demo.com','demo123']
      : role==='admin' ? ['admin@demo.com','demo123']
      : ['student@demo.com','demo123']
    try { await login(...creds) } catch(e){ alert(e.message) }
  }

  async function markRead() {
    const ids = notifications.filter(n => !n.read).map(n => n.id)
    if (ids.length) await authed('/notifications/read', {method:'POST', body: JSON.stringify({ids})})
    setNotifications(prev => prev.map(n => ({...n, read:true})))
  }

  return (
    <header className="border-b border-zinc-200/40 dark:border-zinc-800/40 sticky top-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
      <div className="container flex items-center justify-between p-3 gap-3">
        <div className="font-bold">Acadmate eXQ</div>
        <nav className="flex gap-1">
          {tabs.map(t => (
            <button key={t} className={`nav-link ${active===t ? 'font-semibold' : ''}`} onClick={() => onChange(t)}>
              {t}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button className="btn relative" onClick={markRead}>
                🔔
                {notifications.some(n=>!n.read) && <span className="absolute -top-1 -right-1 text-xs px-1 rounded bg-red-600 text-white">{notifications.filter(n=>!n.read).length}</span>}
              </button>
              <span className="text-sm opacity-80">Hi, {user.name} ({user.role})</span>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <div className="flex gap-2">
              <button className="btn" onClick={()=>handleLogin('student')}>Student Demo</button>
              <button className="btn" onClick={()=>handleLogin('faculty')}>Faculty Demo</button>
              <button className="btn" onClick={()=>handleLogin('admin')}>Admin Demo</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}