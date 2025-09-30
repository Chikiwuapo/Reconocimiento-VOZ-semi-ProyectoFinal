export interface ModelType {
  id: string
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  duration: string
  difficulty: string
  type: string
  image: string
  status?: string
  accuracy?: number
  createdAt?: Date
  trainingData?: any[]
  isActive?: boolean
}

export interface TrainingSession {
  id: string
  modelId: string
  startTime: Date
  endTime?: Date
  progress: number
  status: 'pending' | 'training' | 'completed' | 'failed'
  samples: number
}

export interface ModelStats {
  totalModels: number
  activeModels: number
  totalTrainingSessions: number
  averageAccuracy: number
}

// Re-export all dashboard types
export * from './dashboard';