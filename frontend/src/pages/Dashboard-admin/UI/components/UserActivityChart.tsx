import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, Maximize2, Users, Activity } from 'lucide-react'

interface UserActivityData {
  hour: string
  active: number
  sessions: number
}

interface UserActivityChartProps {
  data: UserActivityData[]
  isDarkMode?: boolean
}

const UserActivityChart: React.FC<UserActivityChartProps> = ({ data, isDarkMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'active' | 'sessions'>('active')

  const exportToCSV = () => {
    const csvContent = [
      ['Hora', 'Usuarios Activos', 'Sesiones'],
      ...data.map(item => [
        item.hour,
        item.active.toString(),
        item.sessions.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user-activity-data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const peakHour = data.reduce((max, item) => 
    item[selectedMetric] > max[selectedMetric] ? item : max
  )

  const totalActive = data.reduce((sum, item) => sum + item.active, 0)
  const totalSessions = data.reduce((sum, item) => sum + item.sessions, 0)

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Actividad de Usuarios por Hora
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Pico: {peakHour.hour} ({peakHour[selectedMetric]} {selectedMetric === 'active' ? 'usuarios' : 'sesiones'})
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as 'active' | 'sessions')}
            className={`px-3 py-1 rounded-lg text-sm border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="active">Usuarios Activos</option>
            <option value="sessions">Sesiones</option>
          </select>
          <button
            onClick={exportToCSV}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Exportar datos"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Expandir gráfico"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Métricas resumen */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Usuarios Activos
            </span>
          </div>
          <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalActive.toLocaleString()}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Sesiones
            </span>
          </div>
          <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalSessions.toLocaleString()}
          </div>
        </div>
      </div>

      <div className={`${isExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="hour" 
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              fontSize={12}
            />
            <YAxis 
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#E5E7EB' : '#1F2937'
              }}
              labelFormatter={(label) => `Hora: ${label}`}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'active' ? 'Usuarios Activos' : 'Sesiones'
              ]}
            />
            {selectedMetric === 'active' ? (
              <Area
                type="monotone"
                dataKey="active"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActive)"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSessions)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default UserActivityChart