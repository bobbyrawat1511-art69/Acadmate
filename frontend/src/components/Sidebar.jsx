import React from 'react'
import { Home, Users, BookOpen, ClipboardList, BarChart3 } from 'lucide-react'

export default function Sidebar({ active, onChange, tabs, unread=0 }){
  const iconMap = {
    "Dashboard": <Home className="w-5 h-5" />,
    "Teams": <Users className="w-5 h-5" />,
    "Resources": <BookOpen className="w-5 h-5" />,
    "Review Queue": <ClipboardList className="w-5 h-5" />,
    "Progress": <BarChart3 className="w-5 h-5" />,
  }
  return (
    <aside className="sidebar hidden md:block">
      <div className="flex items-center gap-2 px-2 py-2 mb-3">
        <div className="font-semibold">Acadmate eXQ</div>
      </div>
      <nav className="space-y-1">
        {tabs.map(t => (
          <button
            key={t}
            className={`w-full text-left sidebar-item ${active===t ? 'sidebar-item-active' : ''}`}
            onClick={()=>onChange(t)}
          >
            <span>{iconMap[t] || null}</span>
            <span className="flex-1">{t}</span>
            {t==="Dashboard" && unread>0 ? <span className="badge">{unread}</span> : null}
          </button>
        ))}
      </nav>
    </aside>
  )
}
