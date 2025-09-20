import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ProfileModal from './ProfileModal'

const navItems = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/models', label: 'Modelos' },
]

export default function Navbar({ notifications = 0 }: { notifications?: number }) {
  const [notifCount, setNotifCount] = useState(notifications)
  const [lastMessage, setLastMessage] = useState<string>('')
  const hasNotifications = useMemo(() => notifCount > 0, [notifCount])
  const [openProfile, setOpenProfile] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>
      if (typeof ce.detail === 'string') setLastMessage(ce.detail)
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
          <span className="font-poppins font-bold text-lg text-header">Blackboard</span>
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
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-alt text-header hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Notificaciones" title={lastMessage || 'Notificaciones'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z"/>
              <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16Z"/>
            </svg>
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 ring-2 ring-white text-[10px] leading-[14px] text-white flex items-center justify-center">{Math.min(notifCount, 9)}</span>
            )}
          </button>
          <button onClick={() => setOpenProfile(true)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
            <img src="/src/assets/avatar.svg" alt="Avatar" className="h-10 w-10 rounded-full border border-slate-200" />
          </button>
          <button className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-600 hover:text-header transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1" onClick={() => alert('Cerrar sesión')}>📤 Cerrar sesión</button>
        </div>
      </div>
    </header>
    {openProfile && (
      <ProfileModal onClose={() => setOpenProfile(false)} onConfirm={() => {
        window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Perfil actualizado' }))
        setOpenProfile(false)
      }} />
    )}
  </>
  )
}
