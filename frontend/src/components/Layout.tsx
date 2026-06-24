import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom'
import {
  LayoutDashboard, Activity, FolderKanban, MessageSquare, Settings,
  LogOut, Plus, Zap, Circle
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useQuery } from '@tanstack/react-query'
import { getProjects, getAllResources } from '../lib/api'

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-pink-500', 'bg-orange-500',
  'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500',
]

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}

const STATUS_DOT: Record<string, string> = {
  GREEN: 'bg-green-500',
  YELLOW: 'bg-yellow-400',
  RED: 'bg-red-500',
}

export default function Layout() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => getProjects() })
  const { data: resources = [] } = useQuery({ queryKey: ['resources'], queryFn: getAllResources })

  const projectNav = id
    ? [
        { to: `/projects/${id}`, icon: LayoutDashboard, label: 'Översikt', end: true },
        { to: `/projects/${id}/plan`, icon: Activity, label: 'Plan' },
        { to: `/projects/${id}/resources`, icon: FolderKanban, label: 'Resurser' },
        { to: `/projects/${id}/management`, icon: Settings, label: 'Management' },
      ]
    : []

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-emerald-400 flex items-center justify-center shadow-sm">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">Projekt X</span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-3">
          {/* Huvud-nav */}
          <NavLink to="/" end className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive ? 'bg-brand/10 text-brand-dark' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}>
            <LayoutDashboard size={16} /> Översikt
          </NavLink>
          <NavLink to="/activity" className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive ? 'bg-brand/10 text-brand-dark' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}>
            <Activity size={16} /> Aktivitet
          </NavLink>
          <NavLink to="/" end={false} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <FolderKanban size={16} /> Projekt
          </NavLink>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
            <MessageSquare size={16} /> Chatt
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
            <Settings size={16} /> Inställningar
          </a>

          {/* Projekt-sektionen */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projekt</span>
              <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            {(projects as any[]).map((p: any) => (
              <button
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-left',
                  id === String(p.id) ? 'bg-brand/10 text-brand-dark' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Circle size={8} className={`flex-shrink-0 fill-current ${STATUS_DOT[p.status] ? p.status === 'GREEN' ? 'text-green-500' : p.status === 'YELLOW' ? 'text-yellow-400' : 'text-red-500' : 'text-gray-400'}`} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Om vi är i ett projekt, visa projekt-nav */}
          {projectNav.length > 0 && (
            <div className="pt-2">
              <div className="px-3 mb-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sidor</span>
              </div>
              {projectNav.map(({ to, icon: Icon, label, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-brand/10 text-brand-dark' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}>
                  <Icon size={15} /> {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Teammedlemmar */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Teammedlemmar</span>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            {(resources as any[]).slice(0, 5).map((r: any, i: number) => (
              <div key={r.id} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar name={r.name} index={i} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400 truncate">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logga ut */}
        <div className="p-3 border-t border-gray-100">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors w-full">
            <LogOut size={16} />
            Logga ut
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
