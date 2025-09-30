import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import ProfileModal from './ProfileModal'
import { useUserStore } from '../../auth/userStore'
import { useModelContext } from '../../contexts/ModelContext'

export default function Navbar({ notifications = 0, isDarkMode = false, toggleDarkMode }: { notifications?: number, isDarkMode?: boolean, toggleDarkMode?: () => void }) {
  const { user } = useUserStore()
  const { selectedModel, isModelSelected } = useModelContext()
  const navigate = useNavigate()
  const [notifCount, setNotifCount] = useState(notifications)
  const [lastMessage, setLastMessage] = useState<string>('')
  const hasNotifications = useMemo(() => notifCount > 0, [notifCount])
  const [openProfile, setOpenProfile] = useState(false)
  const [openCenter, setOpenCenter] = useState(false)
  const [openMobile, setOpenMobile] = useState(false)
  const [openLogout, setOpenLogout] = useState(false)
  const [items, setItems] = useState<{ id: string; message: string; ts: number }[]>([])

  // Determinar rutas dinámicamente basado en el modelo seleccionado
  const navItems = useMemo(() => {
    // Si no hay modelo seleccionado, mostrar solo Inicio y Modelos
    if (!isModelSelected || !selectedModel) {
      return [
        { to: '/blackboard', label: 'Inicio' },
        { to: '/blackboard/models', label: 'Modelos' },
      ]
    }

    // Si hay modelo seleccionado, mostrar todas las opciones
    const basePath = selectedModel.basePath
    return [
      { to: '/blackboard', label: 'Inicio' },
      { to: '/blackboard/models', label: 'Modelos' },
      { to: `${basePath}/capture`, label: 'Capturar' },
      { to: `${basePath}/train`, label: 'Entrenar' },
      { to: `${basePath}/practice`, label: 'Probar' },
    ]
  }, [isModelSelected, selectedModel])

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
    <header className={`${isDarkMode ? 'bg-[#0A0A0A]/95 border-b border-gray-900' : 'bg-white/80 border-b border-slate-100'} backdrop-blur sticky top-0 z-40`}>
      <div className="container-page flex items-center justify-between py-2">
        <Link to="/blackboard" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary ${isDarkMode ? 'bg-gray-800' : 'bg-primary/10'}`}>
            {/* Abstract ML icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M4 7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-2v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>
            </svg>
          </span>
          <span className={`font-poppins font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-header'} hidden lg:inline`}>AresDigitalAcademy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative px-3 py-2 rounded-md text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive 
                    ? (isDarkMode ? 'text-gray-100 bg-gray-800' : 'text-header')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-slate-600 hover:text-header')
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
          {/* Botón de tema oscuro */}
          {toggleDarkMode && (
            <button 
              onClick={toggleDarkMode}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDarkMode 
                  ? 'bg-gray-900 text-yellow-400 hover:bg-gray-800 border border-gray-800' 
                  : 'bg-alt text-header hover:opacity-90'
              }`}
              aria-label={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
          <button onClick={() => { setOpenCenter((o) => !o); setNotifCount(0) }} className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isDarkMode 
              ? 'bg-gray-900 text-gray-200 hover:bg-gray-800 border border-gray-800' 
              : 'bg-alt text-header hover:opacity-90'
          }`} aria-label="Notificaciones" title={lastMessage || 'Notificaciones'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z"/>
              <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16Z"/>
            </svg>
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 ring-2 ring-white text-[10px] leading-[14px] text-white flex items-center justify-center">{Math.min(notifCount, 9)}</span>
            )}
          </button>
          {/* Avatar desktop only */}
          <button
            onClick={() => setOpenProfile(true)}
            className="hidden md:inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
            title="Perfil"
            aria-label="Abrir perfil"
          >
            <img src={user.profile.avatarDataUrl || '/src/assets/avatar.svg'} alt="Avatar" className={`h-10 w-10 rounded-full object-cover ${isDarkMode ? 'border border-gray-600' : 'border border-slate-200'}`} />
          </button>
          {/* Mobile hamburger */}
          <button
            className={`lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isDarkMode ? 'text-gray-200 hover:bg-gray-800 border border-gray-800' : 'text-header hover:bg-slate-100 border border-slate-200'}`}
            aria-label="Abrir menú"
            aria-controls="mobile-menu"
            aria-expanded={openMobile}
            onClick={() => setOpenMobile(v => !v)}
          >
            {openMobile ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M6 18L18 6"/><path d="M6 6l12 12"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
            )}
          </button>
          <button
            className={`hidden sm:inline-flex items-center gap-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-3 py-2 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white border border-gray-600 hover:bg-gray-800' 
                : 'text-slate-600 hover:text-header border border-slate-200 hover:bg-slate-50'
              }`}
            onClick={() => setOpenLogout(true)}
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
      {/* Mobile dropdown menu */}
      <div id="mobile-menu" className={`md:hidden border-t ${openMobile ? 'block' : 'hidden'} ${isDarkMode ? 'border-gray-800 bg-[#0A0A0A]' : 'border-slate-100 bg-white'}`}>
        <nav className="container-page py-2">
          <ul className="flex flex-col py-1">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `block px-3 py-2 rounded-md text-sm transition ${isDarkMode ? (isActive ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800') : (isActive ? 'text-header bg-slate-100' : 'text-slate-700 hover:text-header hover:bg-slate-50')}`}
                  onClick={() => setOpenMobile(false)}
                >
                  <span className="inline-flex items-center">
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
            {/* Perfil action to open Profile modal */}
            <li className="mt-1">
              <button
                type="button"
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-slate-700 hover:text-header hover:bg-slate-50'}`}
                onClick={() => { setOpenMobile(false); setOpenProfile(true) }}
              >
                Perfil
              </button>
            </li>
            {/* Cerrar sesión for mobile */}
            <li className="mt-1">
              <button
                type="button"
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-slate-700 hover:text-header hover:bg-slate-50'}`}
                onClick={() => { setOpenMobile(false); setOpenLogout(true) }}
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    {/* Notification Center */}
    {openCenter && (
      <div className="fixed inset-0 z-40" onClick={() => setOpenCenter(false)}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute right-4 top-16 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className={`rounded-xl shadow-2xl overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-600' 
              : 'bg-white border border-slate-200'
          }`}>
            <div className={`px-4 py-3 flex items-center justify-between ${
              isDarkMode ? 'bg-gray-700' : 'bg-alt'
            }`}>
              <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-header'}`}>Notificaciones</div>
              <button className={`text-sm transition ${
                isDarkMode ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-header'
              }`} onClick={() => { setItems([]); try { localStorage.removeItem(STORAGE_KEY) } catch {} }}>Limpiar</button>
            </div>
            {items.length === 0 ? (
              <div className={`p-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Sin notificaciones</div>
            ) : (
              <ul className={`max-h-80 overflow-y-auto ${isDarkMode ? 'divide-y divide-gray-600' : 'divide-y divide-slate-100'}`}>
                {items.map(n => (
                  <li key={n.id} className={`px-4 py-3 text-sm flex items-start gap-3 ${
                    isDarkMode ? 'text-gray-200' : 'text-slate-700'
                  }`}>
                    <span className="mt-0.5">🔔</span>
                    <div>
                      <div>{n.message}</div>
                      <div className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{new Date(n.ts).toLocaleString()}</div>
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
    {openLogout && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpenLogout(false)} />
        <div className={`relative w-full max-w-sm rounded-xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-header'}`}>¿Cerrar sesión?</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm mt-1`}>Se cerrará tu sesión actual y volverás al inicio.</p>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button className="btn" onClick={() => setOpenLogout(false)}>Cancelar</button>
            <button className="btn-accent-rose" onClick={() => { setOpenLogout(false); navigate('/') }}>Confirmar</button>
          </div>
        </div>
      </div>
    )}
  </>
  )
}