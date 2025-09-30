import React, { useState } from 'react'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download, Maximize2, Database, HardDrive, Zap, Clock, Activity } from 'lucide-react'

interface DatabaseMetric {
  time: string
  connections: number
  queries: number
  slowQueries: number
  cacheHitRate: number
  diskUsage: number
}

interface DatabaseMetricsChartProps {
  data: DatabaseMetric[]
  isDarkMode?: boolean
}

const DatabaseMetricsChart: React.FC<DatabaseMetricsChartProps> = ({ data, isDarkMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedView, setSelectedView] = useState<'performance' | 'usage'>('performance')

  const exportToCSV = () => {
    const csvContent = [
      ['Tiempo', 'Conexiones', 'Queries', 'Queries Lentas', 'Cache Hit Rate (%)', 'Uso Disco (%)'],
      ...data.map(item => [
        item.time,
        item.connections,
        item.queries,
        item.slowQueries,
        item.cacheHitRate,
        item.diskUsage
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'database-metrics-data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calcular métricas de resumen
  const avgConnections = data.length > 0 
    ? Math.round(data.reduce((sum, item) => sum + item.connections, 0) / data.length)
    : 0
  const totalQueries = data.reduce((sum, item) => sum + item.queries, 0)
  const totalSlowQueries = data.reduce((sum, item) => sum + item.slowQueries, 0)
  const avgCacheHitRate = data.length > 0 
    ? (data.reduce((sum, item) => sum + item.cacheHitRate, 0) / data.length).toFixed(1)
    : '0'
  const currentDiskUsage = data.length > 0 ? data[data.length - 1].diskUsage : 0

  const getPerformanceData = () => {
    return data.map(item => ({
      ...item,
      slowQueryRate: item.queries > 0 ? ((item.slowQueries / item.queries) * 100).toFixed(1) : 0
    }))
  }

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Métricas de Base de Datos
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {avgConnections} conexiones promedio
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Cache hit: {avgCacheHitRate}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <button
              onClick={() => setSelectedView('performance')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedView === 'performance'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-blue-200 hover:text-white hover:bg-blue-600/50' : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100'
              }`}
            >
              Rendimiento
            </button>
            <button
              onClick={() => setSelectedView('usage')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedView === 'usage'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-blue-200 hover:text-white hover:bg-blue-600/50' : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100'
              }`}
            >
              Uso
            </button>
          </div>
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

      {/* Métricas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Conexiones
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {avgConnections}
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Queries
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalQueries.toLocaleString()}
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Queries Lentas
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalSlowQueries}
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Cache Hit
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {avgCacheHitRate}%
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-red-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Uso Disco
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentDiskUsage}%
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className={`${isExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={selectedView === 'performance' ? getPerformanceData() : data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="time" 
              stroke={isDarkMode ? "#FFFFFF" : "#000000"}
              fontSize={12}
              tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }}
            />
            <YAxis 
              stroke={isDarkMode ? "#FFFFFF" : "#000000"}
              fontSize={12}
              tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#E5E7EB' : '#1F2937'
              }}
            />
            <Legend />
            
            {selectedView === 'performance' ? (
              <>
                <Bar dataKey="queries" fill="#3B82F6" name="Queries" />
                <Bar dataKey="slowQueries" fill="#EF4444" name="Queries Lentas" />
                <Line 
                  type="monotone" 
                  dataKey="cacheHitRate" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Cache Hit Rate (%)"
                  dot={{ r: 4 }}
                />
              </>
            ) : (
              <>
                <Bar dataKey="connections" fill="#8B5CF6" name="Conexiones" />
                <Line 
                  type="monotone" 
                  dataKey="diskUsage" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Uso Disco (%)"
                  dot={{ r: 4 }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Alertas y recomendaciones */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border border-black ${
          currentDiskUsage > 80 
            ? 'border-red-500' 
            : 'border-black'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className={`w-4 h-4 ${currentDiskUsage > 80 ? 'text-red-500' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Estado del Disco
            </span>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {currentDiskUsage > 80 
              ? '⚠️ Uso de disco alto. Considere limpiar logs antiguos.'
              : '✅ Uso de disco dentro de límites normales.'}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border border-black ${
          parseFloat(avgCacheHitRate) < 80 
            ? 'border-yellow-500' 
            : 'border-black'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-4 h-4 ${parseFloat(avgCacheHitRate) < 80 ? 'text-yellow-500' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Rendimiento Cache
            </span>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {parseFloat(avgCacheHitRate) < 80 
              ? '⚠️ Cache hit rate bajo. Optimice configuración de cache.'
              : '✅ Cache funcionando eficientemente.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DatabaseMetricsChart