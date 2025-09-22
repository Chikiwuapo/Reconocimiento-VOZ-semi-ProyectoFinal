import { useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/models', label: 'Mis Modelos' },
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
            {/* Icono pequeño similar al de PromoCarousel */}
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <circle cx="12" cy="5.5" r="2.3" fill="#1B4965" />
              <circle cx="6" cy="12" r="1.8" fill="#62B6CB" />
              <circle cx="18" cy="12" r="1.8" fill="#1B4965" />
              <circle cx="12" cy="18.5" r="2.3" fill="#62B6CB" />
              <path d="M12 7.8 L6 12 L12 18.5 L18 12 L12 7.8 Z" stroke="#1B4965" strokeWidth="1.2" fill="none" />
            </svg>
          </span>
          <span className="font-montserrat font-bold text-lg text-header">Arias Digital Soft</span>
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
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold select-none">U</div>
        </div>
      </div>
    </header>
  )
}
