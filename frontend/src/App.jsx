import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import Splash from './components/Splash'
import Dashboard from './components/Dashboard'
import Resources from './components/Resources'
import ReviewQueue from './components/ReviewQueue'
import Teams from './components/Teams'
import Progress from './components/Progress'

const studentTabs = ["Dashboard","Teams","Resources","Progress"]
const facultyTabs = ["Dashboard","Review Queue","Progress","Resources"]
const adminTabs = ["Dashboard","Progress","Resources"]

function Shell() {
  const { user } = useAuth()
  const tabs = user?.role === 'faculty' ? facultyTabs : user?.role === 'admin' ? adminTabs : studentTabs
  const [active, setActive] = useState(tabs[0])

  const renderTab = () => {
    const t = active
    if (t === "Resources") return <Resources />
    if (t === "Review Queue") return <ReviewQueue />
    if (t === "Teams") return <Teams />
    if (t === "Progress") return <Progress />
    return <Dashboard />
  }

  return (
    <div className="min-h-screen page text-zinc-900 dark:text-zinc-100">
      <Topbar />
      <Sidebar active={active} onChange={setActive} tabs={tabs} />
      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Splash><Shell /></Splash>
    </AuthProvider>
  )
}