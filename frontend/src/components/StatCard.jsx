import React from 'react'
export default function StatCard({ icon, label, value }){
  return (
    <div className="card card-hover p-5 space-y-1">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
        {icon}<span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
