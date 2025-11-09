import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ReviewQueue(){
  const { user, authed } = useAuth()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({score:0, comments:'', clarity:0, implementation:0, viva:0, for_version:1})
  const [selected, setSelected] = useState(null)

  useEffect(()=>{
    async function load(){
      const r = await authed('/faculty/queue')
      setRows(r || [])
    }
    if (user?.role === 'faculty') load()
  }, [user])

  async function submitFeedback(teamId, deliverable){
    const body = {
      score: Number(form.score),
      comments: form.comments,
      rubric: {clarity:Number(form.clarity), implementation:Number(form.implementation), viva:Number(form.viva)},
      for_version: deliverable.version
    }
    const res = await authed(`/teams/${teamId}/feedback`, {method:'POST', body: JSON.stringify(body)})
    if (res.ok){
      await authed(`/teams/${teamId}/feedback/publish`, {method:'POST', body: JSON.stringify({feedbackId: res.feedbackId})})
      alert('Feedback published ✅')
      setSelected(null)
      const r = await authed('/faculty/queue'); setRows(r||[])
    }
  }

  if (user?.role !== 'faculty') return <div className="opacity-60">Faculty only.</div>

  return (
    <>
      <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-500 shadow-soft">
        <div className="text-2xl font-semibold">Review Queue</div>
        <div className="text-white/80 text-sm mt-1">Manage your review queue with ease.</div>
      </div>

      <section className="space-y-4">
        <div className="text-lg font-semibold">Pending Reviews</div>
        <div className="grid gap-3">
          {rows.map(r => (
            <div key={r.teamId} className="card">
              <div className="font-medium">{r.teamName}</div>
              <div className="text-sm opacity-70">Latest submission: {r.deliverable.title} v{r.deliverable.version}</div>
              <button className="btn mt-2" onClick={()=>setSelected(r)}>Open rubric</button>
            </div>
          ))}
          {!rows.length && <div className="opacity-60">No pending teams 🎉</div>}
        </div>

        {selected && (
          <div className="card">
            <div className="font-semibold mb-2">Score: {selected.teamName}</div>
            <div className="grid md:grid-cols-4 gap-3">
              <input className="btn" placeholder="Score" value={form.score} onChange={e=>setForm({...form,score:e.target.value})} />
              <input className="btn" placeholder="Clarity" value={form.clarity} onChange={e=>setForm({...form,clarity:e.target.value})} />
              <input className="btn" placeholder="Implementation" value={form.implementation} onChange={e=>setForm({...form,implementation:e.target.value})} />
              <input className="btn" placeholder="Viva" value={form.viva} onChange={e=>setForm({...form,viva:e.target.value})} />
            </div>
            <textarea className="btn w-full mt-3" rows="4" placeholder="Comments" value={form.comments} onChange={e=>setForm({...form,comments:e.target.value})}></textarea>
            <button className="btn mt-3" onClick={()=>submitFeedback(selected.teamId, selected.deliverable)}>Publish</button>
          </div>
        )}
      </section>
    </>
  )
}