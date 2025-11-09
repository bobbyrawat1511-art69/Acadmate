import React from 'react'

const items = [
  {id:1, title:'Proposal Template', href:'#'},
  {id:2, title:'SRS Template', href:'#'},
  {id:3, title:'Rubric (PDF)', href:'#'}
]

export default function Resources(){
return (
  <>
    <div className="rounded-2xl p-6 text-white bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-500 shadow-soft"><div className="text-2xl font-semibold">Resources</div><div className="text-white/80 text-sm mt-1">Manage your resources with ease.</div></div>

    <section className="grid md:grid-cols-3 gap-4">
      {items.map(it => (
        <div className="card" key={it.id}>
          <div className="font-semibold">{it.title}</div>
          <a className="btn mt-3" href={it.href}>Download</a>
        </div>
      ))}
    </section>
  </>
)
}