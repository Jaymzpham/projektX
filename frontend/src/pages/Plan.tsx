import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProject, createActivity, deleteActivity } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { format, eachMonthOfInterval, differenceInDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Plus, Trash2, Flag, ChevronLeft, ChevronRight } from 'lucide-react'

type Zoom = 1 | 3 | 6 | 12

export default function Plan() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [zoom, setZoom] = useState<Zoom>(6)
  const [viewStart, setViewStart] = useState(() => startOfMonth(new Date()))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isMilestone: false, status: 'NOT_STARTED', budget: '' })

  const { data: project } = useQuery({ queryKey: ['project', id], queryFn: () => getProject(Number(id)) })

  const createMutation = useMutation({
    mutationFn: () => createActivity({ ...form, projectId: Number(id), budget: form.budget ? Number(form.budget) : undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setShowForm(false); setForm({ name: '', startDate: '', endDate: '', isMilestone: false, status: 'NOT_STARTED', budget: '' }) },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', id] }),
  })

  const activities = project?.activities ?? []
  const viewEnd = addMonths(viewStart, zoom)
  const months = eachMonthOfInterval({ start: viewStart, end: subMonths(viewEnd, 1) })
  const totalDays = differenceInDays(viewEnd, viewStart)

  const getBar = (start: Date, end: Date) => {
    const s = Math.max(0, differenceInDays(start, viewStart))
    const e = Math.min(totalDays, differenceInDays(end, viewStart) + 1)
    if (e <= 0 || s >= totalDays) return null
    return { left: `${(s / totalDays) * 100}%`, width: `${Math.max(0.5, (e - s) / totalDays) * 100}%` }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Plan — {project?.name}</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {([1, 3, 6, 12] as Zoom[]).map(z => (
              <button key={z} onClick={() => setZoom(z)}
                className={`px-3 py-1.5 font-medium transition-colors ${zoom === z ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {z === 1 ? '1 mån' : z === 12 ? 'År' : `${z} mån`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setViewStart(s => subMonths(s, zoom))} className="p-1.5 rounded hover:bg-gray-100">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600 min-w-[140px] text-center">
              {format(viewStart, 'MMM yyyy', { locale: sv })} – {format(subMonths(viewEnd, 1), 'MMM yyyy', { locale: sv })}
            </span>
            <button onClick={() => setViewStart(s => addMonths(s, zoom))} className="p-1.5 rounded hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-brand text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-dark">
            <Plus size={15} />Aktivitet
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 grid grid-cols-6 gap-3 items-end shadow-sm">
          <input className="col-span-2 input" placeholder="Aktivitetsnamn" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input type="date" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          <input type="date" className="input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          <input className="input" placeholder="Budget (kr)" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
          <div className="flex gap-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.isMilestone} onChange={e => setForm(f => ({ ...f, isMilestone: e.target.checked }))} />
              Milstolpe
            </label>
            <button onClick={() => createMutation.mutate()} disabled={!form.name || !form.startDate || !form.endDate}
              className="bg-brand text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-dark">
              Spara
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header månader */}
        <div className="flex border-b border-gray-200">
          <div className="w-64 flex-shrink-0 px-4 py-2 text-xs font-semibold text-gray-500 border-r border-gray-200">Aktivitet</div>
          <div className="flex-1 flex">
            {months.map(m => (
              <div key={m.toISOString()} className="flex-1 px-2 py-2 text-xs font-medium text-gray-500 border-r border-gray-100 last:border-r-0 text-center">
                {format(m, zoom <= 3 ? 'MMMM yyyy' : 'MMM', { locale: sv })}
              </div>
            ))}
          </div>
        </div>

        {/* Idag-linje + rader */}
        {activities.map((a: any) => {
          const bar = getBar(new Date(a.startDate), new Date(a.endDate))
          const todayPct = (differenceInDays(new Date(), viewStart) / totalDays) * 100

          return (
            <div key={a.id} className="flex border-b border-gray-100 last:border-b-0 hover:bg-gray-50 group">
              <div className="w-64 flex-shrink-0 px-4 py-3 border-r border-gray-200 flex items-center gap-2">
                {a.isMilestone && <Flag size={13} className="text-brand flex-shrink-0" />}
                <span className="text-sm text-gray-800 truncate">{a.name}</span>
                <StatusBadge status={a.status} size="sm" />
                <button onClick={() => deleteMutation.mutate(a.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex-1 relative py-3 px-1">
                {/* idag-linje */}
                {todayPct >= 0 && todayPct <= 100 && (
                  <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10 pointer-events-none" style={{ left: `${todayPct}%` }} />
                )}
                {bar && (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-6 rounded flex items-center px-2 text-xs text-white font-medium truncate ${a.isMilestone ? 'bg-brand w-3 h-3 rounded-full p-0 top-1/2' : 'bg-brand/80'}`}
                    style={{ left: bar.left, width: a.isMilestone ? undefined : bar.width }}
                    title={a.name}
                  >
                    {!a.isMilestone && `${a.progress}%`}
                  </div>
                )}
                {bar && !a.isMilestone && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-6 rounded bg-brand"
                    style={{ left: bar.left, width: `calc(${bar.width} * ${a.progress / 100})`, opacity: 0.9 }}
                  />
                )}
              </div>
            </div>
          )
        })}

        {activities.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">Inga aktiviteter ännu</div>
        )}
      </div>

      {/* Beroenden */}
      {activities.some((a: any) => a.dependsOn?.length > 0 || a.blockedBy?.length > 0) && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Beroenden</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left pb-2 font-medium">Aktivitet</th>
              <th className="text-left pb-2 font-medium">Blockeras av</th>
            </tr></thead>
            <tbody>
              {activities.filter((a: any) => a.dependsOn?.length > 0).map((a: any) => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 text-gray-800">{a.name}</td>
                  <td className="py-2 text-gray-500">{a.dependsOn.map((d: any) => d.fromActivity.name).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
