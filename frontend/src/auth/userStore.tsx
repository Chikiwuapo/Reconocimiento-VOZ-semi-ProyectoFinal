import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { read, write, exists } from './storage'
import type { AppUser, ModelSummary, Mission, UserProfile, Course, TestedModel } from './types'

const STORAGE_KEY = 'appUser'

function migrateUser(u: Partial<AppUser> | null): AppUser {
  if (!u) return { profile: { id: `u_${Date.now()}`, name: 'Usuario', email: 'usuario@example.com' }, models: [], missions: defaultMissions, watchedCourses: [], testedModels: [] }
  const hasRichMissions = Array.isArray(u.missions) && u.missions.length > 0 && (u.missions as any)[0]?.title
  const missions = hasRichMissions ? (u.missions as Mission[]) : defaultMissions
  return {
    profile: {
      id: u.profile?.id || `u_${Date.now()}`,
      name: u.profile?.name || 'Usuario',
      email: u.profile?.email || 'usuario@example.com',
      avatarDataUrl: u.profile?.avatarDataUrl,
    },
    models: u.models || [],
    missions,
    watchedCourses: u.watchedCourses || [],
    testedModels: u.testedModels || [],
  }
}

// Misiones por defecto (extraídas de MissionsPanel, sin íconos)
const defaultMissions: Mission[] = [
  { id: 1,  title: 'Entrenar Modelo de Vocales', description: 'Completa el entrenamiento del modelo de reconocimiento de vocales con 1200 audios', type: 'training',    progress: 0, completed: false, reward: '🎯 +100 XP', difficulty: 'Fácil' },
  { id: 2,  title: 'Optimizar Modelo de Abecedario', description: 'Mejora la precisión del modelo de letras (A-Z + Ñ) al 95%',                  type: 'optimization', progress: 0, completed: false, reward: '⚡ +150 XP', difficulty: 'Medio' },
  { id: 3,  title: 'Implementar Modelo de Palabras', description: 'Despliega el modelo de reconocimiento de palabras clave con streaming',         type: 'deployment',   progress: 0, completed: false, reward: '🚀 +200 XP', difficulty: 'Difícil' },
  { id: 4,  title: 'Validar Operaciones Aritméticas', description: 'Prueba y valida el modelo de operaciones matemáticas básicas',                  type: 'validation',   progress: 0, completed: false, reward: '💎 +250 XP', difficulty: 'Experto' },
  { id: 5,  title: 'Dominar Reconocimiento de Manos', description: 'Completa el curso de MediaPipe para reconocimiento de gestos',                  type: 'course',       progress: 0, completed: false, reward: '🤖 +180 XP', difficulty: 'Medio' },
  { id: 6,  title: 'Especialista en Reconocimiento Facial', description: 'Finaliza el curso avanzado de detección y reconocimiento facial',         type: 'course',       progress: 0, completed: false, reward: '👁️ +220 XP', difficulty: 'Difícil' },
  { id: 7,  title: 'Maestro de Voz con IA', description: 'Completa el curso especializado en reconocimiento de voz',                                type: 'course',       progress: 0, completed: false, reward: '🎤 +200 XP', difficulty: 'Difícil' },
  { id: 8,  title: 'Operaciones Matemáticas Gestuales', description: 'Domina las operaciones matemáticas con reconocimiento de manos',               type: 'course',       progress: 0, completed: false, reward: '🧮 +190 XP', difficulty: 'Medio' },
  { id: 9,  title: 'Desarrollador de Agente IA', description: 'Crea tu propio agente de inteligencia artificial avanzado',                         type: 'course',       progress: 0, completed: false, reward: '🤖 +300 XP', difficulty: 'Experto' },
  { id: 10, title: 'Constructor de Chatbots', description: 'Desarrolla chatbots automatizados con IA conversacional',                              type: 'course',       progress: 0, completed: false, reward: '💬 +250 XP', difficulty: 'Difícil' },
  { id: 11, title: 'Detector de Emociones', description: 'Prepárate para el curso de detección de emociones en voz',                               type: 'future',       progress: 0, completed: false, reward: '❤️ +350 XP', difficulty: 'Experto' },
  { id: 12, title: 'Traductor Universal', description: 'Anticípate al curso de traducción automática en tiempo real',                              type: 'future',       progress: 0, completed: false, reward: '🌍 +400 XP', difficulty: 'Legendario' },
  { id: 13, title: 'Maestro de Modelos', description: 'Completa todos los entrenamientos de modelos de reconocimiento',                             type: 'master',       progress: 0, completed: false, reward: '🧠 +500 XP', difficulty: 'Legendario' },
  { id: 14, title: 'Graduado en IA', description: 'Finaliza todos los cursos disponibles de inteligencia artificial',                               type: 'master',       progress: 0, completed: false, reward: '🎓 +800 XP', difficulty: 'Legendario' },
  { id: 15, title: 'Pionero del Blackboard', description: 'Completa todas las misiones y conviértete en un experto total',                         type: 'ultimate',     progress: 0, completed: false, reward: '👑 +1000 XP', difficulty: 'Legendario' },
]

function createInitialUser(): AppUser {
  return {
    profile: {
      id: `u_${Date.now()}`,
      name: 'Usuario',
      email: 'usuario@example.com',
      avatarDataUrl: undefined,
    },
    models: [],
    missions: defaultMissions,
    watchedCourses: [],
    testedModels: [],
  }
}

