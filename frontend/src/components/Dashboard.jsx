import React, { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { motion } from "framer-motion"
import { User, Bell, Code2, Layers, Target } from "lucide-react"
import StatCard from "./StatCard"

export default function Dashboard() {
  const { user, authed, notifications } = useAuth()
  const [profile, setProfile] = useState(null)
  const [milestones, setMilestones] = useState([])

  useEffect(() => {
    async function load() {
      if (!user) return
      const me = await authed("/me")
      setProfile(me)
      const ms = await fetch("http://127.0.0.1:8000/milestones").then((r) => r.json())
      setMilestones(ms || [])
    }
    load()
  }, [user])

  const cards = [
    { k: "Role", v: user?.role || "guest", icon: <User className="w-5 h-5" /> },
    { k: "Section", v: profile?.section || "-", icon: <Layers className="w-5 h-5" /> },
    { k: "Skills", v: (profile?.skills || []).join(", ") || "-", icon: <Code2 className="w-5 h-5" /> },
    { k: "Notifications", v: notifications.filter((n) => !n.read).length + " unread", icon: <Bell className="w-5 h-5" /> },
  ]

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="relative overflow-hidden rounded-2xl bg-hero-gradient text-white p-8 shadow-soft">
        <motion.h1 className="text-3xl font-semibold tracking-tight mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Welcome back, {profile?.name || "Student"} 👋
        </motion.h1>
        <p className="text-white/90">Here’s an overview of your current progress, milestones, and updates.</p>
        <div className="absolute right-6 top-6 opacity-20">
          <Target className="w-20 h-20" />
        </div>
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => <StatCard key={c.k} icon={c.icon} label={c.k} value={String(c.v)} />)}
      </section>

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <h2 className="text-xl font-semibold">Milestones</h2>
        </div>
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">
          {milestones.length > 0 ? milestones.map((m) => (
            <motion.div key={m.id} className="glass p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:-translate-y-1 transition-all" whileHover={{ scale: 1.03 }}>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{m.name}</div>
              <div className="text-sm opacity-70">Due: {new Date(m.due_ts * 1000).toLocaleDateString()}</div>
            </motion.div>
          )) : <div className="text-zinc-500 italic">No milestones found</div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card space-y-3 lg:col-span-2">
          <div className="h2">Activity</div>
          <ul className="space-y-2">
            <li className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40"><span className="text-sm">Team Alpha submitted <b>Design Doc v2</b></span><span className="badge">2m ago</span></li>
            <li className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40"><span className="text-sm">Faculty reviewed <b>SRS Draft</b></span><span className="badge">1h ago</span></li>
            <li className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40"><span className="text-sm">New milestone <b>Prototype</b> published</span><span className="badge">Yesterday</span></li>
          </ul>
        </div>
        <div className="card space-y-3">
          <div className="h2">Focus</div>
          <div className="grid grid-cols-3 gap-3">
            {[30,60,85].map((p,i)=> (
              <div key={i} className="flex flex-col items-center gap-1">
                <svg viewBox="0 0 36 36" className="w-20 h-20">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" opacity="0.15" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeDasharray={`${p}, 100`} transform="rotate(-90 18 18)"/>
                </svg>
                <div className="text-sm opacity-70">{p}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
