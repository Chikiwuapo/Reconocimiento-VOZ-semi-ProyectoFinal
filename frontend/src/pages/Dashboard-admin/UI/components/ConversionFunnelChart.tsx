import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, Maximize2, TrendingDown } from 'lucide-react'

interface ConversionData {
  stage: string
  users: number
  percentage: number
}

interface ConversionFunnelChartProps {
  data: ConversionData[]
  isDarkMode?: boolean
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ data, isDarkMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Función para redondear números decimales a 2 decimales
  const roundToTwoDecimals = (num: number): number => {
    return Math.round(num * 100) / 100
  }

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const exportToCSV = () => {
    const csvContent = [
      ['Etapa', 'Usuarios', 'Porcentaje'],
      ...data.map(item => [
        item.stage,
        item.users.toString(),
        item.percentage.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'conversion-funnel-data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const conversionRate = data.length > 1 
    ? ((data[data.length - 1].users / data[0].users) * 100).toFixed(1)
    : '0'

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Embudo de Conversión
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <TrendingDown className="w-4 h-4 text-orange-500" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>
              Tasa de conversión: {conversionRate}%
            </span>
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

      {/* Vista de embudo visual */}
      <div className="mb-6">
        <div className="space-y-2">
          {data.map((item, index) => {
            const width = (item.users / data[0].users) * 100
            const dropoff = index > 0 ? data[index - 1].users - item.users : 0
            
            return (
              <div key={item.stage} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-black'}`}>
                      {item.users.toLocaleString()}
                    </span>
                    {dropoff > 0 && (
                      <span className="text-xs text-red-500">
                        (-{dropoff.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
                <div className={`h-8 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} relative overflow-hidden`}>
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {roundToTwoDecimals(item.percentage)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className={`${isExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="stage" 
              stroke={isDarkMode ? "#FFFFFF" : "#000000"}
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }}
            />
            <YAxis 
              stroke={isDarkMode ? "#FFFFFF" : "#000000"}
              fontSize={12}
              tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#E5E7EB' : '#1F2937'
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} usuarios`,
                'Usuarios'
              ]}
              labelFormatter={(label) => `Etapa: ${label}`}
            />
            <Bar dataKey="users" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ConversionFunnelChart