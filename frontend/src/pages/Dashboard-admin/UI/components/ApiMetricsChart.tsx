import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { Download, Maximize2, Activity, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

interface ApiMetric {
  time: string
  requests: number
  responseTime: number
  errors: number
  successRate: number
}

interface ApiMetricsChartProps {
  data: ApiMetric[]
  isDarkMode?: boolean
}

const ApiMetricsChart: React.FC<ApiMetricsChartProps> = ({ data, isDarkMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['requests', 'responseTime'])
  const [chartType, setChartType] = useState<'line' | 'area'>('line')

  const metricConfig = {
    requests: { color: '#3B82F6', label: 'Requests/min', unit: '' },
    responseTime: { color: '#10B981', label: 'Tiempo Respuesta', unit: 'ms' },
    errors: { color: '#EF4444', label: 'Errores', unit: '' },
    successRate: { color: '#8B5CF6', label: 'Tasa Éxito', unit: '%' }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Tiempo', 'Requests', 'Tiempo Respuesta (ms)', 'Errores', 'Tasa Éxito (%)'],
      ...data.map(item => [
        item.time,
        item.requests,
        item.responseTime,
        item.errors,
        item.successRate
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'api-metrics-data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  // Calcular métricas de resumen
  const totalRequests = data.reduce((sum, item) => sum + item.requests, 0)
  const avgResponseTime = data.length > 0 
    ? (data.reduce((sum, item) => sum + item.responseTime, 0) / data.length).toFixed(0)
    : '0'
  const totalErrors = data.reduce((sum, item) => sum + item.errors, 0)
  const avgSuccessRate = data.length > 0 
    ? (data.reduce((sum, item) => sum + item.successRate, 0) / data.length).toFixed(1)
    : '0'

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Métricas de API
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {totalRequests.toLocaleString()} requests totales
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {avgResponseTime}ms promedio
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-blue-200 hover:text-white hover:bg-blue-600/50' : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100'
              }`}
            >
              Líneas
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'area'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-blue-200 hover:text-white hover:bg-blue-600/50' : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100'
              }`}
            >
              Área
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Requests
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalRequests.toLocaleString()}
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tiempo Promedio
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {avgResponseTime}ms
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Errores
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalErrors}
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-purple-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tasa Éxito
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {avgSuccessRate}%
          </span>
        </div>
      </div>

      {/* Selector de métricas */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-gray-500" />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Métricas a mostrar:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(metricConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedMetrics.includes(key)
                  ? 'text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedMetrics.includes(key) ? config.color : undefined
              }}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className={`${isExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                  dataKey="time" 
                  stroke={isDarkMode ? '#FFFFFF' : '#000000'}
                  fontSize={12}
                  tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#FFFFFF' : '#000000'}
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
                formatter={(value: number, name: string) => [
                  `${value}${metricConfig[name as keyof typeof metricConfig]?.unit || ''}`,
                  metricConfig[name as keyof typeof metricConfig]?.label || name
                ]}
              />
              <Legend />
              {selectedMetrics.map((metric) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={metricConfig[metric as keyof typeof metricConfig].color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="time" 
                stroke={isDarkMode ? '#FFFFFF' : '#000000'}
                fontSize={12}
                tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }}
              />
              <YAxis 
                stroke={isDarkMode ? '#FFFFFF' : '#000000'}
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
                formatter={(value: number, name: string) => [
                  `${value}${metricConfig[name as keyof typeof metricConfig]?.unit || ''}`,
                  metricConfig[name as keyof typeof metricConfig]?.label || name
                ]}
              />
              <Legend />
              {selectedMetrics.map((metric, index) => (
                <Area
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stackId={index}
                  stroke={metricConfig[metric as keyof typeof metricConfig].color}
                  fill={metricConfig[metric as keyof typeof metricConfig].color}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ApiMetricsChart