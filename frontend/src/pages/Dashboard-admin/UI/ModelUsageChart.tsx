import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Maximize2, Download } from 'lucide-react'
import { useTheme } from '../../../App'
import type { ModelUsage } from '../../../types/dashboard.ts'

interface ModelUsageChartProps {
  data: ModelUsage[];
  className?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']

const ModelUsageChart: React.FC<ModelUsageChartProps> = ({ data, className = '' }) => {
  const { isDarkMode } = useTheme()
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')
  const [selectedModel, setSelectedModel] = useState<ModelUsage | null>(null)
  // eliminado hoveredSegment para evitar warning de no uso
  const [isExpanded, setIsExpanded] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

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
      const csvHeader = 'name,percentage,usageCount\n'
      const csvRows = (data || [])
        .map(d => `${d.name},${d.percentage},${d.usageCount}`)
        .join('\n')
      downloadFile('model_usage.csv', csvHeader + csvRows, 'text/csv')

      const payload = { exportedAt: new Date().toISOString(), data }
      downloadFile('model_usage.json', JSON.stringify(payload, null, 2), 'application/json')
    } catch {
      // no-op
    }
  }

  const chartData = useMemo(() => data || [], [data])

  // handlers de hover removidos por no uso visual
  const onPieEnter = (_: any, _index: number) => {}
  const onPieLeave = () => {}

  const handleSliceClick = (_: any, index: number) => {
    const model = chartData[index]
    if (model) setSelectedModel(model)
  }

  const toggleChart = () => {
    setIsTransitioning(true)
    setChartType(prev => (prev === 'pie' ? 'bar' : 'pie'))
    setAnimationKey(k => k + 1)
    setTimeout(() => setIsTransitioning(false), 250)
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'} backdrop-blur-sm rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} ${className}`}>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleChart}
            className={`px-3 py-1.5 text-sm rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} transition-colors ${chartType === 'pie' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700/40 hover:bg-gray-700 text-gray-200' : 'bg-gray-200/60 hover:bg-gray-300 text-gray-700'}`}
          >
            {chartType === 'pie' ? 'Barras' : 'Circular'}
          </button>
          <span className="text-green-400 text-xs">En tiempo real</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300' : 'bg-gray-200/50 hover:bg-gray-200 text-gray-600'} transition-colors`}
          >
            <Maximize2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300' : 'bg-gray-200/50 hover:bg-gray-200 text-gray-600'} transition-colors`}
          >
            <Download className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Contenido */}
      <div className={`p-6 ${isExpanded ? 'h-[500px]' : 'h-[400px]'}`}>
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No hay datos de modelos para mostrar.
          </div>
        ) : chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={animationKey} data={chartData}>
              <Tooltip formatter={(value: any, name: any) => [value + '%', name]} contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB', color: isDarkMode ? '#E5E7EB' : '#1F2937' }} />
              <Legend />
              <Pie
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={handleSliceClick}
                isAnimationActive={!isTransitioning}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke={isDarkMode ? "#FFFFFF" : "#000000"} tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }} />
              <YAxis stroke={isDarkMode ? "#FFFFFF" : "#000000"} tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }} />
              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB', color: isDarkMode ? '#E5E7EB' : '#1F2937' }} />
              <Legend />
              <Bar dataKey="percentage" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detalles del modelo seleccionado */}
      {selectedModel && (
        <div className="p-4 border-t border-gray-700 text-gray-300 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{selectedModel.name}</div>
              <div className="text-gray-400">Uso: {selectedModel.percentage}% ({selectedModel.usageCount} usos)</div>
            </div>
            <button
              onClick={() => setSelectedModel(null)}
              className="px-3 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelUsageChart
