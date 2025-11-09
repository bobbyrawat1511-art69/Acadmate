import React from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const data = [
  { name: 'Week 1', progress: 10 },
  { name: 'Week 2', progress: 22 },
  { name: 'Week 3', progress: 35 },
  { name: 'Week 4', progress: 42 },
  { name: 'Week 5', progress: 55 },
  { name: 'Week 6', progress: 68 },
  { name: 'Week 7', progress: 80 },
]

export default function Progress(){
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-500 shadow-soft">
        <div className="text-2xl font-semibold">Progress</div>
        <div className="text-white/80 text-sm mt-1">Track improvement across weeks.</div>
      </div>
      <div className="card p-6">
        <div className="h2 mb-4">Team Progress Over Time</div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="progress" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
