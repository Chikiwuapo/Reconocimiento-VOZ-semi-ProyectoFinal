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
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} shadow-lg`}>
              <span className="text-white font-bold text-lg">A</span>
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
