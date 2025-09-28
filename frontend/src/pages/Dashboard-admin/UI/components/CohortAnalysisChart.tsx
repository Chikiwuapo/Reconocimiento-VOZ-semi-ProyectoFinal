import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download, Maximize2, Users, TrendingUp, Calendar } from 'lucide-react'

interface CohortData {
  month: string
  cohort1: number
  cohort2: number
  cohort3: number
  cohort4: number
  cohort5: number
  cohort6: number
}

interface CohortAnalysisChartProps {
  data: CohortData[]
  isDarkMode?: boolean
}

const CohortAnalysisChart: React.FC<CohortAnalysisChartProps> = ({ data, isDarkMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>(['cohort1', 'cohort2', 'cohort3'])

  const cohortColors = {
    cohort1: '#3B82F6',
    cohort2: '#10B981',
    cohort3: '#F59E0B',
    cohort4: '#EF4444',
    cohort5: '#8B5CF6',
    cohort6: '#EC4899'
  }

  const cohortLabels = {
    cohort1: 'Enero 2024',
    cohort2: 'Febrero 2024',
    cohort3: 'Marzo 2024',
    cohort4: 'Abril 2024',
    cohort5: 'Mayo 2024',
    cohort6: 'Junio 2024'
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Mes', ...Object.values(cohortLabels)],
      ...data.map(item => [
        item.month,
        item.cohort1,
        item.cohort2,
        item.cohort3,
        item.cohort4,
        item.cohort5,
        item.cohort6
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cohort-analysis-data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleCohort = (cohort: string) => {
    setSelectedCohorts(prev => 
      prev.includes(cohort) 
        ? prev.filter(c => c !== cohort)
        : [...prev, cohort]
    )
  }

  const averageRetention = data.length > 0 
    ? (data.reduce((sum, item) => sum + item.cohort1 + item.cohort2 + item.cohort3, 0) / (data.length * 3)).toFixed(1)
    : '0'

  const bestPerformingCohort = Object.entries(cohortLabels).reduce((best, [key, label]) => {
    const avg = data.reduce((sum, item) => sum + (item as any)[key], 0) / data.length
    return avg > best.avg ? { cohort: label, avg } : best
  }, { cohort: '', avg: 0 })

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Análisis de Cohortes
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Retención promedio: {averageRetention}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Mejor cohorte: {bestPerformingCohort.cohort}
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

      {/* Selector de cohortes */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Seleccionar cohortes:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(cohortLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleCohort(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCohorts.includes(key)
                  ? 'text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedCohorts.includes(key) ? cohortColors[key as keyof typeof cohortColors] : undefined
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className={`${isExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="month" 
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              fontSize={12}
            />
            <YAxis 
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#E5E7EB' : '#1F2937'
              }}
              formatter={(value: number, name: string) => [
                `${value}%`,
                cohortLabels[name as keyof typeof cohortLabels]
              ]}
            />
            <Legend 
              formatter={(value) => cohortLabels[value as keyof typeof cohortLabels]}
            />
            {selectedCohorts.map((cohort) => (
              <Line
                key={cohort}
                type="monotone"
                dataKey={cohort}
                stroke={cohortColors[cohort as keyof typeof cohortColors]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Métricas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Retención Mes 1
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.length > 0 ? (data[data.length - 1].cohort1).toFixed(1) : '0'}%
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Retención Mes 3
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.length > 0 ? (data[data.length - 1].cohort3).toFixed(1) : '0'}%
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Retención Mes 6
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.length > 0 ? (data[data.length - 1].cohort6).toFixed(1) : '0'}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default CohortAnalysisChart