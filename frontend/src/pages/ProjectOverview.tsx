import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Calendar, ChevronRight, AlertTriangle, Flag, Layers } from 'lucide-react'

export default function ProjectOverview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(Number(id)),
  })

  if (isLoading) return <div className="p-8 text-gray-500 text-sm">Laddar...</div>
  if (!project) return <div className="p-8 text-gray-500 text-sm">Projekt hittades inte</div>

  const milestones = project.activities?.filter((a: any) => a.isMilestone) ?? []
  const nextMilestone = milestones.find((m: any) => m.status !== 'DONE')
  const totalBudget = project.activities?.reduce((sum: number, a: any) => sum + (a.budget || 0), 0) ?? 0
  const openRisks = project.risks?.filter((r: any) => r.status === 'OPEN') ?? []
  const openIssues = project.issues?.filter((i: any) => i.status !== 'RESOLVED') ?? []

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">Portfölj</button>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium">{project.name}</span>
      </div>

      {/* Title */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && <p className="text-gray-500 mt-1 text-sm">{project.description}</p>}
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
        <StatCard label="Fas" value={project.phase || '–'} icon={<Layers size={14} />} />
        <StatCard
          label="Nästa milstolpe"
          value={nextMilestone ? nextMilestone.name : '–'}
          sub={nextMilestone ? format(new Date(nextMilestone.startDate), 'd MMM yyyy', { locale: sv }) : undefined}
          icon={<Flag size={14} />}
          highlight
        />
        <StatCard
          label="Total budget"
          value={totalBudget ? `${totalBudget.toLocaleString('sv')} kr` : '–'}
        />
        <StatCard
          label="Senast uppdaterad"
          value={format(new Date(project.updatedAt), 'd MMM yyyy', { locale: sv })}
          icon={<Calendar size={14} />}
        />
      </div>

      {/* Summary */}
      {project.summary && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sammanfattning</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{project.summary}</p>
        </div>
      )}

      {/* RAID */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle size={13} className="text-orange-500" />
            Öppna risker ({openRisks.length})
          </h2>
          {openRisks.length === 0 ? (
            <p className="text-xs text-gray-400">Inga öppna risker</p>
          ) : (
            <ul className="space-y-2">
              {openRisks.slice(0, 3).map((r: any) => (
                <li key={r.id} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    r.impact === 'HIGH' ? 'bg-red-500' : r.impact === 'MEDIUM' ? 'bg-yellow-500' : 'bg-brand'
                  }`} />
                  {r.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Issues ({openIssues.length})
          </h2>
          {openIssues.length === 0 ? (
            <p className="text-xs text-gray-400">Inga öppna issues</p>
          ) : (
            <ul className="space-y-2">
              {openIssues.slice(0, 3).map((i: any) => (
                <li key={i.id} className="text-xs text-gray-600">{i.description}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          to={`/projects/${id}/plan`}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors shadow-sm"
        >
          Öppna Plan
        </Link>
        <Link
          to={`/projects/${id}/management`}
          className="border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          Management
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, highlight }: {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 border shadow-sm ${highlight ? 'bg-brand/5 border-brand/25' : 'bg-white border-gray-200'}`}>
      <p className={`text-xs mb-1.5 flex items-center gap-1.5 ${highlight ? 'text-brand-dark' : 'text-gray-400'}`}>
        {icon}{label}
      </p>
      <p className={`font-semibold text-sm ${highlight ? 'text-brand-dark' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
