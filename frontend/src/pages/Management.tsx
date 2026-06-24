import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProject, createRisk, createIssue, createDecision, createShareToken, exportIcs } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import { impactColors } from '../lib/utils'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Download, Link2, Flag, AlertTriangle, Maximize2, X } from 'lucide-react'

export default function Management() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [presentMode, setPresentMode] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [newRisk, setNewRisk] = useState('')
  const [newIssue, setNewIssue] = useState('')
  const [newDecision, setNewDecision] = useState('')
  const presentRef = useRef<HTMLDivElement>(null)

  const { data: project } = useQuery({ queryKey: ['project', id], queryFn: () => getProject(Number(id)) })

  const riskMut = useMutation({ mutationFn: (desc: string) => createRisk(Number(id), { description: desc }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setNewRisk('') } })
  const issueMut = useMutation({ mutationFn: (desc: string) => createIssue(Number(id), { description: desc }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setNewIssue('') } })
  const decisionMut = useMutation({ mutationFn: (desc: string) => createDecision(Number(id), { description: desc }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setNewDecision('') } })

  const handleShare = async () => {
    const res = await createShareToken(Number(id))
    setShareUrl(`${window.location.origin}/share/${res.token}`)
  }

  const handlePdf = async () => {
    if (!presentRef.current) return
    const canvas = await html2canvas(presentRef.current, { scale: 1.5 })
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 10, 10, 277, 177)
    pdf.save(`${project?.name}-management.pdf`)
  }

  if (!project) return <div className="p-8 text-gray-500 text-sm">Laddar...</div>

  const milestones = project.activities?.filter((a: any) => a.isMilestone && a.status !== 'DONE').slice(0, 3) ?? []
  const openRisks = project.risks?.filter((r: any) => r.status === 'OPEN') ?? []
  const openIssues = project.issues?.filter((i: any) => i.status !== 'RESOLVED') ?? []
  const deps = project.activities?.filter((a: any) => a.dependsOn?.length > 0).slice(0, 4) ?? []

  const Dashboard = ({ inPresent = false }: { inPresent?: boolean }) => (
    <div ref={inPresent ? presentRef : undefined} className={inPresent ? 'bg-gray-900 text-white p-10' : ''}>
      {inPresent && <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>}

      <div className={`grid grid-cols-2 gap-4 mb-4 ${inPresent ? 'lg:grid-cols-4' : ''}`}>
        <div className={`rounded-xl p-4 ${inPresent ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className="text-xs text-gray-400 mb-2">Status</p>
          <StatusBadge status={project.status} />
        </div>
        <div className={`rounded-xl p-4 ${inPresent ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className="text-xs text-gray-400 mb-1">Fas</p>
          <p className={`font-semibold ${inPresent ? 'text-white' : 'text-gray-900'}`}>{project.phase || '–'}</p>
        </div>
        <div className={`rounded-xl p-4 ${inPresent ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className="text-xs text-gray-400 mb-1">Öppna risker</p>
          <p className={`font-semibold text-xl ${openRisks.length > 0 ? 'text-red-500' : inPresent ? 'text-white' : 'text-gray-900'}`}>{openRisks.length}</p>
        </div>
        <div className={`rounded-xl p-4 ${inPresent ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className="text-xs text-gray-400 mb-1">Öppna issues</p>
          <p className={`font-semibold text-xl ${openIssues.length > 0 ? 'text-yellow-500' : inPresent ? 'text-white' : 'text-gray-900'}`}>{openIssues.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Nästa milstolpar" dark={inPresent} icon={<Flag size={13} />}>
          {milestones.length === 0 ? <Empty dark={inPresent}>Inga kommande milstolpar</Empty> : milestones.map((m: any) => (
            <div key={m.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
              <span className={inPresent ? 'text-gray-200' : 'text-gray-700'}>{m.name}</span>
              <span className="text-gray-400">{format(new Date(m.startDate), 'd MMM', { locale: sv })}</span>
            </div>
          ))}
        </Section>

        <Section title="Topp risker" dark={inPresent} icon={<AlertTriangle size={13} />}>
          {openRisks.length === 0 ? <Empty dark={inPresent}>Inga öppna risker</Empty> : openRisks.slice(0, 3).map((r: any) => (
            <div key={r.id} className="text-sm py-1.5 border-b border-gray-100 last:border-0">
              <span className={impactColors[r.impact]}>[{r.impact}]</span>{' '}
              <span className={inPresent ? 'text-gray-300' : 'text-gray-600'}>{r.description}</span>
            </div>
          ))}
        </Section>

        <Section title="Beroenden" dark={inPresent}>
          {deps.length === 0 ? <Empty dark={inPresent}>Inga beroenden</Empty> : deps.map((a: any) => (
            <div key={a.id} className="text-sm py-1.5 border-b border-gray-100 last:border-0">
              <span className={inPresent ? 'text-gray-200 font-medium' : 'text-gray-700 font-medium'}>{a.name}</span>
              <span className="text-gray-400"> beror på {a.dependsOn.map((d: any) => d.fromActivity.name).join(', ')}</span>
            </div>
          ))}
        </Section>

        <Section title="Beslutslogg" dark={inPresent}>
          {!project.decisions?.length ? <Empty dark={inPresent}>Inga beslut</Empty> :
            project.decisions.slice(0, 3).map((d: any) => (
              <div key={d.id} className="text-sm py-1.5 border-b border-gray-100 last:border-0">
                <span className={inPresent ? 'text-gray-200' : 'text-gray-600'}>{d.description}</span>
                <span className="ml-2 text-xs text-gray-400">{format(new Date(d.decidedAt), 'd MMM', { locale: sv })}</span>
              </div>
            ))}
        </Section>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Management — {project.name}</h1>
        <div className="flex gap-2">
          <button onClick={() => exportIcs(Number(id))} className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-colors">
            <Download size={14} />ICS
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-colors">
            <Link2 size={14} />Dela
          </button>
          <button onClick={() => setPresentMode(true)} className="flex items-center gap-1.5 bg-brand text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-brand-dark shadow-sm transition-colors">
            <Maximize2 size={14} />Presentation
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="mb-5 bg-brand/5 border border-brand/20 rounded-xl p-3 text-sm flex items-center gap-2">
          <Link2 size={14} className="text-brand" />
          <span className="text-brand-dark font-medium">Share-länk:</span>
          <a href={shareUrl} target="_blank" rel="noreferrer" className="text-gray-600 underline break-all">{shareUrl}</a>
        </div>
      )}

      <Dashboard />

      <div className="mt-6 grid grid-cols-3 gap-4">
        <RaidForm title="Ny risk" value={newRisk} onChange={setNewRisk} onSave={() => riskMut.mutate(newRisk)} />
        <RaidForm title="Ny issue" value={newIssue} onChange={setNewIssue} onSave={() => issueMut.mutate(newIssue)} />
        <RaidForm title="Nytt beslut" value={newDecision} onChange={setNewDecision} onSave={() => decisionMut.mutate(newDecision)} />
      </div>

      {presentMode && (
        <div className="fixed inset-0 z-50 bg-gray-900 overflow-auto">
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button onClick={handlePdf} className="flex items-center gap-1.5 bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/20">
              <Download size={14} />PDF
            </button>
            <button onClick={() => setPresentMode(false)} className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20">
              <X size={16} />
            </button>
          </div>
          <div className="p-10 max-w-6xl mx-auto">
            <Dashboard inPresent />
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, dark, icon, children }: { title: string; dark?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-4 ${dark ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${dark ? 'text-gray-400' : 'text-gray-400'}`}>
        {icon}{title}
      </h3>
      {children}
    </div>
  )
}

function Empty({ dark, children }: { dark?: boolean; children: React.ReactNode }) {
  return <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{children}</p>
}

function RaidForm({ title, value, onChange, onSave }: {
  title: string
  value: string
  onChange: (v: string) => void
  onSave: () => void
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <textarea
        className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-colors"
        rows={2}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Beskriv..."
      />
      <button
        onClick={onSave}
        disabled={!value}
        className="mt-2 w-full bg-brand text-white text-sm py-1.5 rounded-lg font-semibold disabled:opacity-40 hover:bg-brand-dark transition-colors"
      >
        Lägg till
      </button>
    </div>
  )
}
