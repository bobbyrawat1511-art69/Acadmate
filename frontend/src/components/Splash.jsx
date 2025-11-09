import React, { useEffect, useState } from 'react'
export default function Splash({ children }){
  const [show, setShow] = useState(true)
  useEffect(() => { const t=setTimeout(()=>setShow(false), 1200); return ()=>clearTimeout(t) }, [])
  if (!show) return children
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-sky-500 text-white z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl font-semibold tracking-tight">Acadmate eXQ</div>
        <div className="text-white/80">Loading your workspace…</div>
        <div className="w-64 h-2 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full w-1/3 bg-white/80 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  )
}
