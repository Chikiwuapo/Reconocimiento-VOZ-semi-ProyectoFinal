import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ProfileModal from './ProfileModal'
import { useUserStore } from '../../auth/userStore'

const navItems = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/models', label: 'Modelos' },
]

export default function Navbar({ notifications = 0 }: { notifications?: number }) {
  const { user } = useUserStore()
  const [notifCount, setNotifCount] = useState(notifications)
  const [lastMessage, setLastMessage] = useState<string>('')
  const hasNotifications = useMemo(() => notifCount > 0, [notifCount])
  const [openProfile, setOpenProfile] = useState(false)
  const [openCenter, setOpenCenter] = useState(false)
  const [items, setItems] = useState<{ id: string; message: string; ts: number }[]>([])

  const STORAGE_KEY = 'appNotifications'

  useEffect(() => {
    // load existing notifications
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}

    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>
      if (typeof ce.detail === 'string') setLastMessage(ce.detail)
      const entry = { id: `n_${Date.now()}`, message: (ce as any).detail ?? 'Notificación', ts: Date.now() }
      setItems(prev => {
        const next = [entry, ...prev].slice(0, 50)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
        return next
      })
      setNotifCount((n) => n + 1)
    }
    window.addEventListener('app:notify', handler as EventListener)
    return () => window.removeEventListener('app:notify', handler as EventListener)
  }, [])

  return (
    <>
    <header className="bg-white/80 backdrop-blur sticky top-0 z-40 border-b border-slate-100">
      <div className="container-page flex items-center justify-between py-3">
        <Link to="/dashboard" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {/* Abstract ML icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M4 7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-2v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>
            </svg>
          </span>
          <span className="font-poppins font-bold text-lg text-header">AresDigitalAcademy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative px-3 py-2 rounded-md text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive ? 'text-header' : 'text-slate-600 hover:text-header'
                }`
              }
            >
              {({ isActive }) => (
                <span className="relative inline-flex items-center">
                  {item.label}
                  {isActive && (
                    <span className="pointer-events-none absolute inset-x-2 -bottom-1 h-0.5 bg-primary rounded-full" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => { setOpenCenter((o) => !o); setNotifCount(0) }} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-alt text-header hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Notificaciones" title={lastMessage || 'Notificaciones'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z"/>
              <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16Z"/>
            </svg>
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 ring-2 ring-white text-[10px] leading-[14px] text-white flex items-center justify-center">{Math.min(notifCount, 9)}</span>
            )}
          </button>
          <button onClick={() => setOpenProfile(true)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
            <img src={user.profile.avatarDataUrl || '/src/assets/avatar.svg'} alt="Avatar" className="h-10 w-10 rounded-full border border-slate-200 object-cover" />
          </button>
          <button
            className="hidden sm:inline-flex items-center gap-2 text-sm text-slate-600 hover:text-header transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-3 py-2 border border-slate-200 hover:bg-slate-50"
            onClick={() => alert('Cerrar sesión')}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M10 17l5-5-5-5"/>
              <path d="M15 12H3"/>
              <path d="M21 21V3"/>
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
    {/* Notification Center */}
    {openCenter && (
      <div className="fixed inset-0 z-40" onClick={() => setOpenCenter(false)}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute right-4 top-16 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between bg-alt">
              <div className="font-semibold text-header">Notificaciones</div>
              <button className="text-sm text-slate-600 hover:text-header" onClick={() => { setItems([]); try { localStorage.removeItem(STORAGE_KEY) } catch {} }}>Limpiar</button>
            </div>
            {items.length === 0 ? (
              <div className="p-6 text-center text-slate-500">Sin notificaciones</div>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {items.map(n => (
                  <li key={n.id} className="px-4 py-3 text-sm text-slate-700 flex items-start gap-3">
                    <span className="mt-0.5">🔔</span>
                    <div>
                      <div>{n.message}</div>
                      <div className="text-[11px] text-slate-500">{new Date(n.ts).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )}
    {openProfile && (
      <ProfileModal onClose={() => setOpenProfile(false)} onConfirm={() => {
        window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Perfil actualizado' }))
        setOpenProfile(false)
      }} />
    )}
  </>
  )
}