export function ensureUserInitialized() {
  if (!exists(STORAGE_KEY)) {
    const initial = createInitialUser()
    write<AppUser>(initial, STORAGE_KEY)
  } else {
    // also ensure fields exist if older schema
    const current = read<AppUser>(STORAGE_KEY)
    const merged = migrateUser(current)
    write<AppUser>(merged, STORAGE_KEY)
  }
}

// Context
interface Ctx {
  user: AppUser
  setUser: React.Dispatch<React.SetStateAction<AppUser>>
  addModel: (model: Omit<ModelSummary, 'id' | 'createdAt'> & { id?: string }) => ModelSummary
  setModels: (models: ModelSummary[]) => void
  removeModel: (id: string) => void
  toggleFavorite: (id: string) => void
  setMissions: (missions: Mission[]) => void
  completeMission: (id: number) => void
  setMissionCompletion: (id: number, completed: boolean) => void
  updateProfile: (data: Partial<UserProfile>) => void
  setAvatar: (dataUrl?: string) => void
  recordCourseCompleted: (course: Course) => void
  recordModelTested: (tested: TestedModel) => void
  updateModel: (id: string, patch: Partial<ModelSummary>) => void
}

const UserContext = createContext<Ctx | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(() => {
    const data = read<AppUser>(STORAGE_KEY)
    return migrateUser(data)
  })

  // persist on change
  useEffect(() => {
    write(user, STORAGE_KEY)
  }, [user])

  // actions
  const addModel: Ctx['addModel'] = (modelInput) => {
    const newModel: ModelSummary = {
      id: modelInput.id || `model_${Date.now()}`,
      name: modelInput.name,
      description: modelInput.description,
      type: modelInput.type,
      icon: modelInput.icon,
      image: modelInput.image,
      bgColor: modelInput.bgColor,
      color: modelInput.color,
      status: modelInput.status ?? 'pending',
      accuracy: modelInput.accuracy ?? 0,
      isActive: modelInput.isActive ?? false,
      favorite: modelInput.favorite ?? false,
      createdAt: new Date().toISOString(),
    }
    setUser(prev => ({ ...prev, models: [...prev.models, newModel] }))

    return newModel
  }

  const setModels: Ctx['setModels'] = (models) => {
    setUser(prev => ({ ...prev, models }))
  }

  const removeModel: Ctx['removeModel'] = (id) => {
    setUser(prev => ({ ...prev, models: prev.models.filter(m => m.id !== id) }))
  }

  const toggleFavorite: Ctx['toggleFavorite'] = (id) => {
    setUser(prev => ({
      ...prev,
      models: prev.models.map(m => m.id === id ? { ...m, favorite: !m.favorite } : m)
    }))
  }

  const setMissions: Ctx['setMissions'] = (missions) => {
    setUser(prev => ({ ...prev, missions }))
  }

  const completeMission: Ctx['completeMission'] = (id) => {
    setUser(prev => ({
      ...prev,
      missions: prev.missions.map(m => m.id === id ? { ...m, completed: true, progress: 100 } : m)
    }))
  }

  const setMissionCompletion: Ctx['setMissionCompletion'] = (id, completed) => {
    setUser(prev => ({
      ...prev,
      missions: prev.missions.map(m => m.id === id ? { ...m, completed, progress: completed ? 100 : m.progress } : m)
    }))
  }

  const updateProfile: Ctx['updateProfile'] = (data) => {
    setUser(prev => ({
      ...prev,
      profile: { ...prev.profile, ...data }
    }))
  }

  const setAvatar: Ctx['setAvatar'] = (dataUrl) => {
    setUser(prev => ({
      ...prev,
      profile: { ...prev.profile, avatarDataUrl: dataUrl }
    }))
  }

  const recordCourseCompleted: Ctx['recordCourseCompleted'] = (course) => {
    setUser(prev => {
      const exists = prev.watchedCourses.some(c => c.id === course.id)
      const list = exists
        ? prev.watchedCourses.map(c => c.id === course.id ? { ...c, completed: true, progress: '100%' } : c)
        : [...prev.watchedCourses, { ...course, completed: true, progress: '100%' }]
      return { ...prev, watchedCourses: list }
    })
  }

  const recordModelTested: Ctx['recordModelTested'] = (tested) => {
    setUser(prev => {
      const exists = prev.testedModels.some(t => t.id === tested.id)
      if (exists) return prev
      return { ...prev, testedModels: [...prev.testedModels, { ...tested, tested: true }] }
    })
  }

  const updateModel: Ctx['updateModel'] = (id, patch) => {
    setUser(prev => ({
      ...prev,
      models: prev.models.map(m => m.id === id ? { ...m, ...patch } : m)
    }))
  }

  const value = useMemo<Ctx>(() => ({
    user,
    setUser,
    addModel,
    setModels,
    removeModel,
    toggleFavorite,
    setMissions,
    completeMission,
    setMissionCompletion,
    updateProfile,
    setAvatar,
    recordCourseCompleted,
    recordModelTested,
    updateModel,
  }), [user])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserStore() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserStore must be used within UserProvider')
  return ctx
}
