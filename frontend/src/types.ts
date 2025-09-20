// Shared app types used in pages and components

export type ModelType = {
  id: string
  name: string
  description: string
  type: string
  icon?: string
  color: string
  bgColor: string
  duration?: string
  difficulty?: string
  image: string
  status?: 'pending' | 'Entrenando' | 'completed' | 'Completado'
  accuracy?: number
  isActive: boolean
  createdAt?: Date
  trainingData?: any[]
}

export type TrainingSession = {
  id: string
  modelId: string
  startTime: Date
  endTime?: Date
  progress: number
  status: 'training' | 'completed'
  samples: number
}

export type ModelStats = {
  totalModels: number
  activeModels: number
  totalTrainingSessions: number
  averageAccuracy: number
}
