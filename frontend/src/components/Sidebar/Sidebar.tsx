import React, { useState, useEffect } from 'react'
import { Gauge, LineChart, Activity, BarChart2, Clock, User, Settings, LogOut, ChevronDown, ChevronUp } from 'lucide-react'

interface SidebarProps {
  activeView: string
  setActiveView: (v: string) => void
  isDarkMode: boolean
}

const items = [
  { id: 'overview', label: 'Resumen General', icon: Gauge, description: 'Vista general del sistema' },
  { id: 'analytics', label: 'Análisis Avanzado', icon: LineChart, description: 'Métricas y estadísticas' },
  { id: 'performance', label: 'Rendimiento', icon: Activity, description: 'Monitoreo del sistema' },
  { id: 'reports', label: 'Reportes', icon: BarChart2, description: 'Informes y exportaciones' },
] as const

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isDarkMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isProfileExpanded, setIsProfileExpanded] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <aside className={`hidden lg:flex fixed left-0 top-0 h-full w-80 border-r ${isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 border-gray-200'} shadow-xl`}>
      <div className="p-6 w-full flex flex-col h-full">
        {/* Header con logo y reloj */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <defs>
                  <linearGradient id="grad-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3A7BD5"/>
                    <stop offset="50%" stopColor="#6A11CB"/>
                    <stop offset="100%" stopColor="#F53844"/>
                  </linearGradient>
                  <filter id="glow-sidebar" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1"/>
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2"/>
                    <feMerge>
                      <feMergeNode in="blur2"/>
                      <feMergeNode in="blur1"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path d="M128 400 L256 96 L384 400" stroke="url(#grad-sidebar)" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-sidebar)"/>
                <path d="M176 300 L336 300" stroke="url(#grad-sidebar)" strokeWidth="26" strokeLinecap="round" filter="url(#glow-sidebar)"/>
                <path d="M138 396 L256 116 L374 396" stroke="#FFFFFF10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M184 300 L328 300" stroke="#FFFFFF18" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ares Digital</h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Panel Administrativo</p>
            </div>
          </div>
          
          {/* Reloj en tiempo real */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Hora actual</span>
            </div>
            <div className={`text-2xl font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(currentTime)}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 capitalize`}>
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="space-y-2 flex-1">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Navegación
          </h3>
          {items.map((it) => {
            const Icon = it.icon
            const active = activeView === it.id
            return (
              <button
                key={it.id}
                onClick={() => setActiveView(it.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-200 group relative overflow-hidden ${
                  active 
                    ? `${isDarkMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'}` 
                    : `${isDarkMode ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-gray-200/50 hover:text-gray-900'}`
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20 rounded-xl" />
                )}
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-white' : ''}`} />
                <div className="flex-1 text-left relative z-10">
                  <div className="font-medium">{it.label}</div>
                  <div className={`text-xs opacity-75 ${active ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {it.description}
                  </div>
                </div>
                {active && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Perfil de usuario */}
        <div className="mt-auto">
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm`}>
            <button
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              className="w-full flex items-center gap-3 text-left"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1">
                <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Administrador
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  admin@aresdigital.com
                </div>
              </div>
              {isProfileExpanded ? (
                <ChevronUp className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              ) : (
                <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </button>
            
            {isProfileExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </button>
                <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
