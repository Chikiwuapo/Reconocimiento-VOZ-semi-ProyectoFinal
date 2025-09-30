import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Brush
} from 'recharts'
import { Maximize2, Download } from 'lucide-react'
import { useTheme } from '../../../App'

export interface SessionPoint {
  date: string
  sessions: number
  users: number
}

interface SessionHistoryChartProps {
  data: SessionPoint[]
  className?: string
}

const SessionHistoryChart: React.FC<SessionHistoryChartProps> = ({ data, className = '' }) => {
  const { isDarkMode } = useTheme()
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'sessions' | 'users'>('both')
  const [isExpanded, setIsExpanded] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)
  const [selectedRange, setSelectedRange] = useState<{start:number,end:number}|null>(null)

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
      const csvHeader = 'date,sessions,users,efficiency(%)\n'
      const csvRows = (data || [])
        .map(d => `${d.date},${d.sessions},${d.users},${((d.sessions / Math.max(d.users, 1)) * 100).toFixed(1)}`)
        .join('\n')
      downloadFile('session_history.csv', csvHeader + csvRows, 'text/csv')

      const payload = { exportedAt: new Date().toISOString(), data }
      downloadFile('session_history.json', JSON.stringify(payload, null, 2), 'application/json')
    } catch {
      // no-op
    }
  }

  const chartData = useMemo(() => {
    return (data || []).map(item => ({
      date: new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      sessions: item.sessions,
      users: item.users,
      fullDate: item.date,
      efficiency: Number(((item.sessions / Math.max(item.users, 1)) * 100).toFixed(1))
    }))
  }, [data])

  const handleBrushChange = (range: any) => {
    if (range && typeof range.startIndex === 'number' && typeof range.endIndex === 'number') {
      setSelectedRange({ start: range.startIndex, end: range.endIndex })
    }
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'} backdrop-blur-sm rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedMetric('both'); setAnimationKey(k => k + 1) }}
            className={`px-3 py-1.5 text-sm rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} transition-colors ${selectedMetric==='both' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700/40 hover:bg-gray-700 text-gray-200' : 'bg-gray-200/60 hover:bg-gray-300 text-gray-700'}`}
          >Ambos</button>
          <button
            onClick={() => { setSelectedMetric('sessions'); setAnimationKey(k => k + 1) }}
            className={`px-3 py-1.5 text-sm rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} transition-colors ${selectedMetric==='sessions' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700/40 hover:bg-gray-700 text-gray-200' : 'bg-gray-200/60 hover:bg-gray-300 text-gray-700'}`}
          >Sesiones</button>
          <button
            onClick={() => { setSelectedMetric('users'); setAnimationKey(k => k + 1) }}
            className={`px-3 py-1.5 text-sm rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} transition-colors ${selectedMetric==='users' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700/40 hover:bg-gray-700 text-gray-200' : 'bg-gray-200/60 hover:bg-gray-300 text-gray-700'}`}
          >Usuarios</button>
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

      {/* Chart */}
      <div className={`p-6 ${isExpanded ? 'h-[500px]' : 'h-[400px]'}`}>
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No hay datos de sesiones para mostrar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={animationKey} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <defs>
                <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke={isDarkMode ? '#FFFFFF' : '#000000'} tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }} angle={-35} textAnchor="end" height={60} />
              <YAxis stroke={isDarkMode ? '#FFFFFF' : '#000000'} tick={{ fill: isDarkMode ? '#FFFFFF' : '#000000' }} />
              <Tooltip contentStyle={{ background: isDarkMode ? '#1F2937' : '#FFFFFF', border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB', color: isDarkMode ? '#E5E7EB' : '#1F2937' }} />
              <Legend />
              {(selectedMetric === 'sessions' || selectedMetric === 'both') && (
                <Area type="monotone" dataKey="sessions" name="Sesiones" stroke="#3B82F6" fill="url(#sessionsGradient)" strokeWidth={2} />
              )}
              {(selectedMetric === 'users' || selectedMetric === 'both') && (
                <Area type="monotone" dataKey="users" name="Usuarios" stroke="#10B981" fill="url(#usersGradient)" strokeWidth={2} />
              )}
              <Brush dataKey="date" height={35} stroke="#3B82F6" fill="rgba(59, 130, 246, 0.1)" onChange={handleBrushChange} startIndex={selectedRange?.start} endIndex={selectedRange?.end} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default SessionHistoryChart
