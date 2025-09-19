import { useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/models', label: 'Modelos' },
  { to: '/training', label: 'Entrenar' },
  { to: '/test', label: 'Probar' },
  { to: '/favorites', label: 'Favoritos' },
  { to: '/profile', label: 'Perfil' },
]

export default function Navbar({ notifications = 0 }: { notifications?: number }) {
  const hasNotifications = useMemo(() => notifications > 0, [notifications])

  return (
    <header className="bg-white/80 backdrop-blur sticky top-0 z-40 border-b border-slate-100">
      <div className="container-page flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
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
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-alt text-header hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Notificaciones">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z"/>
              <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16Z"/>
            </svg>
            {hasNotifications && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
          <img src="/src/assets/avatar.svg" alt="Avatar" className="h-10 w-10 rounded-full border border-slate-200" />
          <button className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-600 hover:text-header transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1" onClick={() => alert('Cerrar sesión')}>📤 Cerrar sesión</button>
        </div>
      </div>
    </header>
  )
}
