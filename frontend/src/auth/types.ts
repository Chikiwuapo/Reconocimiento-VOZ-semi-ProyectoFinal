export type MissionType = 'training' | 'optimization' | 'deployment' | 'validation' | 'course' | 'future' | 'master' | 'ultimate'

export type Mission = {
  id: number
  title: string
  description: string
  type: MissionType
  progress: number
  completed: boolean
  reward: string
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Experto' | 'Legendario'
}

export type Course = {
  id: string
  title: string
  progress: string
  img: string
  completed?: boolean
}

export type TestedModel = {
  id: string
  title: string
  result: string
  color: string
  tested?: boolean
}

export type ModelSummary = {
  id: string
  name: string
  description: string
  type: string
  icon?: string
  image?: string
  bgColor?: string
  color?: string
  status?: 'pending' | 'training' | 'Completado' | 'completed'
  accuracy?: number
  isActive?: boolean
  favorite?: boolean
  createdAt: string // ISO string
  duration?: string
  difficulty?: string
}

export type UserProfile = {
  id: string
  name: string
  email: string
  avatarDataUrl?: string
}

export type AppUser = {
  profile: UserProfile
  models: ModelSummary[]
  missions: Mission[]
  watchedCourses: Course[]
  testedModels: TestedModel[]
}
