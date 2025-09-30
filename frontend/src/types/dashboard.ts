// Tipos compartidos para el dashboard

export interface ModelUsage {
  name: string
  percentage: number
  usageCount: number
}

export interface SystemMetrics {
  cpu: {
    usage: number
    temperature: number
    cores: number
  }
  ram: {
    percentage: number
    used: number
    total: number
  }
  storage: {
    percentage: number
    used: number
    total: number
  }
  network: {
    latency: number
    downloadSpeed: number
    uploadSpeed: number
  }
}
