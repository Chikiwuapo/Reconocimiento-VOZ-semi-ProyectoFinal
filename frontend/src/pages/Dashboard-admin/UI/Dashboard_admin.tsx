import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu,
  Download,
  RefreshCw,
  Gauge,
  LineChart,
  Activity,
  BarChart2,
  Users,
  Eye,
  Brain,
  Target,
  BookOpen,
  TrendingUp,
  Filter,
  Calendar,
  ArrowLeft,
  FileText,
  Clock,
  Repeat,
  Database,
  Zap,
  AlertTriangle,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react'

import Sidebar from '../../../components/Sidebar/Sidebar.tsx'
import { useTheme } from '../../../App'
import { useMockData } from '../service/mockDataService.ts'
import MetricCard from './components/MetricCard.tsx'
import ModelUsageChart from './ModelUsageChart.tsx'
import SessionHistoryChart from './SessionHistoryChart.tsx'
import SystemMetricsChart from './SystemMetricsChart.tsx'

// Nuevos componentes de gráficos
import RevenueChart from './components/RevenueChart.tsx'
import UserActivityChart from './components/UserActivityChart.tsx'
import ConversionFunnelChart from './components/ConversionFunnelChart.tsx'
import ServerHealthChart from './components/ServerHealthChart.tsx'
import CohortAnalysisChart from './components/CohortAnalysisChart.tsx'
import UserSegmentChart from './components/UserSegmentChart.tsx'
import ApiMetricsChart from './components/ApiMetricsChart.tsx'
import DatabaseMetricsChart from './components/DatabaseMetricsChart.tsx'
import CustomReportsChart from './components/CustomReportsChart.tsx'

// Función para generar números aleatorios
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min

type DashboardView = 'overview' | 'analytics' | 'performance' | 'reports'

