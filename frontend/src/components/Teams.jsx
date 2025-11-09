import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Teams(){
  const { user, authed } = useAuth()
  const [suggest, setSuggest] = useState([])
  const [myTeam, setMyTeam] = useState(null)

  async function refresh(){
    if (!user) return
    const t = await authed('/teams/me'); setMyTeam(t)
    const s = await authed('/teams/suggestions'); setSuggest(s||[])
  }

  useEffect(()=>{ refresh() }, [user])

  async function invite(userId){
    const res = await authed('/teams/invite', {method:'POST', body: JSON.stringify({toUserId:userId})})
    if (res.ok){ alert('Invited!'); refresh() }
  }

  async function lock(){
    const res = await authed('/teams/lock', {method:'POST'})
    if (!res.ok) alert(res.error || 'Cannot lock yet')
    else { alert('Team locked!'); setMyTeam(res.team) }
  }

  // Accept/Decline via entering inviteId from notification (demo simplification)
  const [resp, setResp] = useState({inviteId:'', action:'accept'})
  async function respond(){
    const res = await authed('/teams/respond', {method:'POST', body: JSON.stringify(resp)})
    if (res.ok){ alert('Response saved'); refresh() }
    else alert(res.error||'Error')
  }

return (
  <>
    <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-500 shadow-soft"><div className="text-2xl font-semibold">Teams</div><div className="text-white/80 text-sm mt-1">Manage your teams with ease.</div></div>

    <section className="grid md:grid-cols-2 gap-4">
      <div className="card">
        <div className="text-lg font-semibold mb-2">Suggestions</div>
        <div className="grid gap-3">
          {suggest.map(s => (
            <div key={s.userId} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="font-medium">{s.name} (Sec {s.section})</div>
              <div className="text-sm opacity-70">Skills: {s.skills.join(', ') || '-'}</div>
              <div className="text-sm opacity-70">Interests: {s.interests.join(', ') || '-'}</div>
              <div className="text-sm opacity-70">Score: {s.score}</div>
              <button className="btn mt-2" onClick={()=>invite(s.userId)}>Invite</button>
            </div>
          ))}
          {!suggest.length && <div className="opacity-60">No suggestions yet.</div>}
        </div>
      </div>

      <div className="card">
        <div className="text-lg font-semibold mb-2">My Team</div>
        {myTeam?.id ? (
          <>
            <div className="mb-2">Team: <b>{myTeam.name}</b></div>
            <div className="text-sm opacity-70">Members: {myTeam.members?.length || 1}</div>
            <div className="text-sm opacity-70 mb-2">Status: {myTeam.locked ? 'Locked' : 'Forming'}</div>
            {!myTeam.locked && <button className="btn" onClick={lock}>Lock Team (needs 4)</button>}

            <div className="mt-4">
              <div className="font-semibold mb-1">Deliverables</div>
              <Deliverables teamId={myTeam.id} authed={authed} />
            </div>
          </>
        ) : (
          <div className="opacity-80">You are not in a team yet. Invite from suggestions.</div>
        )}

        <div className="mt-4">
          <div className="font-semibold mb-1">Respond to Invite (demo)</div>
          <div className="grid md:grid-cols-3 gap-2">
            <input className="btn" placeholder="Invite ID" value={resp.inviteId} onChange={e=>setResp({...resp, inviteId:Number(e.target.value)})} />
            <select className="btn" value={resp.action} onChange={e=>setResp({...resp, action:e.target.value})}>
              <option value="accept">Accept</option>
              <option value="decline">Decline</option>
            </select>
            <button className="btn" onClick={respond}>Submit</button>
          </div>
          <div className="text-xs opacity-60 mt-1">Find the Invite ID in your 🔔 notifications.</div>
        </div>
      </div>
    </section>
  </>
)
}

function Deliverables({ teamId, authed }){
  const [rows, setRows] = useState([])
  const [title, setTitle] = useState('Submission')

  async function load(){ const r = await fetch(`http://127.0.0.1:8000/teams/${teamId}/deliverables`).then(r=>r.json()); setRows(r||[]) }
  useEffect(()=>{ if(teamId) load() }, [teamId])

  async function add(){
    const r = await authed(`/teams/${teamId}/deliverables`, {method:'POST', body: JSON.stringify({title})})
    if (r.ok){ setTitle('Submission'); load() }
  }

  return (
    <div className="space-y-2">
      <div className="grid md:grid-cols-3 gap-2">
        <input className="btn" value={title} onChange={e=>setTitle(e.target.value)} />
        <button className="btn" onClick={add}>Upload (mock)</button>
      </div>
      <div className="text-sm opacity-70">Versions:</div>
      <div className="grid gap-2">
        {rows.map(d => (
          <div key={d.id} className="p-2 rounded border border-zinc-200 dark:border-zinc-800">
            {d.title} — v{d.version} — {new Date(d.ts*1000).toLocaleString()}
          </div>
        ))}
        {!rows.length && <div className="opacity-60">No submissions yet.</div>}
      </div>
    </div>
  )
}