import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Topbar(){
  const { theme, setTheme } = useTheme()
  const { user, login, logout, notifications } = useAuth()
  const nextTheme = () => setTheme(theme==='light'?'dark': theme==='dark'?'system':'light')
  const unread = notifications.filter(n => !n.read).length

  async function handleLogin(role){
    const creds = role==='faculty' ? ['faculty@demo.com','demo123']
      : role==='admin' ? ['admin@demo.com','demo123']
      : ['student@demo.com','demo123']
    try { await login(...creds) } catch(e){ alert(e.message) }
  }
  return (
    <header className="topbar">
      <div className="page">
        <div className="main py-3 !space-y-0 flex items-center justify-between">
          <div className="md:hidden font-semibold">Acadmate eXQ</div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={nextTheme} title={"Theme: "+theme}>
              {theme==='dark' ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
            </button>
            <div className="relative btn-ghost" title="Notifications">
              <Bell className="w-5 h-5"/>
              {unread>0 && <span className="absolute -top-1 -right-1 badge">{unread}</span>}
            </div>

            {user ? (
              <>
                <span className="muted">Hi, {user.name} ({user.role})</span>
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
      </div>
    </header>
  )
}
