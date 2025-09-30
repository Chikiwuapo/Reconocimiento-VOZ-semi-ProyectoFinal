import React, { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Download, Maximize2, Users, TrendingUp } from 'lucide-react'

interface UserSegment {
  name: string
  value: number
  growth: number
  color: string
  description: string
}

interface UserSegmentChartProps {
  data: UserSegment[]
  isDarkMode?: boolean
}

const UserSegmentChart: React.FC<UserSegmentChartProps> = ({ data, isDarkMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie')

  const exportToCSV = () => {
    const csvContent = [
      ['Segmento', 'Usuarios', 'Crecimiento (%)', 'Descripción'],
      ...data.map(item => [
        item.name,
        item.value.toString(),
        item.growth.toString(),
        item.description
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user-segments-data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalUsers = data.reduce((sum, segment) => sum + segment.value, 0)
  const fastestGrowingSegment = data.reduce((max, segment) => 
    segment.growth > max.growth ? segment : max
  )

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for segments less than 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Segmentación de Usuarios
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total: {totalUsers.toLocaleString()} usuarios
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Mayor crecimiento: {fastestGrowingSegment.name}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <button
              onClick={() => setViewType('pie')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewType === 'pie'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-blue-200 hover:text-white hover:bg-blue-600/50' : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100'
              }`}
            >
              Circular
            </button>
            <button
              onClick={() => setViewType('bar')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewType === 'bar'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode ? 'text-blue-200 hover:text-white hover:bg-blue-600/50' : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100'
              }`}
            >
              Barras
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico */}
        <div className={`${isExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'pie' ? (
              <PieChart data={data}>
                <Pie
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#E5E7EB' : '#1F2937'
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} usuarios (${((value / totalUsers) * 100).toFixed(1)}%)`,
                    'Usuarios'
                  ]}
                />
                <Legend />
              </PieChart>
            ) : (
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
                  tickFormatter={(value) => value.toLocaleString()}
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
                    `${value.toLocaleString()} usuarios`,
                    'Usuarios'
                  ]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Lista de segmentos */}
        <div className="space-y-3">
          {data.map((segment) => (
            <div 
              key={segment.name}
              className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {segment.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {segment.value.toLocaleString()}
                  </span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    segment.growth > 0 
                      ? 'bg-green-100 text-green-800' 
                      : segment.growth < 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${segment.growth < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(segment.growth)}%
                  </div>
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {segment.description}
              </p>
              <div className="mt-2">
                <div className={`w-full bg-gray-300 rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(segment.value / totalUsers) * 100}%`,
                      backgroundColor: segment.color
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {((segment.value / totalUsers) * 100).toFixed(1)}% del total
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserSegmentChart