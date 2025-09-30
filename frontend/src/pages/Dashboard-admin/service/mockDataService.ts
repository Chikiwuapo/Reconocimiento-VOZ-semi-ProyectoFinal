import type { ModelUsage, SystemMetrics } from '../../../types/dashboard'

export interface DashboardData {
  dailySessionHistory: { date: string; sessions: number; users: number }[]
  modelUsage: ModelUsage[]
  systemMetrics: SystemMetrics
  // Nuevos datasets
  kpis: {
    totalUsers: number
    totalVisits: number
    totalTrainings: number
    totalCourseViews: number
    activeModels: number
    successRate: number
  }
  userGrowth: { date: string; users: number; active: number }[]
  modelTrainingByModel: { name: string; trainings: number; users: number }[]
  courses: { name: string; views: number; completion: number }[]
  landing: {
    timeline: { date: string; visits: number }[]
    sources: { name: string; value: number }[]
    countries: { name: string; value: number }[]
    devices: { name: string; value: number }[]
  }
  // Nuevos datos para Overview
  revenueData: { date: string; revenue: number; profit: number }[]
  userActivity: { hour: string; active: number; sessions: number }[]
  conversionFunnel: { stage: string; users: number; percentage: number }[]
  topFeatures: { name: string; usage: number; growth: number }[]
  serverHealth: { name: string; status: 'healthy' | 'warning' | 'critical'; uptime: number }[]
  // Nuevos datos para Analytics
  cohortAnalysis: { month: string; cohort1: number; cohort2: number; cohort3: number; cohort4: number; cohort5: number; cohort6: number }[]
  userSegments: { name: string; value: number; growth: number; color: string; description: string }[]
  featureAdoption: { feature: string; adopted: number; total: number; trend: number }[]
  geographicData: { country: string; users: number; revenue: number; growth: number }[]
  // Nuevos datos para Performance
  apiMetrics: { time: string; requests: number; responseTime: number; errors: number; successRate: number }[]
  databaseMetrics: { time: string; connections: number; queries: number; slowQueries: number; cacheHitRate: number; diskUsage: number }[]
  errorLogs: { timestamp: string; level: 'error' | 'warning' | 'info'; message: string; count: number }[]
  // Nuevos datos para Reports
  customReports: { name: string; value: number; category: string; trend: number }[]
  scheduledReports: { name: string; frequency: string; nextRun: string; status: 'active' | 'inactive' }[]
  // Historial de exportaciones dinámico
  exportHistory: { name: string; date: string; size: string }[]
  // Métricas adicionales dinámicas para Analytics
  analyticsMetrics: {
    bounceRate: number
    pagesPerSession: number
    sessionDuration: string
    returningUsers: number
  }
  // Métricas de performance dinámicas
  performanceMetrics: {
    cpuUsage: number
    memoryUsage: number
    responseTime: number
    uptime: number
  }
  // Métricas de reportes dinámicas
  reportsMetrics: {
    totalReports: number
    scheduledReports: number
    totalDownloads: number
    automationRate: number
  }
  // Métricas adicionales dinámicas para diferentes secciones
  additionalMetrics: {
    activeModels: number
    successRate: number
    avgResponseTime: number
    userGrowth: number
    retention: number
    conversion: number
    engagement: number
    requestsPerMin: number
    errorRate: number
    cacheHit: number
    throughput: number
  }
}

