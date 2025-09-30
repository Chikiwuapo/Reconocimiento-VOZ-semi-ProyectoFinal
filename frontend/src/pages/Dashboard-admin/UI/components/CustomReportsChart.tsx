import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { Download, Maximize2, FileText, TrendingUp, Users, DollarSign } from 'lucide-react'

interface ReportData {
  name: string
  value: number
  category: string
  trend: number
}

interface CustomReportsChartProps {
  data: ReportData[]
  isDarkMode?: boolean
}

const CustomReportsChart: React.FC<CustomReportsChartProps> = ({ data, isDarkMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  const categories = ['all', ...Array.from(new Set(data.map(item => item.category)))]
  
  const filteredData = selectedCategory === 'all' 
    ? data 
    : data.filter(item => item.category === selectedCategory)

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

  const exportToCSV = () => {
    const csvContent = [
      ['Nombre', 'Valor', 'Categoría', 'Tendencia (%)'],
      ...filteredData.map(item => [
        item.name,
        item.value,
        item.category,
        item.trend
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `custom-report-${selectedCategory}-${dateRange}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = () => {
    // Simulación de exportación a PDF
    alert('Exportando reporte a PDF... (Funcionalidad simulada)')
  }

  const scheduleReport = () => {
    // Simulación de programación de reporte
    alert('Reporte programado exitosamente para envío semanal')
  }

  const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0)
  const avgTrend = filteredData.length > 0 
    ? (filteredData.reduce((sum, item) => sum + item.trend, 0) / filteredData.length).toFixed(1)
    : '0'
  const topPerformer = filteredData.reduce((max, item) => 
    item.value > max.value ? item : max, filteredData[0] || { name: 'N/A', value: 0 }
  )

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <PieChart data={filteredData}>
            <Pie
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {filteredData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#E5E7EB' : '#1F2937'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                color: isDarkMode ? '#E5E7EB' : '#374151'
              }}
              formatter={(value) => (
                <span style={{ color: isDarkMode ? '#E5E7EB' : '#374151' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        )
      case 'line':
        return (
          <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )
      default:
        return (
          <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {filteredData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        )
    }
  }

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Reportes Personalizados
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {filteredData.length} elementos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Tendencia: {avgTrend}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={scheduleReport}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Programar
          </button>
          <button
            onClick={exportToPDF}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Exportar a PDF"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Exportar a CSV"
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

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Tipo de Gráfico
          </label>
          <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            {[
              { key: 'bar', label: 'Barras' },
              { key: 'pie', label: 'Circular' },
              { key: 'line', label: 'Líneas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setChartType(key as any)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === key
                    ? 'bg-blue-500 text-white'
                    : isDarkMode ? 'text-blue-200 hover:text-white hover:bg-blue-600/50' : 'text-blue-700 hover:text-blue-900 hover:bg-blue-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas las categorías' : category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Período
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* Métricas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Valor Total
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalValue.toLocaleString()}
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tendencia Promedio
            </span>
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {avgTrend}%
          </span>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Top Performer
            </span>
          </div>
          <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {topPerformer.name}
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className={`${isExpanded ? 'h-96' : 'h-64'} transition-all duration-300`}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Tabla de datos */}
      <div className="mt-6">
        <h4 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Datos Detallados
        </h4>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="text-left py-2 px-4 font-medium">Nombre</th>
                <th className="text-left py-2 px-4 font-medium">Valor</th>
                <th className="text-left py-2 px-4 font-medium">Categoría</th>
                <th className="text-left py-2 px-4 font-medium">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr 
                  key={index}
                  className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4 font-medium">{item.value.toLocaleString()}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <div className={`flex items-center gap-1 ${
                      item.trend > 0 ? 'text-green-500' : item.trend < 0 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      <TrendingUp className={`w-3 h-3 ${item.trend < 0 ? 'rotate-180' : ''}`} />
                      {Math.abs(item.trend)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CustomReportsChart