import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, ArrowUpDown, List, LayoutGrid, GitBranch, Share2, Calendar, Flag } from 'lucide-react'
import { getProjects, createProject, getAllActivities } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { cn, statusLabels } from '../lib/utils'

type ViewMode = 'lista' | 'tavla' | 'arbetsflode'

const COLUMNS = [
  { key: 'NOT_STARTED', label: 'Att göra',  color: 'text-gray-500', dot: 'bg-gray-400' },
  { key: 'IN_PROGRESS', label: 'Pågående',  color: 'text-blue-600', dot: 'bg-blue-500' },
  { key: 'BLOCKED',     label: 'Blockerad', color: 'text-orange-600', dot: 'bg-orange-500' },
  { key: 'DONE',        label: 'Klar',      color: 'text-green-600', dot: 'bg-brand' },
]

const PROJECT_TAG_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
]

export default function Portfolio() {
  const [view, setView] = useState<ViewMode>('tavla')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => getProjects(search || undefined),
  })

  const { data: allActivities = [] } = useQuery({
    queryKey: ['all-activities'],
    queryFn: getAllActivities,
  })

  const createMutation = useMutation({
    mutationFn: () => createProject({ name: newName }),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      setShowCreate(false)
      setNewName('')
      navigate(`/projects/${project.id}`)
    },
  })

  const ps: any[] = projects
  const acts: any[] = allActivities

  const totalActs = acts.length
  const doneActs = acts.filter(a => a.status === 'DONE').length
  const completion = totalActs > 0 ? Math.round((doneActs / totalActs) * 100) : 0
  const inProgress = acts.filter(a => a.status === 'IN_PROGRESS').length

  // Projekt-id → färgindex
  const projectColorMap: Record<number, number> = {}
  ps.forEach((p, i) => { projectColorMap[p.id] = i })

  const activitiesByStatus = (status: string) =>
    acts.filter(a => a.status === status)

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Portfölj</h1>
          <div className="flex items-center gap-1 ml-4">
            {(['lista', 'tavla', 'arbetsflode'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  view === v ? 'bg-brand text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                {v === 'lista' && <List size={14} />}
                {v === 'tavla' && <LayoutGrid size={14} />}
                {v === 'arbetsflode' && <GitBranch size={14} />}
                {v === 'lista' ? 'Lista' : v === 'tavla' ? 'Tavla' : 'Arbetsflöde'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <List size={14} /> Lista
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Share2 size={14} /> Dela
          </button>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 px-8 py-3 bg-white border-b border-gray-100">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sök aktiviteter..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          <SlidersHorizontal size={14} /> Filter
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowUpDown size={14} /> Sortera
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <GradientCard
            label="Totalt aktiviteter"
            value={totalActs}
            sub={`+${ps.length} projekt totalt`}
            gradient="from-brand to-emerald-400"
            icon="📋"
          />
          <GradientCard
            label="Pågående"
            value={inProgress}
            sub={`av ${totalActs} aktiviteter`}
            gradient="from-orange-400 to-pink-500"
            icon="⚡"
          />
          <GradientCard
            label="Slutförda"
            value={`${completion}%`}
            sub={`${doneActs} av ${totalActs} klara`}
            gradient="from-emerald-500 to-green-400"
            icon="✓"
          />
        </div>

        {/* Create project form */}
        {showCreate && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newName && createMutation.mutate()}
              placeholder="Projektnamn..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button onClick={() => createMutation.mutate()} disabled={!newName}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-brand-dark transition-colors">
              Skapa
            </button>
            <button onClick={() => setShowCreate(false)} className="text-sm text-gray-500 hover:text-gray-700">Avbryt</button>
          </div>
        )}

        {/* Tavla / Lista */}
        {view === 'tavla' && (
          <div className="grid grid-cols-4 gap-5">
            {COLUMNS.map(col => {
              const items = activitiesByStatus(col.key)
              return (
                <div key={col.key}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                    <span className="text-xs text-gray-400 ml-auto">({items.length})</span>
                  </div>
                  <div className="space-y-3">
                    {items.map(a => (
                      <ActivityCard
                        key={a.id}
                        activity={a}
                        tagColor={PROJECT_TAG_COLORS[projectColorMap[a.projectId] % PROJECT_TAG_COLORS.length]}
                        onClick={() => navigate(`/projects/${a.projectId}/plan`)}
                      />
                    ))}
                    {items.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                        Inga aktiviteter
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {view === 'lista' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktivitet</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Projekt</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Startdatum</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slutdatum</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {acts.map(a => (
                  <tr key={a.id} onClick={() => navigate(`/projects/${a.projectId}/plan`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {a.isMilestone && <Flag size={12} className="inline mr-1.5 text-brand" />}
                      {a.name}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROJECT_TAG_COLORS[projectColorMap[a.projectId] % PROJECT_TAG_COLORS.length]}`}>
                        {a.project?.name}
                      </span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} size="sm" /></td>
                    <td className="px-5 py-3 text-gray-500">{format(new Date(a.startDate), 'd MMM', { locale: sv })}</td>
                    <td className="px-5 py-3 text-gray-500">{format(new Date(a.endDate), 'd MMM', { locale: sv })}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-brand h-1.5 rounded-full transition-all" style={{ width: `${a.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{a.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'arbetsflode' && (
          <div className="space-y-3">
            {ps.map((p: any) => (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-brand/40 hover:shadow-sm transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PROJECT_TAG_COLORS[projectColorMap[p.id] % PROJECT_TAG_COLORS.length]}`}>
                    {p.name}
                  </span>
                  {p.phase && <span className="text-sm text-gray-500">Fas: <strong className="text-gray-700">{p.phase}</strong></span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{p._count?.activities ?? 0} aktiviteter</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nytt projekt-knapp */}
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-8 right-8 flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-full shadow-lg hover:bg-brand-dark transition-colors font-semibold text-sm"
        >
          <Plus size={18} /> Nytt projekt
        </button>
      </div>
    </div>
  )
}

function GradientCard({ label, value, sub, gradient, icon }: {
  label: string; value: string | number; sub: string; gradient: string; icon: string
}) {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-white/80">{label}</p>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
          {icon}
        </div>
      </div>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-sm text-white/70 mt-1">{sub}</p>
    </div>
  )
}

function ActivityCard({ activity, tagColor, onClick }: { activity: any; tagColor: string; onClick: () => void }) {
  return (
    <div onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all">
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColor}`}>
          {activity.project?.name}
        </span>
        {activity.isMilestone && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand-dark flex items-center gap-1">
            <Flag size={10} /> Milstolpe
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{activity.name}</h3>
      {activity.progress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Framsteg</span>
            <span className="text-xs font-medium text-gray-600">{activity.progress}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-1.5">
            <div className="bg-brand h-1.5 rounded-full" style={{ width: `${activity.progress}%` }} />
          </div>
        </div>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
        <Calendar size={12} />
        {format(new Date(activity.endDate), 'd MMM', { locale: sv })}
      </div>
    </div>
  )
}
