import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSharedProject } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Flag, Lock } from 'lucide-react'

export default function ShareView() {
  const { token } = useParams<{ token: string }>()

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['share', token],
    queryFn: () => getSharedProject(token!),
  })

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-sm">Laddar...</div>
  )

  if (isError || !project) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <Lock size={32} className="text-gray-400" />
      <p className="text-gray-600 font-medium">Ogiltig eller utgången share-länk</p>
    </div>
  )

  const milestones = project.activities?.filter((a: any) => a.isMilestone) ?? []
  const openRisks = project.risks?.filter((r: any) => r.status === 'OPEN') ?? []

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Lock size={12} />
        Read-only delad vy
      </div>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        <StatusBadge status={project.status} />
      </div>

      {project.description && <p className="text-gray-600 mb-6">{project.description}</p>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Flag size={14} className="text-brand" />Milstolpar
          </h2>
          {milestones.length === 0 ? (
            <p className="text-xs text-gray-400">Inga milstolpar</p>
          ) : (
            <ul className="space-y-2">
              {milestones.map((m: any) => (
                <li key={m.id} className="flex justify-between text-sm">
                  <span className="text-gray-800">{m.name}</span>
                  <span className="text-gray-500">{format(new Date(m.startDate), 'd MMM yyyy', { locale: sv })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Öppna risker</h2>
          {openRisks.length === 0 ? (
            <p className="text-xs text-gray-400">Inga öppna risker</p>
          ) : (
            <ul className="space-y-2">
              {openRisks.map((r: any) => (
                <li key={r.id} className="text-sm text-gray-600 flex gap-2">
                  <span className={`text-xs font-semibold ${r.impact === 'HIGH' ? 'text-red-600' : r.impact === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                    [{r.impact}]
                  </span>
                  {r.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Aktiviteter</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left pb-2 font-medium">Namn</th>
              <th className="text-left pb-2 font-medium">Start</th>
              <th className="text-left pb-2 font-medium">Slut</th>
              <th className="text-left pb-2 font-medium">Status</th>
              <th className="text-right pb-2 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {project.activities?.map((a: any) => (
              <tr key={a.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 flex items-center gap-1.5">
                  {a.isMilestone && <Flag size={12} className="text-brand" />}
                  {a.name}
                </td>
                <td className="py-2 text-gray-500">{format(new Date(a.startDate), 'd MMM', { locale: sv })}</td>
                <td className="py-2 text-gray-500">{format(new Date(a.endDate), 'd MMM', { locale: sv })}</td>
                <td className="py-2"><StatusBadge status={a.status} size="sm" /></td>
                <td className="py-2 text-right text-gray-600">{a.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
