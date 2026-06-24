import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProject, getResourceHierarchy } from '../lib/api'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function Resources() {
  const { id } = useParams<{ id: string }>()
  const { data: project } = useQuery({ queryKey: ['project', id], queryFn: () => getProject(Number(id)) })
  const { data: hierarchy = [] } = useQuery({ queryKey: ['resource-hierarchy'], queryFn: getResourceHierarchy })

  const allAssignments = project?.activities?.flatMap((a: any) =>
    a.resources.map((r: any) => ({ activity: a, resource: r.resource, hours: r.hoursNeeded }))
  ) ?? []

  const byTeam = allAssignments.reduce((acc: Record<string, any[]>, item: any) => {
    const teamName = item.resource?.team?.name || 'Okänt team'
    if (!acc[teamName]) acc[teamName] = []
    acc[teamName].push(item)
    return acc
  }, {})

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Resurser — {project?.name}</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Resurshierarki */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Resurshierarki</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {hierarchy.map((domain: any) => (
              <DomainNode key={domain.id} domain={domain} />
            ))}
            {hierarchy.length === 0 && (
              <p className="p-4 text-sm text-gray-400">Ingen resurshierarki konfigurerad</p>
            )}
          </div>
        </div>

        {/* Resursbehov per team */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Resursbehov per team</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {Object.keys(byTeam).length === 0 ? (
              <p className="p-4 text-sm text-gray-400">Inga resurstilldelningar</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                    <th className="text-left px-4 py-2 font-medium">Team</th>
                    <th className="text-left px-4 py-2 font-medium">Person</th>
                    <th className="text-left px-4 py-2 font-medium">Aktivitet</th>
                    <th className="text-right px-4 py-2 font-medium">Tim</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.entries(byTeam) as [string, any[]][]).map(([teamName, items]) => (
                    items.map((item, i) => (
                      <tr key={`${teamName}-${i}`} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2 text-gray-600">{i === 0 ? teamName : ''}</td>
                        <td className="px-4 py-2 text-gray-800">{item.resource?.name}</td>
                        <td className="px-4 py-2 text-gray-600 truncate max-w-[140px]">{item.activity.name}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{item.hours ?? '–'}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-gray-600">Totalt</td>
                    <td className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                      {allAssignments.reduce((s: number, a: any) => s + (a.hours || 0), 0)} tim
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DomainNode({ domain }: { domain: any }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {domain.name}
      </button>
      {open && domain.tribes?.map((tribe: any) => (
        <div key={tribe.id} className="pl-4 border-t border-gray-50">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500">{tribe.name}</div>
          {tribe.teams?.map((team: any) => (
            <div key={team.id} className="pl-4">
              <div className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-gray-50">{team.name}</div>
              {team.resources?.map((r: any) => (
                <div key={r.id} className="px-4 py-1.5 pl-8 text-xs text-gray-500 flex justify-between">
                  <span>{r.name}</span>
                  <span className="text-gray-400">{r.role}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