const Dashboard_admin: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [activeView, setActiveView] = useState<DashboardView>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dateRange] = useState<'7D' | '30D' | '90D' | 'YTD'>('30D')
  const [search] = useState('')

  const mockDataService = useMockData()
  const [data, setData] = useState(() => mockDataService.getDashboardData())

  const navigationItems = [
    { id: 'overview', label: 'Resumen General', icon: Gauge },
    { id: 'analytics', label: 'Análisis Avanzado', icon: LineChart },
    { id: 'performance', label: 'Rendimiento', icon: Activity },
    { id: 'reports', label: 'Reportes', icon: BarChart2 }
  ] as const

  const exportingPayload = useMemo(() => ({
    exportedAt: new Date().toISOString(),
    view: activeView,
    dateRange,
    search,
    data
  }), [activeView, dateRange, search, data])

  const downloadFile = (filename: string, content: string, mime = 'application/json') => {
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
    downloadFile('dashboard_export.json', JSON.stringify(exportingPayload, null, 2))
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simular actualización de datos
    await new Promise(r => setTimeout(r, 1000))
    
    // Regenerar datos simulados usando el servicio mock
    const newData = mockDataService.getDashboardData()
    setData(newData)
    
    setIsRefreshing(false)
  }

  // Estados para la vista de reportes
  const [reportPeriod, setReportPeriod] = useState('7days')
  const [reportFormat, setReportFormat] = useState('JSON')
  const [reportType, setReportType] = useState('complete')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isSchedulingReport, setIsSchedulingReport] = useState(false)

  // Función para generar reportes
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    
    try {
      // Simular generación de reporte
      await new Promise(r => setTimeout(r, 2000))
      
      const reportData = {
        period: reportPeriod,
        format: reportFormat,
        type: reportType,
        generatedAt: new Date().toISOString(),
        data: reportType === 'complete' ? data : 
              reportType === 'metrics' ? { metrics } :
              reportType === 'charts' ? { charts: data } :
              data // personalizado
      }

      let fileName = `report_${reportPeriod}_${new Date().toISOString().split('T')[0]}`
      let content = ''

      switch (reportFormat) {
        case 'JSON':
          fileName += '.json'
          content = JSON.stringify(reportData, null, 2)
          break
        case 'CSV':
          fileName += '.csv'
          content = convertToCSV(reportData)
          break
        case 'PDF':
          fileName += '.pdf'
          // Simular generación de PDF
          content = 'PDF content would be generated here'
          alert('Funcionalidad de PDF en desarrollo. Se ha generado un archivo de ejemplo.')
          break
        case 'Excel':
          fileName += '.xlsx'
          content = 'Excel content would be generated here'
          alert('Funcionalidad de Excel en desarrollo. Se ha generado un archivo de ejemplo.')
          break
      }

      if (reportFormat === 'JSON' || reportFormat === 'CSV') {
        downloadFile(fileName, content)
      }

    } catch (error) {
      console.error('Error generando reporte:', error)
      alert('Error al generar el reporte')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Función para programar reportes
  const handleScheduleReport = async () => {
    setIsSchedulingReport(true)
    
    try {
      // Simular programación de reporte
      await new Promise(r => setTimeout(r, 1500))
      
      alert(`Reporte programado exitosamente:\nPeríodo: ${reportPeriod}\nFormato: ${reportFormat}\nTipo: ${reportType}`)
      
    } catch (error) {
      console.error('Error programando reporte:', error)
      alert('Error al programar el reporte')
    } finally {
      setIsSchedulingReport(false)
    }
  }

  // Función para convertir datos a CSV
  const convertToCSV = (_data: any) => {
    const headers = ['Métrica', 'Valor', 'Tendencia', 'Descripción']
    const rows = [
      ['Conversiones', metrics.conversions.value, metrics.conversions.trend.toString(), metrics.conversions.subtitle],
      ['Retención', metrics.retention.value, metrics.retention.trend.toString(), metrics.retention.subtitle],
      ['Satisfacción', metrics.satisfaction.value, metrics.satisfaction.trend.toString(), metrics.satisfaction.subtitle],
      ['Engagement', metrics.engagement.value, metrics.engagement.trend.toString(), metrics.engagement.subtitle]
    ]
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  // Función para descargar archivos del historial
  const handleDownloadHistoryFile = (fileName: string) => {
    // Simular descarga de archivo del historial
    const mockContent = `Contenido simulado del archivo: ${fileName}`
    downloadFile(fileName, mockContent)
  }

  // Métricas principales calculadas
  const metrics = useMemo(() => {
    // Calculamos métricas básicas usando datos dinámicos
    return {
      conversions: {
        value: `${data.additionalMetrics.conversion.toFixed(1)}%`,
        trend: randomFloat(1, 5),
        subtitle: 'Tasa de conversión general'
      },
      retention: {
        value: `${data.additionalMetrics.retention.toFixed(1)}%`, 
        trend: randomFloat(-1, 2),
        subtitle: 'Retención de usuarios'
      },
      satisfaction: {
        value: `${(data.additionalMetrics.successRate / 20).toFixed(1)}/5`,
        trend: randomFloat(0.1, 0.8),
        subtitle: 'Satisfacción promedio'
      },
      engagement: {
        value: `${data.additionalMetrics.engagement.toFixed(1)}%`,
        trend: randomFloat(2, 6),
        subtitle: 'Engagement de usuarios'
      }
    }
  }, [data])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-background text-primary' : 'bg-gray-50 text-gray-900'}`} data-theme={isDarkMode ? 'dark' : 'light'}>
      {/* Sidebar Desktop */}
      <Sidebar 
        activeView={activeView}
        setActiveView={(v: string) => setActiveView(v as DashboardView)}
        isDarkMode={isDarkMode}
      />

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 h-full w-80 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>VoiceRecognition AI</h2>
                <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`} onClick={() => setIsMobileMenuOpen(false)}>×</button>
              </div>
              <div className="p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  return (
                    <button key={item.id} onClick={() => { setActiveView(item.id as DashboardView); setIsMobileMenuOpen(false) }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${isActive ? 'bg-blue-500 text-white' : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="ml-0 lg:ml-80 transition-all duration-300">
        {/* Sticky toolbar */}
        <div className={`sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-surface/40 transition-colors duration-300 ${
          isDarkMode ? 'bg-surface/60 border-theme' : 'bg-white/70 border-gray-200'
        } border-b`}> 
          {isRefreshing && <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 animate-pulse" />}
          <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className={`lg:hidden p-2 rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'border-theme bg-surface text-secondary hover:text-accent' : 'border-gray-300 bg-white text-gray-600 hover:text-blue-600'
              }`}>
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-primary">
                  {activeView === 'overview' && 'Análisis Avanzado'}
                  {activeView === 'analytics' && 'Análisis Avanzado'}
                  {activeView === 'performance' && 'Rendimiento del Sistema'}
                  {activeView === 'reports' && 'Reportes y Exportaciones'}
                </h1>
                <p className="text-secondary text-xs lg:text-sm">
                  {activeView === 'overview' && 'Métricas detalladas y tendencias de uso'}
                  {activeView === 'analytics' && 'Métricas detalladas y tendencias de uso'}
                  {activeView === 'performance' && 'Monitoreo en tiempo real de recursos'}
                  {activeView === 'reports' && 'Generación y exportación de informes'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{scale:1.02}} 
                whileTap={{scale:0.98}} 
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/50 text-yellow-400 hover:bg-gray-600' 
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>
              <button className={`p-2 rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'border-theme bg-surface text-secondary hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}>
                <Filter className="w-4 h-4" />
              </button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleExport} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4"/> Exportar
              </motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleRefresh} className={`px-3 py-1.5 rounded-lg border transition-colors duration-200 ${
                isDarkMode ? 'border-theme bg-surface text-secondary hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}>
                <RefreshCw className="w-4 h-4 inline mr-1"/> Actualizar
              </motion.button>
            </div>
          </div>
        </div>

        {/* Views */}
        <div className="p-4 lg:p-8 space-y-8">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Conversiones"
                  value={metrics.conversions.value}
                  subtitle={metrics.conversions.subtitle}
                  icon={<Target className="w-6 h-6" />}
                  trend={metrics.conversions.trend}
                  trendLabel="vs mes anterior"
                  color="blue"
                  isDarkMode={isDarkMode}
                  status="success"
                />
                <MetricCard
                  title="Retención"
                  value={metrics.retention.value}
                  subtitle={metrics.retention.subtitle}
                  icon={<Users className="w-6 h-6" />}
                  trend={metrics.retention.trend}
                  trendLabel="usuarios activos"
                  color="green"
                  isDarkMode={isDarkMode}
                  status="warning"
                />
                <MetricCard
                  title="Satisfacción"
                  value={metrics.satisfaction.value}
                  subtitle={metrics.satisfaction.subtitle}
                  icon={<TrendingUp className="w-6 h-6" />}
                  trend={metrics.satisfaction.trend}
                  trendLabel="rating promedio"
                  color="orange"
                  isDarkMode={isDarkMode}
                  status="success"
                />
                <MetricCard
                  title="Engagement"
                  value={metrics.engagement.value}
                  subtitle={metrics.engagement.subtitle}
                  icon={<Activity className="w-6 h-6" />}
                  trend={metrics.engagement.trend}
                  trendLabel="interacción alta"
                  color="purple"
                  isDarkMode={isDarkMode}
                  status="success"
                />
              </div>

              {/* Gráficos principales */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border transition-colors duration-300 ${
                  isDarkMode ? 'border-theme bg-surface' : 'border-gray-200 bg-white/50'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-primary' : 'text-gray-900'}`}>Tendencias de Sesiones</h3>
                    <div className="flex items-center gap-2">
                      <button className={`p-1 rounded transition-colors duration-200 ${
                        isDarkMode ? 'text-secondary hover:text-primary' : 'text-gray-400 hover:text-gray-600'
                      }`}>
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-secondary' : 'text-gray-500'}`}>Análisis temporal detallado</p>
                  <SessionHistoryChart data={data.dailySessionHistory} />
                </div>
                <div className={`p-6 rounded-xl border transition-colors duration-300 ${
                  isDarkMode ? 'border-theme bg-surface' : 'border-gray-200 bg-white/50'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-primary' : 'text-gray-900'}`}>Distribución de Modelos</h3>
                    <div className="flex items-center gap-2">
                      <button className={`p-1 rounded transition-colors duration-200 ${
                        isDarkMode ? 'text-secondary hover:text-primary' : 'text-gray-400 hover:text-gray-600'
                      }`}>
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-secondary' : 'text-gray-500'}`}>Uso por tipo de modelo</p>
                  <ModelUsageChart data={data.modelUsage} />
                </div>
              </div>

              {/* Nuevos gráficos para Overview */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <RevenueChart data={data.revenueData} isDarkMode={isDarkMode} />
                <UserActivityChart data={data.userActivity} isDarkMode={isDarkMode} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ConversionFunnelChart data={data.conversionFunnel} isDarkMode={isDarkMode} />
                <ServerHealthChart data={data.serverHealth} isDarkMode={isDarkMode} />
              </div>

              {/* Tabla de análisis de modelos */}
              <div className={`p-6 rounded-xl border transition-colors duration-300 ${
                isDarkMode ? 'border-theme bg-surface' : 'border-gray-200 bg-white/50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-primary' : 'text-gray-900'}`}>Análisis Detallado de Modelos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-theme' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-secondary' : 'text-gray-600'}`}>Modelo</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-secondary' : 'text-gray-600'}`}>Uso</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-secondary' : 'text-gray-600'}`}>Precisión</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-secondary' : 'text-gray-600'}`}>Tendencia</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-secondary' : 'text-gray-600'}`}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`border-b ${isDarkMode ? 'border-theme' : 'border-gray-200'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Voz</span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>42%</td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>94.2%</td>
                        <td className="py-3 px-4">
                          <span className="text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +2.1%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Activo</span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className={`${isDarkMode ? 'text-white' : 'text-black'} font-medium`}>Facial</span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>23%</td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>91.8%</td>
                        <td className="py-3 px-4">
                          <span className="text-red-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 rotate-180" />
                            -0.5%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Mantenimiento</span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className={`${isDarkMode ? 'text-white' : 'text-black'} font-medium`}>Gestos</span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>35%</td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>87.3%</td>
                        <td className="py-3 px-4">
                          <span className="text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +1.2%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">Activo</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className={`${isDarkMode ? 'text-white' : 'text-black'} font-medium`}>Híbrido</span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>15%</td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>89.7%</td>
                        <td className="py-3 px-4">
                          <span className="text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +3.8%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">Beta</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Métricas adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Visitas Totales"
                  value={data.kpis.totalVisits.toLocaleString()}
                  subtitle="Visitas a la página"
                  icon={<Eye className="w-6 h-6" />}
                  trend={12.5}
                  trendLabel="vs mes anterior"
                  color="blue"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Usuarios Registrados"
                  value={data.kpis.totalUsers.toLocaleString()}
                  subtitle="Usuarios logueados"
                  icon={<Users className="w-6 h-6" />}
                  trend={8.3}
                  trendLabel="nuevos usuarios"
                  color="green"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Entrenamientos"
                  value={data.kpis.totalTrainings.toLocaleString()}
                  subtitle="Pruebas realizadas"
                  icon={<Brain className="w-6 h-6" />}
                  trend={15.7}
                  trendLabel="incremento semanal"
                  color="purple"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Visualizaciones"
                  value={data.kpis.totalCourseViews.toLocaleString()}
                  subtitle="Visualizaciones de cursos"
                  icon={<BookOpen className="w-6 h-6" />}
                  trend={22.1}
                  trendLabel="engagement alto"
                  color="orange"
                  isDarkMode={isDarkMode}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="Modelos Activos"
                  value={data.additionalMetrics.activeModels.toString()}
                  subtitle="Uso de modelos"
                  icon={<Target className="w-6 h-6" />}
                  trend={randomFloat(3, 8)}
                  trendLabel="nuevos modelos"
                  color="indigo"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Tasa de Éxito"
                  value={`${data.additionalMetrics.successRate.toFixed(1)}%`}
                  subtitle="Precisión general"
                  icon={<TrendingUp className="w-6 h-6" />}
                  trend={randomFloat(1, 5)}
                  trendLabel="mejora continua"
                  color="emerald"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Tiempo Promedio"
                  value={`${data.additionalMetrics.avgResponseTime.toFixed(1)}s`}
                  subtitle="Respuesta del sistema"
                  icon={<Activity className="w-6 h-6" />}
                  trend={randomFloat(-15, -5)}
                  trendLabel="optimización"
                  color="cyan"
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Crecimiento"
                  value={`+${data.additionalMetrics.userGrowth.toFixed(1)}%`}
                  subtitle="Usuarios nuevos"
                  icon={<TrendingUp className="w-6 h-6" />}
                  trend={data.additionalMetrics.userGrowth}
                  trendLabel="vs mes anterior"
                  color="green"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Retención"
                  value={`${data.additionalMetrics.retention.toFixed(1)}%`}
                  subtitle="Usuarios activos"
                  icon={<Users className="w-6 h-6" />}
                  trend={randomFloat(3, 8)}
                  trendLabel="retención mensual"
                  color="blue"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Conversión"
                  value={`${data.additionalMetrics.conversion.toFixed(1)}%`}
                  subtitle="Tasa de conversión"
                  icon={<Target className="w-6 h-6" />}
                  trend={randomFloat(-3, 5)}
                  trendLabel="optimización"
                  color="orange"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Engagement"
                  value={`${data.additionalMetrics.engagement.toFixed(1)}min`}
                  subtitle="Tiempo promedio"
                  icon={<Activity className="w-6 h-6" />}
                  trend={randomFloat(5, 15)}
                  trendLabel="sesión activa"
                  color="purple"
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Gráficos de análisis avanzado */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CohortAnalysisChart data={data.cohortAnalysis} isDarkMode={isDarkMode} />
                <UserSegmentChart data={data.userSegments} isDarkMode={isDarkMode} />
              </div>

              {/* Métricas adicionales de Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Tasa de Rebote"
                  value={`${data.analyticsMetrics.bounceRate.toFixed(1)}%`}
                  subtitle="Usuarios que salen"
                  icon={<ArrowLeft className="w-6 h-6" />}
                  trend={randomFloat(-8, -2)}
                  trendLabel="mejora continua"
                  color="red"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Páginas por Sesión"
                  value={data.analyticsMetrics.pagesPerSession.toFixed(1)}
                  subtitle="Navegación promedio"
                  icon={<FileText className="w-6 h-6" />}
                  trend={randomFloat(8, 18)}
                  trendLabel="engagement alto"
                  color="indigo"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Duración Sesión"
                  value={data.analyticsMetrics.sessionDuration}
                  subtitle="Tiempo promedio"
                  icon={<Clock className="w-6 h-6" />}
                  trend={randomFloat(5, 15)}
                  trendLabel="incremento"
                  color="teal"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Usuarios Recurrentes"
                  value={`${data.analyticsMetrics.returningUsers.toFixed(1)}%`}
                  subtitle="Fidelización"
                  icon={<Repeat className="w-6 h-6" />}
                  trend={randomFloat(10, 20)}
                  trendLabel="lealtad alta"
                  color="emerald"
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Análisis de comportamiento */}
              <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-6`}>Análisis de Comportamiento de Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className={`font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-2`}>Usuarios Nuevos</h4>
                    <p className="text-2xl font-bold text-blue-400 mb-1">2,847</p>
                    <p className="text-sm text-gray-400">+18.2% este mes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Repeat className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className={`font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-2`}>Usuarios Recurrentes</h4>
                    <p className="text-2xl font-bold text-green-400 mb-1">5,923</p>
                    <p className="text-sm text-gray-400">+12.7% este mes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-8 h-8 text-purple-400" />
                    </div>
                    <h4 className={`font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-2`}>Conversiones</h4>
                    <p className="text-2xl font-bold text-purple-400 mb-1">1,234</p>
                    <p className="text-sm text-gray-400">+25.3% este mes</p>
                  </div>
                </div>
              </div>

              {/* Gráficos de análisis */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-4`}>Historial de Sesiones</h3>
                  <SessionHistoryChart data={data.dailySessionHistory} />
                </div>
                <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-4`}>Distribución de Modelos</h3>
                  <ModelUsageChart data={data.modelUsage} />
                </div>
              </div>
            </div>
          )}

          {activeView === 'performance' && (
            <div className="space-y-6">
              {/* Métricas de rendimiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="CPU Usage"
                  value={`${data.performanceMetrics.cpuUsage.toFixed(1)}%`}
                  subtitle="Uso del procesador"
                  icon={<Activity className="w-6 h-6" />}
                  trend={randomFloat(-8, -2)}
                  trendLabel="optimización"
                  color="blue"
                  isDarkMode={isDarkMode}
                  status="warning"
                />
                <MetricCard
                  title="Memory"
                  value={`${data.performanceMetrics.memoryUsage.toFixed(1)}GB`}
                  subtitle="Memoria utilizada"
                  icon={<BarChart2 className="w-6 h-6" />}
                  trend={randomFloat(8, 18)}
                  trendLabel="incremento"
                  color="orange"
                  isDarkMode={isDarkMode}
                  status="success"
                />
                <MetricCard
                  title="Response Time"
                  value={`${data.performanceMetrics.responseTime.toFixed(1)}s`}
                  subtitle="Tiempo de respuesta"
                  icon={<RefreshCw className="w-6 h-6" />}
                  trend={randomFloat(-12, -5)}
                  trendLabel="mejora"
                  color="green"
                  isDarkMode={isDarkMode}
                  status="success"
                />
                <MetricCard
                  title="Uptime"
                  value={`${data.performanceMetrics.uptime.toFixed(1)}%`}
                  subtitle="Disponibilidad"
                  icon={<TrendingUp className="w-6 h-6" />}
                  trend={randomFloat(-0.5, 0.5)}
                  trendLabel="estable"
                  color="emerald"
                  isDarkMode={isDarkMode}
                  status="success"
                />
              </div>

              {/* Gráficos de rendimiento */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'}`}>Métricas del Sistema</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded text-gray-400 hover:text-gray-300">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Monitoreo en tiempo real</p>
                  <SystemMetricsChart data={data.systemMetrics} />
                </div>
                <ApiMetricsChart data={data.apiMetrics} isDarkMode={isDarkMode} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <DatabaseMetricsChart data={data.databaseMetrics} isDarkMode={isDarkMode} />
                <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'}`}>Estado del Servidor</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-400">Online</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Salud general del sistema</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-black transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gray-50/10 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Activity className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Servidor Principal</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>99.9% uptime</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Activo</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-black transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gray-50/10 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Database className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Base de Datos</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conexiones: 45/100</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">Estable</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-black transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gray-50/10 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>API Gateway</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latencia: 120ms</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">Advertencia</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas adicionales de Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Requests/min"
                  value={data.additionalMetrics.requestsPerMin.toLocaleString()}
                  subtitle="Solicitudes por minuto"
                  icon={<Zap className="w-6 h-6" />}
                  trend={randomFloat(10, 20)}
                  trendLabel="incremento"
                  color="cyan"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Error Rate"
                  value={`${data.additionalMetrics.errorRate.toFixed(2)}%`}
                  subtitle="Tasa de errores"
                  icon={<AlertTriangle className="w-6 h-6" />}
                  trend={randomFloat(-30, -15)}
                  trendLabel="mejora"
                  color="red"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Cache Hit"
                  value={`${data.additionalMetrics.cacheHit.toFixed(1)}%`}
                  subtitle="Efectividad del cache"
                  icon={<Database className="w-6 h-6" />}
                  trend={randomFloat(1, 5)}
                  trendLabel="optimización"
                  color="purple"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Throughput"
                  value={`${data.additionalMetrics.throughput.toFixed(1)}GB/s`}
                  subtitle="Transferencia de datos"
                  icon={<TrendingUp className="w-6 h-6" />}
                  trend={randomFloat(5, 15)}
                  trendLabel="rendimiento"
                  color="indigo"
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Alertas y logs */}
              <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-4`}>Alertas Recientes</h3>
                <div className="space-y-3">
                  {[
                    { type: 'warning', message: 'CPU usage above 70% for 5 minutes', time: '2 min ago', icon: AlertTriangle },
                    { type: 'info', message: 'Database backup completed successfully', time: '15 min ago', icon: Database },
                    { type: 'success', message: 'API response time improved by 15%', time: '1 hour ago', icon: TrendingUp },
                    { type: 'error', message: 'Failed to connect to external service', time: '2 hours ago', icon: AlertCircle }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-black transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gray-50/10 cursor-pointer">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        alert.type === 'warning' ? 'bg-yellow-500/20' :
                        alert.type === 'error' ? 'bg-red-500/20' :
                        alert.type === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        <alert.icon className={`w-4 h-4 ${
                          alert.type === 'warning' ? 'text-yellow-400' :
                          alert.type === 'error' ? 'text-red-400' :
                          alert.type === 'success' ? 'text-green-400' : 'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{alert.message}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'reports' && (
            <div className="space-y-6">
              {/* Métricas de reportes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Reports"
                  value={data.reportsMetrics.totalReports.toString()}
                  subtitle="Reportes generados"
                  icon={<FileText className="w-6 h-6" />}
                  trend={randomFloat(15, 30)}
                  trendLabel="incremento"
                  color="blue"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Scheduled"
                  value={data.reportsMetrics.scheduledReports.toString()}
                  subtitle="Reportes programados"
                  icon={<Clock className="w-6 h-6" />}
                  trend={randomFloat(5, 15)}
                  trendLabel="nuevos"
                  color="green"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Downloads"
                  value={data.reportsMetrics.totalDownloads.toLocaleString()}
                  subtitle="Descargas totales"
                  icon={<Download className="w-6 h-6" />}
                  trend={randomFloat(10, 25)}
                  trendLabel="incremento"
                  color="purple"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Automation"
                  value={`${data.reportsMetrics.automationRate.toFixed(0)}%`}
                  subtitle="Reportes automatizados"
                  icon={<Repeat className="w-6 h-6" />}
                  trend={randomFloat(8, 18)}
                  trendLabel="eficiencia"
                  color="orange"
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Controles de reportes */}
              <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-4`}>Generación de Reportes</h3>
                <p className="text-sm text-gray-400 mb-6">Utiliza el botón Exportar de la barra superior para descargar el estado del dashboard.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-300 mb-2">Período</label>
                    <select 
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                      className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    >
                      <option value="7days">Últimos 7 días</option>
                      <option value="30days">Últimos 30 días</option>
                      <option value="90days">Últimos 90 días</option>
                      <option value="year">Año actual</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-300 mb-2">Formato</label>
                    <select 
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value)}
                      className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    >
                      <option value="JSON">JSON</option>
                      <option value="CSV">CSV</option>
                      <option value="PDF">PDF</option>
                      <option value="Excel">Excel</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-300 mb-2">Tipo</label>
                    <select 
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    >
                      <option value="complete">Completo</option>
                      <option value="metrics">Solo métricas</option>
                      <option value="charts">Solo gráficos</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isGeneratingReport ? 'Generando...' : 'Generar Reporte'}
                  </button>
                  <button 
                    onClick={handleScheduleReport}
                    disabled={isSchedulingReport}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {isSchedulingReport ? 'Programando...' : 'Programar'}
                  </button>
                </div>
              </div>

              {/* Gráficos de reportes */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CustomReportsChart data={data.customReports} isDarkMode={isDarkMode} />
                <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-4`}>Historial de Exportaciones</h3>
                  <div className="space-y-3">
                    {data.exportHistory.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-black transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-black/5 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Download className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{file.name}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{file.date} • {file.size}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDownloadHistoryFile(file.name)}
                          className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vista previa de reportes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-4`}>Vista Previa - Uso de Modelos</h3>
                  <ModelUsageChart data={data.modelUsage} />
                </div>
                <div className={`p-6 rounded-xl border ${isDarkMode?'border-gray-700 bg-gray-800/50':'border-gray-200 bg-white/50'}`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode?'text-white':'text-gray-900'} mb-4`}>Vista Previa - Historial de Sesiones</h3>
                  <SessionHistoryChart data={data.dailySessionHistory} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard_admin