export const useMockData = () => {
  // Función para generar números aleatorios con variabilidad
  const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min

  const getDailyHistory = (): DashboardData['dailySessionHistory'] => {
    const arr: DashboardData['dailySessionHistory'] = []
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      arr.push({
        date: d.toISOString().split('T')[0],
        sessions: randomInRange(50, 150),
        users: randomInRange(30, 110)
      })
    }
    return arr
  }

  const getDashboardData = (): DashboardData => ({
    dailySessionHistory: getDailyHistory(),
    modelUsage: [
      { name: 'Reconocimiento Facial', percentage: randomFloat(70, 95), usageCount: randomInRange(800, 1200) },
      { name: 'Reconocimiento de Voz', percentage: randomFloat(60, 85), usageCount: randomInRange(600, 900) },
      { name: 'Análisis de Texto', percentage: randomFloat(50, 75), usageCount: randomInRange(400, 700) },
      { name: 'Detección de Objetos', percentage: randomFloat(40, 70), usageCount: randomInRange(300, 600) },
      { name: 'Procesamiento de Imágenes', percentage: randomFloat(30, 60), usageCount: randomInRange(200, 500) }
    ],
    systemMetrics: {
      cpu: {
        usage: randomFloat(20, 85),
        temperature: randomFloat(35, 75),
        cores: randomInRange(4, 16)
      },
      ram: {
        percentage: randomFloat(30, 90),
        used: randomFloat(4, 12),
        total: 16
      },
      storage: {
        percentage: randomFloat(15, 75),
        used: randomFloat(50, 200),
        total: 500
      },
      network: {
        latency: randomFloat(10, 60),
        downloadSpeed: randomFloat(50, 150),
        uploadSpeed: randomFloat(20, 80)
      }
    },
    kpis: {
      totalUsers: randomInRange(8000, 12000),
      totalVisits: randomInRange(15000, 25000),
      totalTrainings: randomInRange(500, 1500),
      totalCourseViews: randomInRange(2000, 5000),
      activeModels: randomInRange(8, 15),
      successRate: randomFloat(85, 98),
    },
    userGrowth: (() => {
      const arr: { date: string; users: number; active: number }[] = []
      const today = new Date()
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        arr.push({
          date: d.toISOString().split('T')[0],
          users: randomInRange(100, 300),
          active: randomInRange(50, 200)
        })
      }
      return arr
    })(),
    modelTrainingByModel: [
      { name: 'Facial Recognition', trainings: randomInRange(150, 300), users: randomInRange(80, 150) },
      { name: 'Voice Recognition', trainings: randomInRange(120, 250), users: randomInRange(60, 120) },
      { name: 'Text Analysis', trainings: randomInRange(100, 200), users: randomInRange(50, 100) },
      { name: 'Object Detection', trainings: randomInRange(80, 180), users: randomInRange(40, 90) },
      { name: 'Image Processing', trainings: randomInRange(60, 150), users: randomInRange(30, 80) }
    ],
    courses: [
      { name: 'Introducción a IA', views: randomInRange(800, 1500), completion: randomFloat(70, 95) },
      { name: 'Machine Learning Básico', views: randomInRange(600, 1200), completion: randomFloat(65, 90) },
      { name: 'Deep Learning Avanzado', views: randomInRange(400, 800), completion: randomFloat(60, 85) },
      { name: 'Computer Vision', views: randomInRange(300, 700), completion: randomFloat(55, 80) },
      { name: 'NLP Fundamentals', views: randomInRange(250, 600), completion: randomFloat(50, 75) }
    ],
    landing: {
      timeline: (() => {
        const arr: { date: string; visits: number }[] = []
        const today = new Date()
        for (let i = 13; i >= 0; i--) {
          const d = new Date(today)
          d.setDate(today.getDate() - i)
          arr.push({ date: d.toISOString(), visits: 600 + Math.floor(Math.random() * 400) })
        }
        return arr
      })(),
      sources: [
        { name: 'Google', value: 48 },
        { name: 'Redes Sociales', value: 27 },
        { name: 'Acceso Directo', value: 15 },
        { name: 'Referidos', value: 10 },
      ],
      countries: [
        { name: 'Perú', value: 32 },
        { name: 'México', value: 21 },
        { name: 'Colombia', value: 18 },
        { name: 'Argentina', value: 12 },
        { name: 'Chile', value: 9 },
        { name: 'Otros', value: 8 },
      ],
      devices: [
        { name: 'Móvil', value: 62 },
        { name: 'Desktop', value: 34 },
        { name: 'Tablet', value: 4 },
      ],
    },
    // Nuevos datos para Overview
    revenueData: (() => {
      const arr: { date: string; revenue: number; profit: number }[] = []
      const today = new Date()
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const revenue = randomInRange(12000, 25000)
        const profit = Math.round(revenue * randomFloat(0.12, 0.28))
        arr.push({ date: d.toISOString().split('T')[0], revenue, profit })
      }
      return arr
    })(),
    userActivity: [
      { hour: '00:00', active: randomInRange(20, 60), sessions: randomInRange(5, 20) },
      { hour: '02:00', active: randomInRange(15, 40), sessions: randomInRange(3, 15) },
      { hour: '04:00', active: randomInRange(10, 30), sessions: randomInRange(2, 10) },
      { hour: '06:00', active: randomInRange(40, 80), sessions: randomInRange(15, 35) },
      { hour: '08:00', active: randomInRange(120, 200), sessions: randomInRange(60, 120) },
      { hour: '10:00', active: randomInRange(200, 280), sessions: randomInRange(120, 180) },
      { hour: '12:00', active: randomInRange(250, 350), sessions: randomInRange(150, 220) },
      { hour: '14:00', active: randomInRange(280, 380), sessions: randomInRange(180, 250) },
      { hour: '16:00', active: randomInRange(240, 320), sessions: randomInRange(140, 200) },
      { hour: '18:00', active: randomInRange(160, 240), sessions: randomInRange(100, 150) },
      { hour: '20:00', active: randomInRange(120, 180), sessions: randomInRange(70, 110) },
      { hour: '22:00', active: randomInRange(60, 120), sessions: randomInRange(30, 70) },
    ],
    conversionFunnel: [
      { stage: 'Visitantes', users: randomInRange(8000, 15000), percentage: 100 },
      { stage: 'Registro', users: randomInRange(2000, 4000), percentage: randomFloat(20, 35) },
      { stage: 'Activación', users: randomInRange(1500, 3000), percentage: randomFloat(65, 85) },
      { stage: 'Retención', users: randomInRange(1000, 2200), percentage: randomFloat(60, 80) },
      { stage: 'Conversión', users: randomInRange(500, 1200), percentage: randomFloat(45, 65) },
    ],
    topFeatures: [
      { name: 'Reconocimiento Facial', usage: randomInRange(75, 95), growth: randomFloat(5, 20) },
      { name: 'Análisis de Voz', usage: randomInRange(65, 85), growth: randomFloat(3, 15) },
      { name: 'Dashboard Analytics', usage: randomInRange(55, 75), growth: randomFloat(8, 25) },
      { name: 'API Integration', usage: randomInRange(45, 65), growth: randomFloat(15, 30) },
      { name: 'Mobile App', usage: randomInRange(35, 55), growth: randomFloat(10, 25) },
    ],
    serverHealth: [
      { name: 'Web Server', status: 'healthy', uptime: 99.8 },
      { name: 'Database', status: 'healthy', uptime: 99.9 },
      { name: 'API Gateway', status: 'warning', uptime: 98.5 },
      { name: 'ML Pipeline', status: 'healthy', uptime: 99.2 },
      { name: 'Cache Server', status: 'healthy', uptime: 99.7 },
    ],
    // Nuevos datos para Analytics
    cohortAnalysis: [
      { month: 'Mes 0', cohort1: 100, cohort2: 120, cohort3: 95, cohort4: 110, cohort5: 135, cohort6: 150 },
      { month: 'Mes 1', cohort1: 65, cohort2: 78, cohort3: 62, cohort4: 71, cohort5: 87, cohort6: 0 },
      { month: 'Mes 2', cohort1: 45, cohort2: 54, cohort3: 41, cohort4: 48, cohort5: 0, cohort6: 0 },
      { month: 'Mes 3', cohort1: 32, cohort2: 38, cohort3: 29, cohort4: 0, cohort5: 0, cohort6: 0 },
    ],
    userSegments: [
      { name: 'Empresas', value: 1250, growth: 12, color: '#3B82F6', description: 'Clientes corporativos con alto valor' },
      { name: 'Freelancers', value: 2340, growth: 8, color: '#10B981', description: 'Profesionales independientes' },
      { name: 'Estudiantes', value: 1890, growth: 15, color: '#F59E0B', description: 'Usuarios académicos con descuentos' },
      { name: 'Startups', value: 890, growth: 22, color: '#EF4444', description: 'Empresas emergentes en crecimiento' },
    ],
    featureAdoption: [
      { feature: 'Dashboard', adopted: 4520, total: 5823, trend: 8 },
      { feature: 'API Access', adopted: 2890, total: 5823, trend: 15 },
      { feature: 'Mobile App', adopted: 3450, total: 5823, trend: 22 },
      { feature: 'Analytics', adopted: 2100, total: 5823, trend: 12 },
      { feature: 'Integrations', adopted: 1680, total: 5823, trend: 18 },
    ],
    geographicData: [
      { country: 'Perú', users: 1864, revenue: 89200, growth: 12 },
      { country: 'México', users: 1223, revenue: 67800, growth: 18 },
      { country: 'Colombia', users: 1048, revenue: 52400, growth: 15 },
      { country: 'Argentina', users: 698, revenue: 41900, growth: 8 },
      { country: 'Chile', users: 524, revenue: 31500, growth: 22 },
      { country: 'Brasil', users: 466, revenue: 28000, growth: 25 },
    ],
    // Nuevos datos para Performance
    apiMetrics: (() => {
      const arr: { time: string; requests: number; responseTime: number; errors: number; successRate: number }[] = []
      const now = new Date()
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        const requests = 100 + Math.floor(Math.random() * 200)
        const responseTime = 150 + Math.floor(Math.random() * 300)
        const errors = Math.floor(Math.random() * 10)
        const successRate = 95 + Math.random() * 5
        arr.push({
          time: time.toISOString().substr(11, 5),
          requests,
          responseTime,
          errors,
          successRate: Math.round(successRate * 10) / 10
        })
      }
      return arr
    })(),
    databaseMetrics: (() => {
      const arr: { time: string; connections: number; queries: number; slowQueries: number; cacheHitRate: number; diskUsage: number }[] = []
      const now = new Date()
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        const connections = 20 + Math.floor(Math.random() * 30)
        const queries = 500 + Math.floor(Math.random() * 1000)
        const slowQueries = Math.floor(Math.random() * 20)
        const cacheHitRate = 85 + Math.random() * 15
        const diskUsage = 40 + Math.random() * 30
        arr.push({
          time: time.toISOString().substr(11, 5),
          connections,
          queries,
          slowQueries,
          cacheHitRate: Math.round(cacheHitRate * 10) / 10,
          diskUsage: Math.round(diskUsage * 10) / 10
        })
      }
      return arr
    })(),
    errorLogs: [
      { timestamp: new Date(Date.now() - 300000).toISOString(), level: 'error', message: 'Database connection timeout', count: 3 },
      { timestamp: new Date(Date.now() - 600000).toISOString(), level: 'warning', message: 'High memory usage detected', count: 1 },
      { timestamp: new Date(Date.now() - 900000).toISOString(), level: 'error', message: 'API rate limit exceeded', count: 5 },
      { timestamp: new Date(Date.now() - 1200000).toISOString(), level: 'info', message: 'Scheduled backup completed', count: 1 },
      { timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'warning', message: 'SSL certificate expires soon', count: 1 },
    ],
    // Nuevos datos para Reports
    customReports: [
      { name: 'Reporte Mensual de Usuarios', value: randomInRange(4000, 8000), category: 'Usuarios', trend: randomFloat(-15, 25) },
      { name: 'Análisis de Rendimiento', value: randomFloat(85, 99), category: 'Performance', trend: randomFloat(-10, 20) },
      { name: 'Métricas de Conversión', value: randomFloat(15, 35), category: 'Marketing', trend: randomFloat(-8, 15) },
      { name: 'Informe de Seguridad', value: randomFloat(90, 100), category: 'Seguridad', trend: randomFloat(5, 20) },
      { name: 'Dashboard Analytics', value: randomInRange(800, 1500), category: 'Analytics', trend: randomFloat(10, 30) },
      { name: 'Revenue Report', value: randomInRange(80000, 150000), category: 'Finanzas', trend: randomFloat(8, 25) },
    ],
    scheduledReports: [
      { name: 'Dashboard Semanal', frequency: 'Semanal', nextRun: '2024-01-22T09:00:00Z', status: 'active' },
      { name: 'KPIs Mensuales', frequency: 'Mensual', nextRun: '2024-02-01T08:00:00Z', status: 'active' },
      { name: 'Alertas Diarias', frequency: 'Diario', nextRun: '2024-01-16T07:00:00Z', status: 'inactive' },
    ],
    // Historial de exportaciones dinámico
    exportHistory: (() => {
      const fileTypes = ['json', 'pdf', 'csv', 'xlsx']
      const reportTypes = ['Dashboard_Analytics', 'Performance_Report', 'User_Metrics', 'Complete_Dashboard', 'Revenue_Analysis', 'Security_Report']
      const arr: { name: string; date: string; size: string }[] = []
      
      for (let i = 0; i < 4; i++) {
        const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)]
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)]
        const year = 2024
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
        const sizeValue = randomFloat(0.5, 5.0)
        const sizeUnit = sizeValue > 1 ? 'MB' : 'KB'
        const displaySize = sizeValue > 1 ? sizeValue.toFixed(1) : (sizeValue * 1000).toFixed(0)
        
        arr.push({
          name: `${reportType}_${year}-${month}.${fileType}`,
          date: `${year}-${month}-${day}`,
          size: `${displaySize} ${sizeUnit}`
        })
      }
      
      return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })(),
    // Métricas adicionales dinámicas para Analytics
    analyticsMetrics: {
      bounceRate: randomFloat(20, 30),
      pagesPerSession: randomFloat(3.0, 4.5),
      sessionDuration: `${randomInRange(4, 7)}:${String(randomInRange(10, 59)).padStart(2, '0')}`,
      returningUsers: randomFloat(60, 75)
    },
    // Métricas de performance dinámicas
    performanceMetrics: {
      cpuUsage: randomFloat(60, 80),
      memoryUsage: randomFloat(3.5, 5.5),
      responseTime: randomFloat(0.8, 2.0),
      uptime: randomFloat(99.5, 99.9)
    },
    // Métricas de reportes dinámicas
    reportsMetrics: {
      totalReports: randomInRange(140, 180),
      scheduledReports: randomInRange(20, 30),
      totalDownloads: randomInRange(1100, 1400),
      automationRate: randomFloat(85, 95)
    },
    // Métricas adicionales dinámicas para diferentes secciones
    additionalMetrics: {
      activeModels: randomInRange(8, 15),
      successRate: randomFloat(90, 98),
      avgResponseTime: randomFloat(1.5, 3.5),
      userGrowth: randomFloat(15, 35),
      retention: randomFloat(80, 95),
      conversion: randomFloat(8, 18),
      engagement: randomFloat(3, 6),
      requestsPerMin: randomInRange(800, 1800),
      errorRate: randomFloat(0.05, 0.25),
      cacheHit: randomFloat(88, 97),
      throughput: randomFloat(1.8, 3.2)
    }
  })

  return { getDashboardData }
}
