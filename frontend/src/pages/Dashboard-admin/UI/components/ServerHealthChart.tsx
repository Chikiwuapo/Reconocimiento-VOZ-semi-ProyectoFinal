import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, Maximize2, Server, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ServerHealthData {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
}

interface ServerHealthChartProps {
  data: ServerHealthData[]
  isDarkMode?: boolean
}

const ServerHealthChart: React.FC<ServerHealthChartProps> = ({ data, isDarkMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10B981'
      case 'warning': return '#F59E0B'
      case 'critical': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Server className="w-4 h-4 text-gray-500" />
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Servidor', 'Estado', 'Uptime (%)'],
      ...data.map(item => [
        item.name,
        item.status,
        item.uptime.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'server-health-data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const healthyServers = data.filter(server => server.status === 'healthy').length
  const averageUptime = (data.reduce((sum, server) => sum + server.uptime, 0) / data.length).toFixed(1)

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Estado de Servidores
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {healthyServers}/{data.length} saludables
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Uptime promedio: {averageUptime}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Lista de servidores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {data.map((server) => (
          <div 
            key={server.name}
            className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(server.status)}
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {server.name}
                </span>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${
                server.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : server.status === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {server.status === 'healthy' ? 'Saludable' : 
                 server.status === 'warning' ? 'Advertencia' : 'Crítico'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Uptime
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {server.uptime}%
              </span>
            </div>
            <div className={`w-full bg-gray-300 rounded-full h-2 mt-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${server.uptime}%`,
                  backgroundColor: getStatusColor(server.status)
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div className={`${isExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="name" 
              stroke={isDarkMode ? '#FFFFFF' : '#000000'}
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }}
            />
            <YAxis 
              stroke={isDarkMode ? '#FFFFFF' : '#000000'}
              fontSize={12}
              domain={[90, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#E5E7EB' : '#1F2937'
              }}
              formatter={(value: number) => [
                `${value}%`,
                'Uptime'
              ]}
              labelFormatter={(label) => `Servidor: ${label}`}
            />
            <Bar dataKey="uptime" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ServerHealthChart