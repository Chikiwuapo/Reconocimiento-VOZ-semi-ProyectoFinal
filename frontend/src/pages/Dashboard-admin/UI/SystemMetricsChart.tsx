import React from 'react'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'
import type { SystemMetrics } from '../../../types/dashboard.ts'
import { useTheme } from '../../../App'

interface SystemMetricsChartProps {
  data: SystemMetrics
  className?: string
}

const SystemMetricsChart: React.FC<SystemMetricsChartProps> = ({ data, className = '' }) => {
  const { isDarkMode } = useTheme()
  
  // Helpers de exportación
  const downloadFile = (filename: string, content: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    try {
      const rows = [
        ['name','value','unit','details'],
        ['CPU', String(data?.cpu?.usage ?? ''), '%', `${data?.cpu?.temperature ?? ''}°C, ${data?.cpu?.cores ?? ''} cores`],
        ['RAM', String(data?.ram?.percentage ?? ''), '%', `${data?.ram?.used ?? ''}GB / ${data?.ram?.total ?? ''}GB`],
        ['Almacenamiento', String(data?.storage?.percentage ?? ''), '%', `${data?.storage?.used ?? ''}GB / ${data?.storage?.total ?? ''}GB`],
        ['Red', String(Math.min((data?.network?.latency ?? 0) * 2, 100)), 'ms', `${data?.network?.downloadSpeed ?? ''}Mbps↓ ${data?.network?.uploadSpeed ?? ''}Mbps↑`],
      ]
      const csv = rows.map(r => r.join(',')).join('\n')
      downloadFile('system_metrics.csv', csv, 'text/csv')

      const payload = { exportedAt: new Date().toISOString(), data }
      downloadFile('system_metrics.json', JSON.stringify(payload, null, 2), 'application/json')
    } catch {
      // no-op
    }
  }

  const chartData = [
    {
      name: 'CPU',
      value: data?.cpu?.usage ?? 0,
      unit: '%',
      color: '#EF4444',
      details: `${data?.cpu?.temperature ?? 0}°C, ${data?.cpu?.cores ?? 0} cores`
    },
    {
      name: 'RAM',
      value: data?.ram?.percentage ?? 0,
      unit: '%',
      color: '#10B981',
      details: `${data?.ram?.used ?? 0}GB / ${data?.ram?.total ?? 0}GB`
    },
    {
      name: 'Storage',
      value: data?.storage?.percentage ?? 0,
      unit: '%',
      color: '#8B5CF6',
      details: `${data?.storage?.used ?? 0}GB / ${data?.storage?.total ?? 0}GB`
    },
    {
      name: 'Network',
      value: Math.min((data?.network?.latency ?? 0) * 2, 100),
      unit: 'ms',
      color: '#3B82F6',
      details: `${data?.network?.downloadSpeed ?? 0}Mbps↓ ${data?.network?.uploadSpeed ?? 0}Mbps↑`
    }
  ]

  const getBarColor = (val: number, base: string) => {
    if (val > 85) return '#EF4444'
    if (val > 60) return '#F59E0B'
    return base
  }

  return (
    <div className={`backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Métricas del Sistema</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-700 bg-gray-700/40 hover:bg-gray-700 text-gray-200 transition-colors"
          >
            Exportar
          </button>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Tiempo real</span>
        </div>
      </div>

      <div className="h-[400px]">
        {(!data || !data.cpu || !data.ram || !data.storage || !data.network) ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No hay métricas del sistema disponibles.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} />
              <XAxis 
                dataKey="name" 
                stroke={isDarkMode ? "#FFFFFF" : "#000000"} 
                tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }} 
              />
              <YAxis 
                stroke={isDarkMode ? "#FFFFFF" : "#000000"} 
                tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }} 
              />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', color: '#E5E7EB' }} />
              <Legend />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value, entry.color)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detalles */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
          <div className="rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>CPU</span>
              <span className={`text-sm font-semibold ${data.cpu.usage > 80 ? 'text-red-400' : data.cpu.usage > 60 ? 'text-yellow-400' : 'text-green-400'}`}>{data.cpu.usage.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className={`h-2 rounded-full ${data.cpu.usage > 80 ? 'bg-red-500' : data.cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${data.cpu.usage}%` }} />
            </div>
          </div>

          <div className="rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>RAM</span>
              <span className={`text-sm font-semibold ${data.ram.percentage > 85 ? 'text-red-400' : data.ram.percentage > 60 ? 'text-yellow-400' : 'text-green-400'}`}>{data.ram.percentage.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className={`h-2 rounded-full ${data.ram.percentage > 85 ? 'bg-red-500' : data.ram.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${data.ram.percentage}%` }} />
            </div>
          </div>

          <div className="rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Almacenamiento</span>
              <span className={`text-sm font-semibold ${data.storage.percentage > 85 ? 'text-red-400' : data.storage.percentage > 60 ? 'text-yellow-400' : 'text-green-400'}`}>{data.storage.percentage.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="h-2 rounded-full bg-purple-500" style={{ width: `${data.storage.percentage}%` }} />
            </div>
          </div>

          <div className="rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Red</span>
              <span className="text-sm font-semibold text-blue-400">{data.network.latency.toFixed(2)} ms</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min((data.network.latency || 0) * 2, 100)}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemMetricsChart
